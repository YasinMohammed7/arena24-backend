import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { CurrentUser } from "./decorators/current-user.decorator";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto, LoginResponseDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { SendVerificationDto } from "./dto/send-verification.dto";
import { VerifyCodeDto } from "./dto/verify-code.dto";
import { AuthGuard } from "@nestjs/passport";
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiGoneResponse,
  ApiOkResponse,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from "@nestjs/swagger";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("send-verification")
  @ApiOperation({ summary: "Send a verification code by email or SMS" })
  @ApiBody({ type: SendVerificationDto })
  @ApiOkResponse({ description: "Verification code sent successfully" })
  @ApiBadRequestResponse({ description: "Invalid contact payload" })
  async sendVerification(@Body() sendVerificationDto: SendVerificationDto) {
    return this.authService.sendVerificationCode(sendVerificationDto.contact);
  }

  @Post("verify-code")
  @ApiOperation({ summary: "Verify an email or SMS verification code" })
  @ApiBody({ type: VerifyCodeDto })
  @ApiOkResponse({ description: "Verification code is valid" })
  @ApiGoneResponse({ description: "Verification code has expired" })
  @ApiUnprocessableEntityResponse({ description: "Invalid verification code" })
  @ApiBadRequestResponse({ description: "Invalid verification payload" })
  async verifyCode(@Body() verifyCodeDto: VerifyCodeDto) {
    return this.authService.verifyCode(
      verifyCodeDto.contact,
      verifyCodeDto.code
    );
  }

  @Post("register")
  @ApiOperation({ summary: "Register a new user" })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ status: 201, description: "User created successfully" })
  @ApiBadRequestResponse({ description: "Invalid register payload" })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @ApiOperation({ summary: "Login with email and password" })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 201,
    description: "Login successful",
    type: LoginResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: "Invalid credentials or inactive account",
  })
  @Post("login")
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @UseGuards(AuthGuard("jwt"))
  @Post("logout")
  @ApiOperation({ summary: "Logout using a refresh token" })
  @ApiBearerAuth("access-token")
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: "Logout successful" })
  @ApiUnauthorizedResponse({ description: "Invalid or missing access token" })
  @ApiBadRequestResponse({ description: "Invalid refresh token payload" })
  logout(@CurrentUser("id") userId: string, @Body() body: RefreshTokenDto) {
    return this.authService.logout(userId, body.refreshToken);
  }

  @Post("forgot-password")
  @ApiOperation({ summary: "Request a password reset link" })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: "Password reset link response returned" })
  @ApiBadRequestResponse({ description: "Invalid forgot password payload" })
  forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post("reset-password")
  @ApiOperation({ summary: "Reset password using a reset token" })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({ description: "Password reset successful" })
  @ApiBadRequestResponse({ description: "Invalid or expired reset token" })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post("refresh-token")
  @ApiOperation({ summary: "Refresh access and refresh tokens" })
  @ApiBody({ type: RefreshTokenDto })
  @ApiOkResponse({ description: "Tokens refreshed successfully" })
  @ApiUnauthorizedResponse({ description: "User account is unavailable" })
  @ApiBadRequestResponse({ description: "Invalid refresh token payload" })
  refreshToken(@Body() body: RefreshTokenDto) {
    return this.authService.refreshToken(body.refreshToken);
  }
}
