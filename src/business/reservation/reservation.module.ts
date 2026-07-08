import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ReservationService } from "./reservation.service";
import { ReservationController } from "./reservation.controller";
import { ReservationGateway } from "./reservation.gateway";
import { Locations } from "@/database/entities/locations";
import { Event } from "@/database/entities/event";
import { Reservations } from "@/database/entities/reservations";
import { User } from "@/database/entities/user";

@Module({
  imports: [
    TypeOrmModule.forFeature([Locations, Event, Reservations, User]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
      }),
    }),
  ],
  controllers: [ReservationController],
  providers: [ReservationService, ReservationGateway],
})
export class ReservationModule {}
