import { IsString, IsOptional, MaxLength } from "class-validator";

export class UpdateBusinessDto {
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
