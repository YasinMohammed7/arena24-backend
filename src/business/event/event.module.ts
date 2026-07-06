import { Module } from "@nestjs/common";
import { EventService } from "./event.service";
import { EventController } from "./event.controller";
import { Event } from "@/database/entities/event";
import { EventFacilities } from "@/database/entities/eventFacilities";
import { Locations } from "@/database/entities/locations";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
  imports: [TypeOrmModule.forFeature([Locations, Event, EventFacilities])],
  controllers: [EventController],
  providers: [EventService],
})
export class EventModule {}
