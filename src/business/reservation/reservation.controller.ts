import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  Request,
} from '@nestjs/common';
import { ReservationService } from './reservation.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

interface AuthenticatedRequest extends Request {
  user: {
    id: string;
    email: string;
    name: string;
    phone: string;
    [key: string]: any;
  };
}

@Controller('business/reservation')
@UseGuards(JwtAuthGuard)
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  create(
    @Body() createReservationDto: CreateReservationDto,
    @Request() req: AuthenticatedRequest,
  ) {
    return this.reservationService.create(createReservationDto, req.user);
  }

  @Get()
  findAll() {
    return this.reservationService.findAll();
  }

  @Get('by-event/:eventId')
  findByEvent(@Param('eventId', ParseIntPipe) eventId: number) {
    return this.reservationService.findByEvent(eventId);
  }

  @Get('by-location/:locationId')
  findByLocation(@Param('locationId', ParseIntPipe) locationId: number) {
    return this.reservationService.findByLocation(locationId);
  }

  @Get('by-user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.reservationService.findByUser(userId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto,
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.reservationService.remove(id);
  }
}
