import {
  IsString,
  IsOptional,
  IsPositive,
  IsArray,
  IsInt,
  Min,
  Matches,
} from "class-validator";
import { Transform, Type } from "class-transformer";
import { Decimal } from "@prisma/client/runtime/library";

export class CreateEventDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "Date must be in YYYY-MM-DD format",
  })
  @Transform(({ value }) => {
    // Ensure we only get the date part if a full datetime is sent
    if (typeof value === "string") {
      return value.split("T")[0];
    }
    return value as string;
  })
  date: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "Start hour must be in H:M or HH:MM format (24-hour format)",
  })
  @Transform(({ value }) => {
    // Ensure we only get the time part if a full datetime is sent
    if (typeof value === "string") {
      // If it contains 'T', it's a datetime string, extract time
      if (value.includes("T")) {
        return value.split("T")[1].substring(0, 5);
      }
      return value;
    }
    return value as string;
  })
  startHour: string;

  @Matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "End hour must be in H:M or HH:MM format (24-hour format)",
  })
  @Transform(({ value }) => {
    // Ensure we only get the time part if a full datetime is sent
    if (typeof value === "string") {
      // If it contains 'T', it's a datetime string, extract time
      if (value.includes("T")) {
        return value.split("T")[1].substring(0, 5);
      }
      return value;
    }
    return value as string;
  })
  endHour: string;

  @IsString()
  address: string;

  @IsOptional()
  @Transform(({ value }) =>
    value == null || value === ""
      ? undefined
      : new Decimal(value as Decimal.Value)
  )
  price?: Decimal;

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
