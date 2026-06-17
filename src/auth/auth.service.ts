import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  GoneException,
  UnprocessableEntityException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import * as crypto from 'node:crypto';
import { RolesService } from './roles/roles.service';
import { MailService } from '@/mail/mail.service';
import { SmsService } from '@/sms/sms.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private rolesService: RolesService, // Inject RolesService
    private mailService: MailService, // Inject MailService for sending emails
    private smsService: SmsService, // Inject SmsService for sending SMS
  ) {}

  async sendVerificationCode(contact: string): Promise<{ message: string }> {
    // Generate 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    // Set expiration to 10 minutes from now
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    // Store or update verification code in database
    await this.prisma.verificationCode.upsert({
      where: { contact },
      update: {
        code,
        expiresAt,
      },
      create: {
        contact,
        code,
        expiresAt,
      },
    });

    // Determine if contact is email or phone and send accordingly
    const isEmail = contact.includes('@');

    if (isEmail) {
      // Send via email
      await this.mailService.sendVerificationCode(contact, code);
    } else {
      // Send via SMS (you'll need to implement SMS service)
      await this.smsService.sendVerificationCode(contact, code);
      // await this.mailService.sendVerificationCode(contact, code);
      console.log(`SMS verification code for ${contact}: ${code}`); // For development
    }

    return {
      message: 'Verification code sent successfully',
    };
  }

  async verifyCode(
    contact: string,
    code: string,
  ): Promise<{ message: string; valid: boolean }> {
    // First, check if a verification code exists for this contact with the provided code (regardless of expiration)
    const verificationRecord = await this.prisma.verificationCode.findFirst({
      where: {
        contact,
        code,
      },
    });

    if (!verificationRecord) {
      // Code doesn't exist for this contact - invalid code
      throw new UnprocessableEntityException('Invalid verification code');
    }

    // Check if the code is expired
    if (verificationRecord.expiresAt <= new Date()) {
      // Code exists but is expired - delete it and throw 410
      await this.prisma.verificationCode.delete({
        where: { id: verificationRecord.id },
      });
      throw new GoneException('Verification code has expired');
    }

    // Code is valid and not expired - delete the used verification code
    await this.prisma.verificationCode.delete({
      where: { id: verificationRecord.id },
    });

    return {
      message: 'Verification code is valid',
      valid: true,
    };
  }

  async register(
    registerDto: RegisterDto,
  ): Promise<{ message: string; data: any }> {
    const { email, password, name, phone } = registerDto;

    const userExists = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { phone: phone }],
      },
    });

    if (userExists)
      throw new ConflictException('Email or phone already taken.');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        ...registerDto,
        password: hashedPassword,
      },
    });

    const {
      password: _password,
      ownerId: _ownerId,
      isActive: _isActive,
      deletedAt: _deletedAt,
      ...userWithoutSensitiveFields
    } = user;
    // Assign default role to the user after registration
    const clientUserRole = await this.prisma.role.findUnique({
      where: { name: 'CLIENT_USER' },
    });
    if (!clientUserRole || !clientUserRole.id) {
      throw new Error('CLIENT_USER role not found in the database');
    }

    // Call assignRoleToUser through rolesService
    await this.rolesService.assignRoleToUser(user.id, clientUserRole.id);

    return {
      message: 'User created successfully',
      data: userWithoutSensitiveFields,
    };
  }

  async login(data: LoginDto): Promise<{
    message: string;
    data: any;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if user is soft deleted
    if (user.deletedAt) {
      throw new UnauthorizedException('User account no longer exists');
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException('User account is deactivated');
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '30m', // Token expiration time from env
    });

    const refreshToken = crypto.randomUUID(); // Generate a random UUID for the refresh token
    await this.storeRefreshToken(user.id, refreshToken);

    const {
      password: _password,
      ownerId: _ownerId,
      isActive: _isActive,
      deletedAt: _deletedAt,
      ...userWithoutSensitiveFields
    } = user;

    return {
      message: 'Login successful',
      data: userWithoutSensitiveFields,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const expirationDate = new Date();
    // Use environment variable for refresh token expiry
    const expiryTime = process.env.JWT_REFRESH_TOKEN_EXPIRY || '1y';

    if (expiryTime.endsWith('y')) {
      const years = parseInt(expiryTime.slice(0, -1));
      expirationDate.setFullYear(expirationDate.getFullYear() + years);
    } else if (expiryTime.endsWith('d')) {
      const days = parseInt(expiryTime.slice(0, -1));
      expirationDate.setDate(expirationDate.getDate() + days);
    }

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: userId,
        expiresAt: expirationDate,
      },
    });
  }

  async refreshToken(currentRefreshToken: string) {
    // Verify the refresh token exists and is valid
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        token: currentRefreshToken,
        expiresAt: {
          gt: new Date(), // Token should not be expired
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            isActive: true,
            deletedAt: true,
          },
        },
      },
    });

    if (!storedToken) {
      throw new ForbiddenException('Invalid or expired refresh token');
    }

    // Check if user is soft deleted
    if (storedToken.user.deletedAt) {
      // Delete all refresh tokens for this user
      await this.prisma.refreshToken.deleteMany({
        where: { userId: storedToken.user.id },
      });
      throw new UnauthorizedException('User account no longer exists');
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      // Delete all refresh tokens for this user
      await this.prisma.refreshToken.deleteMany({
        where: { userId: storedToken.user.id },
      });
      throw new UnauthorizedException('User account is deactivated');
    }

    // Generate new access token
    const payload = { sub: storedToken.user.id, email: storedToken.user.email };
    const newAccessToken = await this.jwt.signAsync(payload, {
      expiresIn: process.env.JWT_ACCESS_TOKEN_EXPIRY || '30m',
    });

    // Generate new refresh token
    const newRefreshToken = crypto.randomUUID();

    // Delete old refresh token and store new one
    await this.prisma.refreshToken.delete({
      where: { id: storedToken.id },
    });

    await this.storeRefreshToken(storedToken.user.id, newRefreshToken);

    return {
      message: 'Tokens refreshed successfully',
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(
    userId: string,
    refreshToken: string,
  ): Promise<{ message: string }> {
    // Delete the specific refresh token
    await this.prisma.refreshToken.deleteMany({
      where: {
        userId: userId,
        token: refreshToken,
      },
    });

    return {
      message: 'Logout successful',
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent',
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 10); // Token expires in 10 min

    // Store reset token in database
    await this.prisma.passwordResetToken.upsert({
      where: { userId: user.id },
      update: {
        token: resetToken,
        expiresAt: resetTokenExpiry,
      },
      create: {
        userId: user.id,
        token: resetToken,
        expiresAt: resetTokenExpiry,
      },
    });

    await this.mailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: 'If the email exists, a password reset link has been sent',
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    // Find valid reset token
    const resetTokenRecord = await this.prisma.passwordResetToken.findFirst({
      where: {
        token: token,
        expiresAt: {
          gt: new Date(), // Token should not be expired
        },
      },
      include: {
        user: true,
      },
    });

    if (!resetTokenRecord) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await this.prisma.user.update({
      where: { id: resetTokenRecord.userId },
      data: { password: hashedPassword },
    });

    // Delete used reset token
    await this.prisma.passwordResetToken.delete({
      where: { id: resetTokenRecord.id },
    });

    // Delete all refresh tokens for this user (force re-login)
    await this.prisma.refreshToken.deleteMany({
      where: { userId: resetTokenRecord.userId },
    });

    return {
      message: 'Password reset successful',
    };
  }
}
