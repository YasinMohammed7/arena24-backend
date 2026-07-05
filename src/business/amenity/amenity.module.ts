import { Module } from "@nestjs/common";
import { AmenityService } from "./amenity.service";
import { AmenityController } from "./amenity.controller";
import { Amenities } from "@/database/entities/amenities";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MulterModule } from "@nestjs/platform-express";
import { LocationAmenities } from "@/database/entities/locationAmenities";
import { iconUploadOptions } from "./multer.config";

@Module({
  imports: [
    TypeOrmModule.forFeature([Amenities, LocationAmenities]),
    MulterModule.register(iconUploadOptions),
  ],
  controllers: [AmenityController],
  providers: [AmenityService],
})
export class AmenityModule {}
