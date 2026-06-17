import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateReservationDto } from './create-reservation.dto';

export class UpdateReservationDto extends PartialType(
  OmitType(CreateReservationDto, ['eventId', 'locationId'] as const),
) {}
