import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { CreateReservationDto } from "./dto/create-reservation.dto";
import { UpdateReservationDto } from "./dto/update-reservation.dto";
import { ReservationStatus } from "@prisma/client";
import { Locations } from "@/database/entities/locations";
import { Repository } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { Reservations } from "@/database/entities/reservations";
import { Event } from "@/database/entities/event";
import { User } from "@/database/entities/user";

@Injectable()
export class ReservationService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>,
    @InjectRepository(Reservations)
    private readonly reservationRepo: Repository<Reservations>,
    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>
  ) {}

  async create(createReservationDto: CreateReservationDto, userId: string) {
    const { eventId, locationId, peopleCount, ...reservationData } =
      createReservationDto;

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if ((!eventId && !locationId) || (eventId && locationId)) {
      throw new BadRequestException(
        "Either eventId or locationId must be provided, but not both"
      );
    }

    if (eventId) {
      const event = await this.eventRepo.findOne({
        where: { id: eventId },
        select: {
          id: true,
          maxPeople: true,
          name: true,
        },
      });

      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      if (event.maxPeople !== null) {
        const result = await this.reservationRepo
          .createQueryBuilder("reservation")
          .select("COALESCE(SUM(reservation.peopleCount), 0)", "total")
          .where("reservation.eventId = :eventId", { eventId })
          .andWhere("reservation.status != :status", {
            status: ReservationStatus.CANCELLED,
          })
          .getRawOne<{ total: string }>();

        const currentTotalPeople = Number(result?.total ?? 0);
        const newTotal = currentTotalPeople + peopleCount;

        if (newTotal > event.maxPeople) {
          throw new BadRequestException(
            `Cannot create reservation for ${peopleCount} people. This would exceed the maximum capacity of ${event.maxPeople} for event "${event.name}". Current reservations: ${currentTotalPeople}, Available spots: ${event.maxPeople - currentTotalPeople}`
          );
        }
      }
    }

    if (locationId) {
      const location = await this.locationRepo.findOne({
        where: { id: locationId },
        select: {
          id: true,
          capacity: true,
          name: true,
        },
      });

      if (!location) {
        throw new NotFoundException(`Location with ID ${locationId} not found`);
      }

      if (location.capacity !== null) {
        const result = await this.reservationRepo
          .createQueryBuilder("reservation")
          .select("COALESCE(SUM(reservation.peopleCount), 0)", "total")
          .where("reservation.locationId = :locationId", { locationId })
          .andWhere("reservation.status != :status", {
            status: ReservationStatus.CANCELLED,
          })
          .getRawOne<{ total: string }>();

        const currentTotalPeople = Number(result?.total ?? 0);
        const newTotal = currentTotalPeople + peopleCount;

        if (newTotal > location.capacity) {
          throw new BadRequestException(
            `Cannot create reservation for ${peopleCount} people. This would exceed the maximum capacity of ${location.capacity} for location "${location.name}". Current reservations: ${currentTotalPeople}, Available spots: ${location.capacity - currentTotalPeople}`
          );
        }
      }
    }

    const reservation = this.reservationRepo.create({
      ...reservationData,
      peopleCount,
      userId: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      eventId,
      locationId,
      status: reservationData.status || ReservationStatus.PENDING,
    });

    const savedReservation = await this.reservationRepo.save(reservation);

    return this.reservationRepo.findOne({
      where: { id: savedReservation.id },
      relations: {
        user: true,
        event: true,
        location: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        event: {
          id: true,
          name: true,
          date: true,
          startHour: true,
          endHour: true,
        },
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
        },
      },
    });
  }

  async findAll() {
    return this.reservationRepo.find({
      relations: {
        user: true,
        event: true,
        location: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        event: {
          id: true,
          name: true,
          date: true,
          startHour: true,
          endHour: true,
        },
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findOne(id: number) {
    const reservation = await this.reservationRepo.findOne({
      where: { id },
      relations: {
        user: true,
        event: true,
        location: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
          phone: true,
        },
        event: {
          id: true,
          name: true,
          description: true,
          date: true,
          startHour: true,
          endHour: true,
          address: true,
          price: true,
          maxPeople: true,
        },
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
          capacity: true,
          description: true,
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const existingReservation = await this.reservationRepo.findOne({
      where: { id },
    });

    if (!existingReservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    await this.reservationRepo.update(id, updateReservationDto);

    return this.reservationRepo.findOne({
      where: { id },
      relations: {
        user: true,
        event: true,
        location: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
        event: {
          id: true,
          name: true,
          date: true,
          startHour: true,
          endHour: true,
        },
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
        },
      },
    });
  }

  async remove(id: number) {
    const existingReservation = await this.reservationRepo.findOne({
      where: { id },
    });

    if (!existingReservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    await this.reservationRepo.delete(id);

    return { message: `Reservation with ID ${id} has been deleted` };
  }

  async findByEvent(eventId: number) {
    return this.reservationRepo.find({
      where: { eventId },
      relations: {
        user: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findByLocation(locationId: number) {
    return this.reservationRepo.find({
      where: { locationId },
      relations: {
        user: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        user: {
          id: true,
          name: true,
          email: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }

  async findByUser(userId: string) {
    return this.reservationRepo.find({
      where: { userId },
      relations: {
        event: true,
        location: true,
      },
      select: {
        id: true,
        peopleCount: true,
        name: true,
        email: true,
        phone: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        event: {
          id: true,
          name: true,
          date: true,
          startHour: true,
          endHour: true,
        },
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });
  }
}
