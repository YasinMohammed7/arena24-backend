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
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";

import { ReservationService } from "./reservation.service";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";

import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";

@ApiTags("Reservations")
@Controller("reservations")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class ReservationController {
  constructor(private readonly reservationService: ReservationService) {}

  @Post()
  @ApiOperation({ summary: "Create a new reservation" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Reservation created successfully",
  })
  @ApiBadRequestResponse({
    description:
      "Invalid input data, invalid capacity, or both eventId and locationId were provided",
  })
  @ApiNotFoundResponse({
    description: "User, event, or location not found",
  })
  create(
    @Body() createReservationDto: CreateReservationDto,
    @CurrentUser("id") userId: string
  ) {
    return this.reservationService.create(createReservationDto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get all reservations" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reservations retrieved successfully",
  })
  findAll() {
    return this.reservationService.findAll();
  }

  @Get("by-event/:eventId")
  @ApiOperation({ summary: "Get reservations by event" })
  @ApiParam({
    name: "eventId",
    type: "number",
    description: "Event ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Event reservations retrieved successfully",
  })
  findByEvent(@Param("eventId", ParseIntPipe) eventId: number) {
    return this.reservationService.findByEvent(eventId);
  }

  @Get("by-location/:locationId")
  @ApiOperation({ summary: "Get reservations by location" })
  @ApiParam({
    name: "locationId",
    type: "number",
    description: "Location ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location reservations retrieved successfully",
  })
  findByLocation(@Param("locationId", ParseIntPipe) locationId: number) {
    return this.reservationService.findByLocation(locationId);
  }

  @Get("by-user/:userId")
  @ApiOperation({ summary: "Get reservations by user" })
  @ApiParam({
    name: "userId",
    type: "string",
    description: "User ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User reservations retrieved successfully",
  })
  findByUser(@Param("userId") userId: string) {
    return this.reservationService.findByUser(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get reservation by ID" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Reservation ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reservation retrieved successfully",
  })
  @ApiNotFoundResponse({
    description: "Reservation not found",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.reservationService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a reservation" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Reservation ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reservation updated successfully",
  })
  @ApiNotFoundResponse({
    description: "Reservation not found",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateReservationDto: UpdateReservationDto
  ) {
    return this.reservationService.update(id, updateReservationDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a reservation" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Reservation ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reservation deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Reservation with ID 1 has been deleted",
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Reservation not found",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.reservationService.remove(id);
  }
}
