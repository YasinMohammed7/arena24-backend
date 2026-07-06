import {
  IsString,
  IsOptional,
  IsPositive,
  IsArray,
  IsInt,
  Min,
  Matches,
  IsDateString,
} from "class-validator";
import { Transform, Type } from "class-transformer";

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsDateString({}, { message: "Date must be a valid ISO datetime" })
  date: string;

  @IsDateString({}, { message: "Start hour must be a valid ISO datetime" })
  startHour: string;

  @IsDateString({}, { message: "End hour must be a valid ISO datetime" })
  endHour: string;

  @IsString()
  address: string;

  @IsOptional()
  @Transform(({ value }) => {
    if (value === null || value === undefined || value === "") {
      return undefined;
    }

    return String(value);
  })
  @Matches(/^\d+(\.\d{1,2})?$/, {
    message: "Price must be a valid decimal with up to 2 decimals",
  })
  price?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxPeople?: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  @Type(() => Number)
  @IsInt()
  @IsPositive()
  locationId: number;

  @IsOptional()
  @IsArray()
  @Type(() => Number)
  @IsInt({ each: true })
  @IsPositive({ each: true })
  facilityIds?: number[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  includedOptions?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  requirements?: string[];
}
