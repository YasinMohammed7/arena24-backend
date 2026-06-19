import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class CreateAmenityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  iconUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
