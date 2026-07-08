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
  Query,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ScheduleService } from "./schedule.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@ApiTags("schedule")
@ApiBearerAuth("access-token")
@Controller("schedule")
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:schedule"]
  )
  @Post()
  @ApiOperation({ summary: "Create a schedule" })
  @ApiCreatedResponse({ description: "Schedule created" })
  @ApiNotFoundResponse({ description: "Location not found" })
  @ApiConflictResponse({
    description: "Schedule already exists for this location and day",
  })
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  @ApiOperation({ summary: "List schedules (optionally filtered by location)" })
  @ApiQuery({ name: "locationId", required: false, type: Number })
  @ApiOkResponse({ description: "Array of schedules" })
  findAll(
    @Query("locationId", new ParseIntPipe({ optional: true }))
    locationId?: number
  ) {
    return this.scheduleService.findAll(locationId);
  }

  @Get("location/:locationId")
  @ApiOperation({ summary: "List schedules for a location" })
  @ApiParam({ name: "locationId", type: Number })
  @ApiOkResponse({ description: "Array of schedules for the location" })
  findByLocation(@Param("locationId", ParseIntPipe) locationId: number) {
    return this.scheduleService.findByLocation(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one schedule" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Schedule found" })
  @ApiNotFoundResponse({ description: "Schedule not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:schedule"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update a schedule" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Schedule updated" })
  @ApiNotFoundResponse({ description: "Schedule not found" })
  @ApiConflictResponse({
    description: "Schedule already exists for this location and day",
  })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateScheduleDto: UpdateScheduleDto
  ) {
    return this.scheduleService.update(id, updateScheduleDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:schedule"]
  )
  @Delete(":id")
  @ApiOperation({ summary: "Delete a schedule" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "The deleted schedule" })
  @ApiNotFoundResponse({ description: "Schedule not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
