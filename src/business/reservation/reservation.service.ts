import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { ReservationStatus } from '@prisma/client';

interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  phone: string;
  [key: string]: any;
}

@Injectable()
export class ReservationService {
  constructor(private prisma: PrismaService) {}

  async  create(
    createReservationDto: CreateReservationDto,
    user: AuthenticatedUser,
  ) {
    const { eventId, locationId, peopleCount, ...reservationData } =
      createReservationDto;

    // Validate that exactly one of eventId or locationId is provided
    if ((!eventId && !locationId) || (eventId && locationId)) {
      throw new BadRequestException(
        'Either eventId or locationId must be provided, but not both',
      );
    }

    // Validate that the event or location exists and check capacity
    if (eventId) {
      const event = await this.prisma.event.findUnique({
        where: { id: eventId },
        select: { id: true, maxPeople: true, name: true },
      });
      if (!event) {
        throw new NotFoundException(`Event with ID ${eventId} not found`);
      }

      // Validate that peopleCount doesn't exceed event's maxPeople limit
      // If maxPeople is null, we assume no limit is set
      if (event.maxPeople !== null) {
        // Count existing reservations for this event
        const existingReservations = await this.prisma.reservation.aggregate({
          where: {
            eventId,
            status: {
              not: 'CANCELLED', // Don't count cancelled reservations
            },
          },
          _sum: {
            peopleCount: true,
          },
        });

        const currentTotalPeople = existingReservations._sum.peopleCount || 0;
        const newTotal = currentTotalPeople + peopleCount;

        if (newTotal > event.maxPeople) {
          throw new BadRequestException(
            `Cannot create reservation for ${peopleCount} people. This would exceed the maximum capacity of ${event.maxPeople} for event "${event.name}". Current reservations: ${currentTotalPeople}, Available spots: ${event.maxPeople - currentTotalPeople}`,
          );
        }
      }
    }

    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
        select: { id: true, capacity: true, name: true },
      });
      if (!location) {
        throw new NotFoundException(`Location with ID ${locationId} not found`);
      }

      // Validate that peopleCount doesn't exceed location's capacity
      // If capacity is null, we assume no limit is set
      if (location.capacity !== null) {
        // Count existing reservations for this location
        const existingReservations = await this.prisma.reservation.aggregate({
          where: {
            locationId,
            status: {
              not: 'CANCELLED', // Don't count cancelled reservations
            },
          },
          _sum: {
            peopleCount: true,
          },
        });

        const currentTotalPeople = existingReservations._sum.peopleCount || 0;
        const newTotal = currentTotalPeople + peopleCount;

        if (newTotal > location.capacity) {
          throw new BadRequestException(
            `Cannot create reservation for ${peopleCount} people. This would exceed the maximum capacity of ${location.capacity} for location "${location.name}". Current reservations: ${currentTotalPeople}, Available spots: ${location.capacity - currentTotalPeople}`,
          );
        }
      }
    }

    return this.prisma.reservation.create({
      data: {
        ...reservationData,
        peopleCount,
        userId: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        eventId,
        locationId,
        status: reservationData.status || ReservationStatus.PENDING,
      },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            startHour: true,
            endHour: true,
          },
        },
        location: {
          select: { id: true, name: true, type: true, address: true },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.reservation.findMany({
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            startHour: true,
            endHour: true,
          },
        },
        location: {
          select: { id: true, name: true, type: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const reservation = await this.prisma.reservation.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, email: true, phone: true },
        },
        event: {
          select: {
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
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            capacity: true,
            description: true,
          },
        },
      },
    });

    if (!reservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return reservation;
  }

  async update(id: number, updateReservationDto: UpdateReservationDto) {
    const existingReservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!existingReservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    return this.prisma.reservation.update({
      where: { id },
      data: updateReservationDto,
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            startHour: true,
            endHour: true,
          },
        },
        location: {
          select: { id: true, name: true, type: true, address: true },
        },
      },
    });
  }

  async remove(id: number) {
    const existingReservation = await this.prisma.reservation.findUnique({
      where: { id },
    });

    if (!existingReservation) {
      throw new NotFoundException(`Reservation with ID ${id} not found`);
    }

    await this.prisma.reservation.delete({
      where: { id },
    });

    return { message: `Reservation with ID ${id} has been deleted` };
  }

  async findByEvent(eventId: number) {
    return this.prisma.reservation.findMany({
      where: { eventId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByLocation(locationId: number) {
    return this.prisma.reservation.findMany({
      where: { locationId },
      include: {
        user: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByUser(userId: string) {
    return this.prisma.reservation.findMany({
      where: { userId },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            date: true,
            startHour: true,
            endHour: true,
          },
        },
        location: {
          select: { id: true, name: true, type: true, address: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
