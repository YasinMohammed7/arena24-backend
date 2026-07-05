import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Not } from "typeorm";
import { Schedules } from "@/database/entities/schedules";
import { Locations } from "@/database/entities/locations";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";

@Injectable()
export class ScheduleService {
  constructor(
    @InjectRepository(Schedules)
    private readonly scheduleRepo: Repository<Schedules>,

    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>
  ) {}

  async create(createScheduleDto: CreateScheduleDto) {
    // Check if location exists
    const location = await this.locationRepo.findOneBy({
      id: createScheduleDto.locationId,
    });

    if (!location) {
      throw new NotFoundException("Location not found");
    }

    // Check for duplicate schedule for the same location and day
    const existingSchedule = await this.scheduleRepo.findOneBy({
      locationId: createScheduleDto.locationId,
      dayOfWeek: createScheduleDto.dayOfWeek,
    });

    if (existingSchedule) {
      throw new ConflictException(
        "Schedule already exists for this location and day"
      );
    }

    const schedule = this.scheduleRepo.create(createScheduleDto);
    const saved: Schedules = await this.scheduleRepo.save(schedule);
    return this.findOne(saved.id);
  }

  async findAll(locationId?: number) {
    const queryBuilder = this.scheduleRepo
      .createQueryBuilder("schedule")
      .leftJoin("schedule.location", "location")
      .addSelect(["location.id", "location.name", "location.type"])
      .orderBy("schedule.locationId", "ASC")
      .addOrderBy("schedule.dayOfWeek", "ASC")
      .addOrderBy("schedule.startTime", "ASC");

    if (locationId) {
      queryBuilder.where("schedule.locationId = :locationId", { locationId });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const schedule = await this.scheduleRepo
      .createQueryBuilder("schedule")
      .leftJoin("schedule.location", "location")
      .addSelect(["location.id", "location.name", "location.type"])
      .where("schedule.id = :id", { id })
      .getOne();

    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }

    return schedule;
  }

  async findByLocation(locationId: number) {
    return this.scheduleRepo.find({
      where: { locationId },
      order: { dayOfWeek: "ASC", startTime: "ASC" },
    });
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id); // Check if exists

    // If updating locationId and dayOfWeek, check for conflicts
    if (updateScheduleDto.locationId && updateScheduleDto.dayOfWeek) {
      const existingSchedule = await this.scheduleRepo.findOne({
        where: {
          locationId: updateScheduleDto.locationId,
          dayOfWeek: updateScheduleDto.dayOfWeek,
          id: Not(id),
        },
      });

      if (existingSchedule) {
        throw new ConflictException(
          "Schedule already exists for this location and day"
        );
      }
    }

    await this.scheduleRepo.update(id, updateScheduleDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const schedule = await this.findOne(id); // Check if exists

    await this.scheduleRepo.delete(id);
    return schedule;
  }
}
