import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ScheduleService } from "./schedule.service";
import { ScheduleController } from "./schedule.controller";
import { Schedules } from "@/database/entities/schedules";
import { Locations } from "@/database/entities/locations";

@Module({
  imports: [TypeOrmModule.forFeature([Schedules, Locations])],
  controllers: [ScheduleController],
  providers: [ScheduleService],
})
export class ScheduleModule {}
