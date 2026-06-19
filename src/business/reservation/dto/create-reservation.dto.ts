import {
  IsOptional,
  IsInt,
  Min,
  IsEnum,
  ValidateIf,
  IsNotEmpty,
  IsString,
} from "class-validator";
import { ReservationStatus } from "@prisma/client";

export class CreateReservationDto {
  @IsInt()
  @Min(1)
  peopleCount: number;

  @IsOptional()
  @IsString()
  details?: string;

  @IsOptional()
  @IsEnum(ReservationStatus)
  status?: ReservationStatus;

  // Polymorphic relation - exactly one must be provided
  @ValidateIf((o: CreateReservationDto) => !o.locationId)
  @IsNotEmpty({ message: "Either eventId or locationId must be provided" })
  @IsInt()
  eventId?: number;

  @ValidateIf((o: CreateReservationDto) => !o.eventId)
  @IsNotEmpty({ message: "Either eventId or locationId must be provided" })
  @IsInt()
  locationId?: number;
}
