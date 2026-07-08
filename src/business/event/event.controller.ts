import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
} from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";

import { EventService } from "./event.service";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";

import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

import { eventCoverUploadOptions, MAX_EVENT_COVER_SIZE } from "./multer.config";

const coverFilePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [new MaxFileSizeValidator({ maxSize: MAX_EVENT_COVER_SIZE })],
});

@ApiTags("Events")
@Controller("events")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:event"]
  )
  @Post()
  @ApiOperation({ summary: "Create a new event" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: [
        "name",
        "date",
        "startHour",
        "endHour",
        "address",
        "locationId",
      ],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        date: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T00:00:00.000Z",
        },
        startHour: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T18:00:00.000Z",
        },
        endHour: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T21:00:00.000Z",
        },
        address: { type: "string" },
        price: {
          type: "string",
          example: "120.00",
        },
        maxPeople: { type: "number" },
        locationId: { type: "number" },
        facilityIds: {
          type: "array",
          items: { type: "number" },
          example: [1, 2, 3],
        },
        includedOptions: {
          type: "array",
          items: { type: "string" },
          example: ["Welcome drink", "Snacks"],
        },
        requirements: {
          type: "array",
          items: { type: "string" },
          example: ["Minimum age 18"],
        },
        cover: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Event created successfully",
  })
  @ApiBadRequestResponse({
    description:
      "Invalid input data, location not found, or invalid cover file",
  })
  @UseInterceptors(FileInterceptor("cover", eventCoverUploadOptions))
  create(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile(coverFilePipe) file?: Express.Multer.File
  ) {
    const eventData = {
      ...createEventDto,
      imageUrl: file
        ? `/uploads/events/cover/${file.filename}`
        : createEventDto.imageUrl,
    };

    return this.eventService.create(eventData);
  }

  @Get()
  @ApiOperation({ summary: "Get all events" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Events retrieved successfully",
  })
  findAll() {
    return this.eventService.findAll();
  }

  @Get("location/:locationId")
  @ApiOperation({ summary: "Get events by location" })
  @ApiParam({
    name: "locationId",
    type: "number",
    description: "Location ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location events retrieved successfully",
  })
  findByLocation(@Param("locationId", ParseIntPipe) locationId: number) {
    return this.eventService.findByLocation(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get event by ID" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Event ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Event retrieved successfully",
  })
  @ApiNotFoundResponse({
    description: "Event not found",
  })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.eventService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:event"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update an event" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Event ID",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        date: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T00:00:00.000Z",
        },
        startHour: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T18:00:00.000Z",
        },
        endHour: {
          type: "string",
          format: "date-time",
          example: "2026-07-06T21:00:00.000Z",
        },
        address: { type: "string" },
        price: {
          type: "string",
          example: "120.00",
        },
        maxPeople: { type: "number" },
        locationId: { type: "number" },
        facilityIds: {
          type: "array",
          items: { type: "number" },
          example: [1, 2, 3],
        },
        includedOptions: {
          type: "array",
          items: { type: "string" },
          example: ["Welcome drink", "Snacks"],
        },
        requirements: {
          type: "array",
          items: { type: "string" },
          example: ["Minimum age 18"],
        },
        cover: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Event updated successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or invalid cover file",
  })
  @ApiNotFoundResponse({
    description: "Event not found",
  })
  @UseInterceptors(FileInterceptor("cover", eventCoverUploadOptions))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile(coverFilePipe) file?: Express.Multer.File
  ) {
    const eventData = {
      ...updateEventDto,
      ...(file && {
        imageUrl: `/uploads/events/cover/${file.filename}`,
      }),
    };

    return this.eventService.update(id, eventData);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:event"]
  )
  @Delete(":id")
  @ApiOperation({ summary: "Delete an event" })
  @ApiParam({
    name: "id",
    type: "number",
    description: "Event ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Event deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Event deleted successfully",
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Event not found",
  })
  @ApiBadRequestResponse({
    description: "Cannot delete event with existing reservations",
  })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.eventService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:event"]
  )
  @Patch(":eventId/facility/:facilityId/toggle-status")
  @ApiOperation({ summary: "Toggle event facility status" })
  @ApiParam({
    name: "eventId",
    type: "number",
    description: "Event ID",
  })
  @ApiParam({
    name: "facilityId",
    type: "number",
    description: "Facility ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Event facility status toggled successfully",
  })
  @ApiNotFoundResponse({
    description: "Event-facility relation not found",
  })
  toggleEventFacilityStatus(
    @Param("eventId", ParseIntPipe) eventId: number,
    @Param("facilityId", ParseIntPipe) facilityId: number
  ) {
    return this.eventService.toggleEventFacilityStatus(eventId, facilityId);
  }
}
