import {
  IsString,
  IsOptional,
  IsInt,
  IsBoolean,
  IsArray,
  IsNumber,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateLocationDto {
  @IsString()
  type: string;

  @IsString()
  name: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsInt()
  @Type(() => Number)
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsString()
  experience?: string;

  @IsOptional()
  @IsString()
  amenities?: string;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @IsOptional()
  @IsString()
  meniuUrl: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsInt()
  @Type(() => Number)
  businessId: number;

  @IsString()
  ownerId: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsArray()
  schedules?: {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  facilityIds?: number[];

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  amenityIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  managerIds?: string[]; // Array of user IDs to assign as managers

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UserBusinessRoleDto)
  userRoles?: UserBusinessRoleDto[]; // Array of user business role assignments
}

export class UserBusinessRoleDto {
  @IsString()
  userId: string;

  @IsString()
  roleId: string;
}
