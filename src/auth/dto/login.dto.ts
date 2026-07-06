import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({ example: "email@domain.com", description: "email address" })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: "yourpassword", description: "user password" })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class UserDataDto {
  @ApiProperty({
    example: "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
    format: "uuid",
  })
  @IsUUID()
  id: string;

  @ApiProperty({ example: "user@email.tld" })
  @IsEmail()
  email: string;

  @ApiProperty({ example: "User Name" })
  @IsString()
  name: string;

  @ApiProperty({ example: "1234567890" })
  @IsString()
  phone: string;

  @ApiProperty({ example: "2025-08-11T13:16:54.339Z" })
  @IsDateString()
  createdAt: string;

  @ApiProperty({ example: "2025-08-11T13:16:54.339Z" })
  @IsDateString()
  updatedAt: string;

  @ApiProperty({
    example: "8abbbc42-e2f8-4b67-9be6-e3a659eaa525",
    nullable: true,
    format: "uuid",
  })
  @IsOptional()
  @IsUUID()
  ownerId: string | null;
}

export class LoginResponseDto {
  @ApiProperty({ example: "Login successful", description: "Response message" })
  @IsString()
  message: string;

  @ApiProperty({ type: UserDataDto })
  data: UserDataDto;

  @ApiProperty({ example: "access_token", description: "JWT access token" })
  @IsString()
  access_token: string;

  @ApiProperty({ example: "refresh_token", description: "JWT refresh token" })
  @IsString()
  refresh_token: string;
}
