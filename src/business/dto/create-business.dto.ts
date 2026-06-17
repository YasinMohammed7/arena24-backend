import { IsString, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateBusinessDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
