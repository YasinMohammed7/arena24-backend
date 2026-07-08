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
  UseInterceptors,
  UploadedFile,
  DefaultValuePipe,
  ParseBoolPipe,
  ParseFilePipe,
  MaxFileSizeValidator,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiConflictResponse,
  ApiNotFoundResponse,
  ApiNoContentResponse,
  ApiParam,
} from "@nestjs/swagger";
import { AmenityService } from "./amenity.service";
import { CreateAmenityDto } from "./dto/create-amenity.dto";
import { UpdateAmenityDto } from "./dto/update-amenity.dto";
import { MAX_ICON_SIZE } from "./multer.config";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

// Optional image icon, size-capped. Shared by create + update.
const iconFilePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [new MaxFileSizeValidator({ maxSize: MAX_ICON_SIZE })],
});

@ApiTags("amenity")
@ApiBearerAuth("access-token")
@Controller("amenity")
@UseGuards(JwtAuthGuard)
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:amenity"]
  )
  @Post()
  @ApiOperation({ summary: "Create an amenity" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["name"],
      properties: {
        name: { type: "string", example: "WiFi" },
        description: { type: "string" },
        isActive: { type: "boolean", example: true },
        icon: { type: "string", format: "binary" },
      },
    },
  })
  @ApiCreatedResponse({ description: "Amenity created" })
  @ApiConflictResponse({ description: "Amenity name already exists" })
  @UseInterceptors(FileInterceptor("icon"))
  create(
    @Body() createAmenityDto: CreateAmenityDto,
    @UploadedFile(iconFilePipe) file?: Express.Multer.File
  ) {
    return this.amenityService.create({
      ...createAmenityDto,
      iconUrl: file ? `/uploads/amenities/icons/${file.filename}` : undefined,
    });
  }

  @Get()
  @ApiOperation({ summary: "List amenities" })
  @ApiOkResponse({ description: "Array of amenities with locationsCount" })
  findAll(
    @Query("includeInactive", new DefaultValuePipe(false), ParseBoolPipe)
    includeInactive: boolean
  ) {
    return this.amenityService.findAll(includeInactive);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get one amenity with its locations" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Amenity found" })
  @ApiNotFoundResponse({ description: "Amenity not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.findOne(id);
  }

  @Get(":id/locations")
  @ApiOperation({ summary: "List locations using this amenity" })
  @ApiParam({ name: "id", type: Number })
  getLocationsByAmenity(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.getLocationsByAmenity(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:amenity"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update an amenity" })
  @ApiParam({ name: "id", type: Number })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        isActive: { type: "boolean" },
        icon: { type: "string", format: "binary" },
      },
    },
  })
  @ApiOkResponse({ description: "Amenity updated" })
  @ApiConflictResponse({ description: "Amenity name already exists" })
  @ApiNotFoundResponse({ description: "Amenity not found" })
  @UseInterceptors(FileInterceptor("icon"))
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAmenityDto: UpdateAmenityDto,
    @UploadedFile(iconFilePipe) file?: Express.Multer.File
  ) {
    return this.amenityService.update(id, {
      ...updateAmenityDto,
      ...(file && { iconUrl: `/uploads/amenities/icons/${file.filename}` }),
    });
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:amenity"]
  )
  @Patch(":id/toggle-status")
  @ApiOperation({ summary: "Toggle an amenity's active status" })
  @ApiParam({ name: "id", type: Number })
  @ApiOkResponse({ description: "Amenity status toggled" })
  @ApiNotFoundResponse({ description: "Amenity not found" })
  toggleStatus(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.toggleStatus(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:amenity"]
  )
  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: "Delete an amenity" })
  @ApiParam({ name: "id", type: Number })
  @ApiNoContentResponse({ description: "Amenity deleted" })
  @ApiConflictResponse({ description: "Amenity is in use by locations" })
  @ApiNotFoundResponse({ description: "Amenity not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.remove(id);
  }
}
