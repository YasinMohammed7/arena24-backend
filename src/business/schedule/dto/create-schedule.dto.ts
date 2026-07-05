import {
  IsNotEmpty,
  IsString,
  IsInt,
  Min,
  Max,
  Matches,
} from "class-validator";
import { Type } from "class-transformer";

export class CreateScheduleDto {
  @Type(() => Number)
  @IsInt()
  locationId: number;

  // ISO 8601 weekday: 1 = Monday ... 7 = Sunday
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(7)
  dayOfWeek: number;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "startTime must be in HH:MM or HH:MM:SS format",
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, {
    message: "endTime must be in HH:MM or HH:MM:SS format",
  })
  endTime: string;
}
