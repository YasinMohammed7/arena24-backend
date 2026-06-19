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
} from "@nestjs/common";
import { ScheduleService } from "./schedule.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@Controller("business/schedule")
@UseGuards(JwtAuthGuard)
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:schedule"]
  )
  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll() {
    return this.scheduleService.findAll();
  }

  @Get("location/:locationId")
  findByLocation(@Param("locationId", ParseIntPipe) locationId: number) {
    return this.scheduleService.findByLocation(locationId);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.scheduleService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:schedule"]
  )
  @Patch(":id")
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
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.scheduleService.remove(id);
  }
}
