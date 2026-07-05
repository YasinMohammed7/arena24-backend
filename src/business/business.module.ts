import { Module } from "@nestjs/common";
import { BusinessService } from "./business.service";
import { BusinessController } from "./business.controller";
import { ScheduleModule } from "./schedule/schedule.module";
import { FacilityModule } from "./facility/facility.module";
import { AmenityModule } from "./amenity/amenity.module";
import { LocationsModule } from "@/business/locations/locations.module";
import { EventModule } from "./event/event.module";
import { ReservationModule } from "./reservation/reservation.module";
import { ReviewModule } from "./review/review.module";
import { OfferModule } from "./offer/offer.module";
import { OfferCategoryModule } from "./offer-category/offer-category.module";

@Module({
  imports: [
    LocationsModule,
    ScheduleModule,
    FacilityModule,
    AmenityModule,
    EventModule,
    ReservationModule,
    ReviewModule,
    OfferModule,
    OfferCategoryModule,
  ],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
