import { IsEmail, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "email@domain.com", description: "email address" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "yourpassword", description: "user password" })
  @IsString()
  password: string;
}

export class UserDataDto {
  @ApiProperty({ example: "8abbbc42-e2f8-4b67-9be6-e3a659eaa525" })
  id: string;

  @ApiProperty({ example: "user@email.tld" })
  email: string;

  @ApiProperty({ example: "User Name" })
  name: string;

  @ApiProperty({ example: "1234567890" })
  phone: string;

  @ApiProperty({ example: null, nullable: true })
  ownerId: string | null;

  @ApiProperty({ example: "2025-08-11T13:16:54.339Z" })
  createdAt: string;

  @ApiProperty({ example: "2025-08-11T13:16:54.339Z" })
  updatedAt: string;
}

export class LoginResponseDto {
  @ApiProperty({ example: "Login successful", description: "Response message" })
  @IsString()
  message: string;

  @ApiProperty({ type: UserDataDto })
  data: UserDataDto;

  @ApiProperty({ example: "access_token", description: "JWT access token" })
  access_token: string;

  @ApiProperty({ example: "refresh_token", description: "JWT refresh token" })
  refresh_token: string;
}
