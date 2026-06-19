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
} from "@nestjs/common";
import { AmenityService } from "./amenity.service";
import { CreateAmenityDto } from "./dto/create-amenity.dto";
import { UpdateAmenityDto } from "./dto/update-amenity.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { FileInterceptor } from "@nestjs/platform-express";
import { diskStorage } from "multer";
import { extname } from "path";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";

@Controller("business/amenity")
@UseGuards(JwtAuthGuard)
export class AmenityController {
  constructor(private readonly amenityService: AmenityService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:amenity"]
  )
  @Post()
  @UseInterceptors(
    FileInterceptor("icon", {
      storage: diskStorage({
        destination: "./public/uploads/amenities/icons",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  create(
    @Body() createAmenityDto: CreateAmenityDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.amenityService.create({
      ...createAmenityDto,
      iconUrl: file ? `/uploads/amenities/icons/${file.filename}` : undefined,
    });
  }

  @Get()
  findAll(@Query("includeInactive") includeInactive?: string) {
    const includeInactiveFlag = includeInactive === "true";
    return this.amenityService.findAll(includeInactiveFlag);
  }

  @Get(":id")
  findOne(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.findOne(id);
  }

  @Get(":id/locations")
  getLocationsByAmenity(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.getLocationsByAmenity(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:amenity"]
  )
  @Patch(":id")
  @UseInterceptors(
    FileInterceptor("icon", {
      storage: diskStorage({
        destination: "./public/uploads/amenities/icons",
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + "-" + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    })
  )
  update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateAmenityDto: UpdateAmenityDto,
    @UploadedFile() file: Express.Multer.File
  ) {
    return this.amenityService.update(id, {
      ...updateAmenityDto,
      ...(file && { iconUrl: `/uploads/amenities/icons/${file.filename}` }),
    });
  }

  @Patch(":id/toggle-status")
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
  remove(@Param("id", ParseIntPipe) id: number) {
    return this.amenityService.remove(id);
  }
}
