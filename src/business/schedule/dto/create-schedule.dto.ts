import { IsNotEmpty, IsString, IsInt, Matches } from "class-validator";
import { Type } from "class-transformer";

export class CreateScheduleDto {
  @Type(() => Number)
  @IsInt()
  locationId: number;

  @IsNotEmpty()
  @IsString()
  dayOfWeek: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "startTime must be in HH:MM format",
  })
  startTime: string;

  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: "endTime must be in HH:MM format",
  })
  endTime: string;
}
