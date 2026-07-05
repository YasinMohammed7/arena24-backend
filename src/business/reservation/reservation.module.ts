import { Module } from "@nestjs/common";
import { ReservationService } from "./reservation.service";
import { ReservationController } from "./reservation.controller";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Locations } from "@/database/entities/locations";
import { Event } from "@/database/entities/event";
import { Reservations } from "@/database/entities/reservations";
import { User } from "@/database/entities/user";

@Module({
  imports: [TypeOrmModule.forFeature([Locations, Event, Reservations, User])],
  controllers: [ReservationController],
  providers: [ReservationService],
})
export class ReservationModule {}
