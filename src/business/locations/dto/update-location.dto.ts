import { PartialType } from "@nestjs/mapped-types";
import { CreateLocationDto } from "./create-location.dto";
import { IsOptional, IsBoolean, IsDateString } from "class-validator";

export class UpdateLocationDto extends PartialType(CreateLocationDto) {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsDateString()
  deletedAt?: string;
}
