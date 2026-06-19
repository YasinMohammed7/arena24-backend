import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateScheduleDto } from "./dto/create-schedule.dto";
import { UpdateScheduleDto } from "./dto/update-schedule.dto";

@Injectable()
export class ScheduleService {
  constructor(private prisma: PrismaService) {}

  async create(createScheduleDto: CreateScheduleDto) {
    // Check if location exists
    const location = await this.prisma.location.findUnique({
      where: { id: createScheduleDto.locationId },
    });

    if (!location) {
      throw new NotFoundException("Location not found");
    }

    // Check for duplicate schedule for the same location and day
    const existingSchedule = await this.prisma.schedules.findFirst({
      where: {
        locationId: createScheduleDto.locationId,
        dayOfWeek: createScheduleDto.dayOfWeek,
      },
    });

    if (existingSchedule) {
      throw new ConflictException(
        "Schedule already exists for this location and day"
      );
    }

    return this.prisma.schedules.create({
      data: createScheduleDto,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async findAll(locationId?: number) {
    const where = locationId ? { locationId } : {};

    return this.prisma.schedules.findMany({
      where,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
      orderBy: [
        { locationId: "asc" },
        { dayOfWeek: "asc" },
        { startTime: "asc" },
      ],
    });
  }

  async findOne(id: number) {
    const schedule = await this.prisma.schedules.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!schedule) {
      throw new NotFoundException("Schedule not found");
    }

    return schedule;
  }

  async findByLocation(locationId: number) {
    return this.prisma.schedules.findMany({
      where: { locationId },
      orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
    });
  }

  async update(id: number, updateScheduleDto: UpdateScheduleDto) {
    await this.findOne(id); // Check if exists

    // If updating locationId and dayOfWeek, check for conflicts
    if (updateScheduleDto.locationId && updateScheduleDto.dayOfWeek) {
      const existingSchedule = await this.prisma.schedules.findFirst({
        where: {
          locationId: updateScheduleDto.locationId,
          dayOfWeek: updateScheduleDto.dayOfWeek,
          NOT: { id },
        },
      });

      if (existingSchedule) {
        throw new ConflictException(
          "Schedule already exists for this location and day"
        );
      }
    }

    return this.prisma.schedules.update({
      where: { id },
      data: updateScheduleDto,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });
  }

  async remove(id: number) {
    await this.findOne(id); // Check if exists

    return this.prisma.schedules.delete({
      where: { id },
    });
  }
}
