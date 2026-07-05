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
  DefaultValuePipe,
  ParseBoolPipe,
} from "@nestjs/common";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiParam,
} from "@nestjs/swagger";
import { FacilityService } from "./facility.service";
import { CreateFacilityDto } from "./dto/create-facility.dto";
import { UpdateFacilityDto } from "./dto/update-facility.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@ApiTags("facility")
@ApiBearerAuth("access-token")
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
  @ApiOperation({ summary: "Create a facility" })
  @ApiCreatedResponse({ description: "Facility created" })
  @ApiConflictResponse({ description: "Facility name already exists" })
  create(@Body() createFacilityDto: CreateFacilityDto) {
    return this.facilityService.create(createFacilityDto);
  }

  @Get()
  @ApiOperation({ summary: "List facilities" })
  @ApiOkResponse({ description: "Array of facilities with locationsCount" })
  findAll(
    @Query("includeInactive", new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean
  ) {
    return this.facilityService.findAll(includeInactive);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one facility with its locations" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Facility found" })
  @ApiNotFoundResponse({ description: "Facility not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.findOne(id);
  }

  @Get(":id/locations")
  @ApiOperation({ summary: "List locations using this facility" })
  @ApiParam({ name: "id", type: Number })
  getLocationsByFacility(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.getLocationsByFacility(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:facility"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update a facility" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Facility updated" })
  @ApiConflictResponse({ description: "Facility name already exists" })
  @ApiNotFoundResponse({ description: "Facility not found" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateFacilityDto: UpdateFacilityDto
  ) {
    return this.facilityService.update(id, updateFacilityDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:facility"]
  )
  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Toggle a facility's active status" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Facility status toggled" })
  @ApiNotFoundResponse({ description: "Facility not found" })
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
  @ApiOperation({ summary: "Delete a facility" })
  @ApiParam({ name: "id", type: Number })
  @ApiNoContentResponse({ description: "Facility deleted" })
  @ApiConflictResponse({ description: "Facility is in use by locations" })
  @ApiNotFoundResponse({ description: "Facility not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.facilityService.remove(id);
  }
}
