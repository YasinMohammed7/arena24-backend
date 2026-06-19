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
} from "@nestjs/common";
import { LocationsService } from "./locations.service";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname, join } from "path";
import * as fs from "fs";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@Controller("business/locations")
@UseGuards(JwtAuthGuard)
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:location"]
  )
  @Post()
  @UseInterceptors(
    FileInterceptor("cover_image", {
      storage: diskStorage({
        destination: "./public/uploads/restaurants/covers",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  create(
    @Body() createLocationDto: CreateLocationDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.locationsService.create({
      ...createLocationDto,
      imageUrl: file
        ? `/uploads/restaurants/covers/${file.filename}`
        : undefined,
    });
  }

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.locationsService.findOne(+id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateLocationDto: UpdateLocationDto
  ) {
    return this.locationsService.update(+id, updateLocationDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:location"]
  )
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.locationsService.remove(+id);
  }

  @Post(":id/gallery")
  @UseInterceptors(
    FilesInterceptor("images", 10, {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const restaurantId = req.params.id;
          // Use process.cwd() to get the project root directory
          const uploadPath = join(
            process.cwd(),
            "public",
            "uploads",
            "restaurants",
            restaurantId,
            "gallery"
          );

          // Create folder if it doesn't exist with error handling
          try {
            fs.mkdirSync(uploadPath, { recursive: true });
            cb(null, uploadPath);
          } catch (error) {
            console.error("Error creating upload directory:", error);
            cb(error instanceof Error ? error : new Error(String(error)), "");
          }
        },
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  async uploadGallery(
    @Param("id") restaurantId: string,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return this.locationsService.addGallery(+restaurantId, files);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":locationId/facility/:facilityId/toggle-status")
  toggleLocationFacilityStatus(
    @Param("locationId") locationId: string,
    @Param("facilityId") facilityId: string
  ) {
    return this.locationsService.toggleLocationFacilityStatus(
      +locationId,
      +facilityId
    );
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:location"]
  )
  @Patch(":locationId/amenity/:amenityId/toggle-status")
  toggleLocationAmenityStatus(
    @Param("locationId") locationId: string,
    @Param("amenityId") amenityId: string
  ) {
    return this.locationsService.toggleLocationAmenityStatus(
      +locationId,
      +amenityId
    );
  }
}
