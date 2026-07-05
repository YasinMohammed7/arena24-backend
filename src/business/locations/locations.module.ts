import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LocationsService } from "./locations.service";
import { LocationsController } from "./locations.controller";
import { Locations } from "@/database/entities/locations";
import { LocationFacilities } from "@/database/entities/locationFacilities";
import { LocationAmenities } from "@/database/entities/locationAmenities";
import { Media } from "@/database/entities/media";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Locations,
      LocationFacilities,
      LocationAmenities,
      Media,
    ]),
  ],
  controllers: [LocationsController],
  providers: [LocationsService],
})
export class LocationsModule {}
