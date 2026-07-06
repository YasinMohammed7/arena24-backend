import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  GoneException,
  UnprocessableEntityException,
  ForbiddenException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { type StringValue } from "ms";
import * as bcrypt from "bcryptjs";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { SafeUser } from "./dto/safe-user.dto";
import * as crypto from "node:crypto";
import { RolesService } from "./roles/roles.service";
import { MailService } from "@/mail/mail.service";
import { SmsService } from "@/sms/sms.service";
import { InjectRepository } from "@nestjs/typeorm";
import { MoreThan, Repository } from "typeorm";
import { User } from "@/database/entities/user";
import { VerificationCodes } from "@/database/entities/verificationCodes";
import { Role } from "@/database/entities/role";
import { RefreshTokens } from "@/database/entities/refreshTokens";
import { PasswordResetTokens } from "@/database/entities/passwordResetTokens";

@Injectable()
export class AuthService {
  constructor(
    private jwt: JwtService,
    private rolesService: RolesService, // Inject RolesService
    private mailService: MailService, // Inject MailService for sending emails
    private smsService: SmsService, // Inject SmsService for sending SMS
    @InjectRepository(User) private readonly userRepo: Repository<User>, // Inject User repository
    @InjectRepository(VerificationCodes)
    private readonly verificationCodeRepo: Repository<VerificationCodes>, // Inject VerificationCodes repository
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(RefreshTokens)
    private readonly refreshTokensRepo: Repository<RefreshTokens>, // Inject RefreshTokens repository
    @InjectRepository(PasswordResetTokens)
    private readonly passwordResetTokensRepo: Repository<PasswordResetTokens> // Inject PasswordResetTokens repository
  ) {}

  async sendVerificationCode(contact: string): Promise<{ message: string }> {
    const code = Math.floor(1000 + Math.random() * 9000).toString();

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10);

    await this.verificationCodeRepo.upsert(
      {
        contact,
        code,
        expiresAt,
      },
      ["contact"]
    );

    const isEmail = contact.includes("@");

    if (isEmail) {
      await this.mailService.sendVerificationCode(contact, code);
    } else {
      await this.smsService.sendVerificationCode(contact, code);
      console.log(`SMS verification code for ${contact}: ${code}`);
    }

    return {
      message: "Verification code sent successfully",
    };
  }

  async verifyCode(
    contact: string,
    code: string
  ): Promise<{ message: string; valid: boolean }> {
    const verificationRecord = await this.verificationCodeRepo.findOne({
      where: {
        contact,
        code,
      },
    });

    if (!verificationRecord) {
      throw new UnprocessableEntityException("Invalid verification code");
    }

    if (verificationRecord.expiresAt <= new Date()) {
      await this.verificationCodeRepo.delete({
        id: verificationRecord.id,
      });

      throw new GoneException("Verification code has expired");
    }

    await this.verificationCodeRepo.delete({
      id: verificationRecord.id,
    });

    return {
      message: "Verification code is valid",
      valid: true,
    };
  }

  async register(
    registerDto: RegisterDto
  ): Promise<{ message: string; data: SafeUser }> {
    const { email, password, phone } = registerDto;

    const userExists = await this.userRepo.findOne({
      where: [{ email }, { phone }],
      select: {
        id: true,
      },
    });

    if (userExists) {
      throw new ConflictException("Email or phone already taken.");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const userToCreate = this.userRepo.create({
      ...registerDto,
      password: hashedPassword,
    });

    const user = await this.userRepo.save(userToCreate);

    const {
      password: _password,
      ownerId: _ownerId,
      isActive: _isActive,
      deletedAt: _deletedAt,
      ...userWithoutSensitiveFields
    } = user;

    // Assign default role to the user after registration
    const clientUserRole = await this.roleRepo.findOne({
      where: { name: "CLIENT_USER" },
      select: {
        id: true,
        name: true,
      },
    });

    if (!clientUserRole) {
      throw new Error("CLIENT_USER role not found in the database");
    }

    // Call assignRoleToUser through rolesService
    await this.rolesService.assignRoleToUser(user.id, clientUserRole.id);

    return {
      message: "User created successfully",
      data: userWithoutSensitiveFields,
    };
  }

  async login(data: LoginDto): Promise<{
    message: string;
    data: SafeUser;
    access_token: string;
    refresh_token: string;
  }> {
    const user = await this.userRepo.findOne({
      where: { email: data.email },
    });

    if (!user || !(await bcrypt.compare(data.password, user.password))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    // Check if user is soft deleted
    if (user.deletedAt) {
      throw new UnauthorizedException("User account no longer exists");
    }

    // Check if user is active
    if (!user.isActive) {
      throw new UnauthorizedException("User account is deactivated");
    }

    const payload = { sub: user.id, email: user.email };
    const accessToken = await this.jwt.signAsync(payload, {
      expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRY as StringValue) || "30m", // Token expiration time from env
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
      message: "Login successful",
      data: userWithoutSensitiveFields,
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  async storeRefreshToken(userId: string, refreshToken: string) {
    const expirationDate = new Date();
    // Use environment variable for refresh token expiry
    const expiryTime = process.env.JWT_REFRESH_TOKEN_EXPIRY || "1y";

    if (expiryTime.endsWith("y")) {
      const years = parseInt(expiryTime.slice(0, -1));
      expirationDate.setFullYear(expirationDate.getFullYear() + years);
    } else if (expiryTime.endsWith("d")) {
      const days = parseInt(expiryTime.slice(0, -1));
      expirationDate.setDate(expirationDate.getDate() + days);
    }

    const tokenToCreate = this.refreshTokensRepo.create({
      token: refreshToken,
      userId,
      expiresAt: expirationDate,
    });

    await this.refreshTokensRepo.save(tokenToCreate);
  }

  async refreshToken(currentRefreshToken: string) {
    // Verify the refresh token exists and is valid
    const storedToken = await this.refreshTokensRepo.findOne({
      where: {
        token: currentRefreshToken,
        expiresAt: MoreThan(new Date()),
      },
      relations: {
        user: true,
      },
      select: {
        id: true,
        token: true,
        userId: true,
        expiresAt: true,
        user: {
          id: true,
          email: true,
          name: true,
          isActive: true,
          deletedAt: true,
        },
      },
    });

    if (!storedToken) {
      throw new ForbiddenException("Invalid or expired refresh token");
    }

    // Check if user is soft deleted
    if (storedToken.user.deletedAt) {
      // Delete all refresh tokens for this user
      await this.refreshTokensRepo.delete({
        userId: storedToken.user.id,
      });
      throw new UnauthorizedException("User account no longer exists");
    }

    // Check if user is active
    if (!storedToken.user.isActive) {
      // Delete all refresh tokens for this user
      await this.refreshTokensRepo.delete({
        userId: storedToken.user.id,
      });
      throw new UnauthorizedException("User account is deactivated");
    }

    // Generate new access token
    const payload = { sub: storedToken.user.id, email: storedToken.user.email };
    const newAccessToken = await this.jwt.signAsync(payload, {
      expiresIn: (process.env.JWT_ACCESS_TOKEN_EXPIRY as StringValue) || "30m",
    });

    // Generate new refresh token
    const newRefreshToken = crypto.randomUUID();

    // Delete old refresh token and store new one
    await this.refreshTokensRepo.delete({
      id: storedToken.id,
    });

    await this.storeRefreshToken(storedToken.user.id, newRefreshToken);

    return {
      message: "Tokens refreshed successfully",
      access_token: newAccessToken,
      refresh_token: newRefreshToken,
    };
  }

  async logout(
    userId: string,
    refreshToken: string
  ): Promise<{ message: string }> {
    // Delete the specific refresh token
    await this.refreshTokensRepo.delete({
      userId,
      token: refreshToken,
    });

    return {
      message: "Logout successful",
    };
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto
  ): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;

    const user = await this.userRepo.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
      },
    });

    if (!user) {
      // Don't reveal if email exists or not for security
      return {
        message: "If the email exists, a password reset link has been sent",
      };
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setMinutes(resetTokenExpiry.getMinutes() + 10); // Token expires in 10 min

    // Store reset token in database
    await this.passwordResetTokensRepo.upsert(
      {
        userId: user.id,
        token: resetToken,
        expiresAt: resetTokenExpiry,
      },
      ["userId"]
    );

    await this.mailService.sendPasswordResetEmail(email, resetToken);

    return {
      message: "If the email exists, a password reset link has been sent",
    };
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto
  ): Promise<{ message: string }> {
    const { token, password } = resetPasswordDto;

    // Find valid reset token
    const resetTokenRecord = await this.passwordResetTokensRepo.findOne({
      where: {
        token,
        expiresAt: MoreThan(new Date()),
      },
      select: {
        id: true,
        userId: true,
        token: true,
        expiresAt: true,
      },
    });

    if (!resetTokenRecord) {
      throw new BadRequestException("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Update user password
    await this.userRepo.update(resetTokenRecord.userId, {
      password: hashedPassword,
    });

    // Delete used reset token
    await this.passwordResetTokensRepo.delete({
      id: resetTokenRecord.id,
    });

    // Delete all refresh tokens for this user (force re-login)
    await this.refreshTokensRepo.delete({
      userId: resetTokenRecord.userId,
    });

    return {
      message: "Password reset successful",
    };
  }
}
