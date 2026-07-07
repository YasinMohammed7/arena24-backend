import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { Event } from "@/database/entities/event";
import { EventFacilities } from "@/database/entities/eventFacilities";
import { EventIncludedOptions } from "@/database/entities/eventIncludedOptions";
import { Locations } from "@/database/entities/locations";
import { TypeOrmModule } from "@nestjs/typeorm";
import { EventRequirements } from "@/database/entities/eventRequirements";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Locations,
      Event,
      EventFacilities,
      EventIncludedOptions,
      EventRequirements,
    ]),
  ],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
