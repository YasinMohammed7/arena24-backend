import { IsString, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class CreateFacilityDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean = true;
}
