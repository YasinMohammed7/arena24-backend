import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  ParseIntPipe,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";

import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

import {
  locationCoverUploadOptions,
  locationGalleryUploadOptions,
  MAX_LOCATION_COVER_SIZE,
  MAX_LOCATION_GALLERY_IMAGE_SIZE,
  MAX_LOCATION_GALLERY_FILES,
} from "./multer.config";

const coverFilePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [new MaxFileSizeValidator({ maxSize: MAX_LOCATION_COVER_SIZE })],
});

const galleryFilesPipe = new ParseFilePipe({
  fileIsRequired: true,
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_LOCATION_GALLERY_IMAGE_SIZE }),
  ],
});

@ApiTags("Locations")
@Controller("locations")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:location"]
  )
  @Post()
  @ApiOperation({ summary: "Create a new location" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "businessId"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        address: { type: "string" },
        phone: { type: "string" },
        email: { type: "string" },
        businessId: { type: "number" },
        ownerId: { type: "string" },
        cover_image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Location created successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or invalid cover image",
  })
  @UseInterceptors(FileInterceptor("cover_image", locationCoverUploadOptions))
  create(
    @Body() createLocationDto: CreateLocationDto,
    @UploadedFile(coverFilePipe) file?: Express.Multer.File
  ) {
    return this.locationsService.create({
      ...createLocationDto,
      imageUrl: file
        ? `/uploads/restaurants/covers/${file.filename}`
        : createLocationDto.imageUrl,
    });
  }

  @Get()
  @ApiOperation({ summary: "Get all locations" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Locations retrieved successfully",
  })
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(":id")
  @ApiOperation({ summary: "Get location by ID" })
  @ApiParam({ name: "id", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location retrieved successfully",
  })
  @ApiNotFoundResponse({ description: "Location not found" })
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.locationsService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update a location" })
  @ApiParam({ name: "id", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location updated successfully",
  })
  @ApiNotFoundResponse({ description: "Location not found" })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationsService.update(id, updateLocationDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:location"]
  )
  @Delete(":id")
  @ApiOperation({ summary: "Delete a location" })
  @ApiParam({ name: "id", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location deleted successfully",
  })
  @ApiNotFoundResponse({ description: "Location not found" })
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.locationsService.remove(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Post(":id/gallery")
  @ApiOperation({ summary: "Upload location gallery images" })
  @ApiParam({ name: "id", type: "number", description: "Location ID" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["images"],
      properties: {
        images: {
          type: "array",
          maxItems: MAX_LOCATION_GALLERY_FILES,
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Gallery uploaded successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid image files",
  })
  @ApiNotFoundResponse({ description: "Location not found" })
  @UseInterceptors(
    FilesInterceptor(
      "images",
      MAX_LOCATION_GALLERY_FILES,
      locationGalleryUploadOptions
    )
  )
  async uploadGallery(
    @Param("id", ParseIntPipe) locationId: number,
    @UploadedFiles(galleryFilesPipe) files: Express.Multer.File[]
  ) {
    return this.locationsService.addGallery(locationId, files);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":locationId/facility/:facilityId/toggle-status")
  @ApiOperation({ summary: "Toggle location facility status" })
  @ApiParam({
    name: "locationId",
    type: "number",
    description: "Location ID",
  })
  @ApiParam({
    name: "facilityId",
    type: "number",
    description: "Facility ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location facility status toggled successfully",
  })
  @ApiNotFoundResponse({
    description: "Location-facility relation not found",
  })
  toggleLocationFacilityStatus(
    @Param("locationId", ParseIntPipe) locationId: number,
    @Param("facilityId", ParseIntPipe) facilityId: number
  ) {
    return this.locationsService.toggleLocationFacilityStatus(
      locationId,
      facilityId
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":locationId/amenity/:amenityId/toggle-status")
  @ApiOperation({ summary: "Toggle location amenity status" })
  @ApiParam({
    name: "locationId",
    type: "number",
    description: "Location ID",
  })
  @ApiParam({
    name: "amenityId",
    type: "number",
    description: "Amenity ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location amenity status toggled successfully",
  })
  @ApiNotFoundResponse({
    description: "Location-amenity relation not found",
  })
  toggleLocationAmenityStatus(
    @Param("locationId", ParseIntPipe) locationId: number,
    @Param("amenityId", ParseIntPipe) amenityId: number
  ) {
    return this.locationsService.toggleLocationAmenityStatus(
      locationId,
      amenityId
    );
  }
}
