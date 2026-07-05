import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { FacilityService } from "./facility.service";
import { FacilityController } from "./facility.controller";
import { Facilities } from "@/database/entities/facilities";
import { LocationFacilities } from "@/database/entities/locationFacilities";

@Module({
  imports: [TypeOrmModule.forFeature([Facilities, LocationFacilities])],
  controllers: [FacilityController],
  providers: [FacilityService],
})
export class FacilityModule {}
