import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  HttpCode,
  UseGuards,
} from "@nestjs/common";
import { FacilityService } from "./facility.service";
import { CreateFacilityDto } from "./dto/create-facility.dto";
import { UpdateFacilityDto } from "./dto/update-facility.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@Controller("business/facility")
@UseGuards(JwtAuthGuard)
export class FacilityController {
  constructor(private readonly facilityService: FacilityService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:facility"]
  )
  @Post()
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilityService.create(createFacilityDto);
  }

  @Get()
  findAll(@Query("includeInactive") includeInactive?: string) {
    const includeInactiveFlag = includeInactive === "true";
    return this.facilityService.findAll(includeInactiveFlag);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.findOne(id);
  }

  @Get(":id/locations")
  getLocationsByFacility(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.getLocationsByFacility(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:facility"]
  )
  @Patch(":id")
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateFacilityDto: UpdateFacilityDto
  ) {
    return this.facilityService.update(id, updateFacilityDto);
  }

  @Patch(":id/toggle-status")
  toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.toggleStatus(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:facility"]
  )
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.remove(id);
  }
}
