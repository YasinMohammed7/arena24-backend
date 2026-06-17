import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';

@Injectable()
export class EventService {
  constructor(private prisma: PrismaService) {}

  async create(createEventDto: CreateEventDto) {
    const { facilityIds, includedOptions, requirements, ...eventData } =
      createEventDto;

    // Verify location exists
    const location = await this.prisma.location.findUnique({
      where: { id: createEventDto.locationId },
    });

    if (!location) {
      throw new BadRequestException('Location not found');
    }

    try {
      return await this.prisma.event.create({
        data: {
          ...eventData,
          date: new Date(`${eventData.date}T00:00:00.000Z`),
          startHour: new Date(
            `${eventData.date}T${eventData.startHour}:00.000Z`,
          ),
          endHour: new Date(`${eventData.date}T${eventData.endHour}:00.000Z`),
          facilities: facilityIds?.length
            ? {
                create: facilityIds.map((facilityId) => ({
                  facility: { connect: { id: facilityId } },
                })),
              }
            : undefined,
          includedOptions: includedOptions?.length
            ? {
                create: includedOptions.map((name) => ({ name })),
              }
            : undefined,
          requirements: requirements?.length
            ? {
                create: requirements.map((name) => ({ name })),
              }
            : undefined,
        },
        include: {
          location: {
            select: { id: true, name: true, address: true },
          },
          facilities: {
            include: { facility: true },
          },
          includedOptions: true,
          requirements: true,
          _count: {
            select: { reservations: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Event with this name already exists at this location',
        );
      }
      throw error;
    }
  }

  async findAll() {
    return await this.prisma.event.findMany({
      include: {
        location: {
          select: { id: true, name: true, address: true },
        },
        facilities: {
          include: { facility: true },
        },
        includedOptions: true,
        requirements: true,
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async findOne(id: number) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            business: { select: { id: true, name: true } },
          },
        },
        facilities: {
          include: { facility: true },
        },
        includedOptions: true,
        requirements: true,
        reservations: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            peopleCount: true,
            status: true,
            createdAt: true,
          },
        },
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
      include: {
        facilities: true,
        includedOptions: true,
        requirements: true,
      },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const { facilityIds, includedOptions, requirements, ...eventData } =
      updateEventDto;

    try {
      return await this.prisma.event.update({
        where: { id },
        data: {
          ...eventData,
          ...(eventData.date && {
            date: new Date(`${eventData.date}T00:00:00.000Z`),
          }),
          ...(eventData.startHour &&
            eventData.date && {
              startHour: new Date(
                `${eventData.date}T${eventData.startHour}:00.000Z`,
              ),
            }),
          ...(eventData.endHour &&
            eventData.date && {
              endHour: new Date(
                `${eventData.date}T${eventData.endHour}:00.000Z`,
              ),
            }),
          // Handle case where only time is updated but date exists in existing event
          ...(eventData.startHour &&
            !eventData.date && {
              startHour: new Date(
                `${existingEvent.date.toISOString().split('T')[0]}T${eventData.startHour}:00.000Z`,
              ),
            }),
          ...(eventData.endHour &&
            !eventData.date && {
              endHour: new Date(
                `${existingEvent.date.toISOString().split('T')[0]}T${eventData.endHour}:00.000Z`,
              ),
            }),
          ...(facilityIds !== undefined && {
            facilities: {
              deleteMany: {},
              create: facilityIds.map((facilityId) => ({
                facility: { connect: { id: facilityId } },
              })),
            },
          }),
          ...(includedOptions !== undefined && {
            includedOptions: {
              deleteMany: {},
              create: includedOptions.map((name) => ({ name })),
            },
          }),
          ...(requirements !== undefined && {
            requirements: {
              deleteMany: {},
              create: requirements.map((name) => ({ name })),
            },
          }),
        },
        include: {
          location: {
            select: { id: true, name: true, address: true },
          },
          facilities: {
            include: { facility: true },
          },
          includedOptions: true,
          requirements: true,
          _count: {
            select: { reservations: true },
          },
        },
      });
    } catch (error: any) {
      if (error.code === 'P2002') {
        throw new BadRequestException(
          'Event with this name already exists at this location',
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const existingEvent = await this.prisma.event.findUnique({
      where: { id },
      include: {
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (existingEvent._count.reservations > 0) {
      throw new BadRequestException(
        'Cannot delete event with existing reservations',
      );
    }

    await this.prisma.event.delete({
      where: { id },
    });

    return { message: 'Event deleted successfully' };
  }

  async findByLocation(locationId: number) {
    return await this.prisma.event.findMany({
      where: { locationId },
      include: {
        location: {
          select: { id: true, name: true, address: true },
        },
        facilities: {
          include: { facility: true },
        },
        includedOptions: true,
        requirements: true,
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { date: 'asc' },
    });
  }

  async toggleEventFacilityStatus(eventId: number, facilityId: number) {
    // Check if the event-facility relation exists
    const eventFacility = await this.prisma.eventFacility.findUnique({
      where: {
        eventId_facilityId: {
          eventId,
          facilityId,
        },
      },
      include: {
        facility: true,
        event: {
          select: { id: true, name: true },
        },
      },
    });

    if (!eventFacility) {
      throw new NotFoundException(
        `EventFacility relation not found for event ${eventId} and facility ${facilityId}`,
      );
    }

    return this.prisma.eventFacility.update({
      where: {
        eventId_facilityId: {
          eventId,
          facilityId,
        },
      },
      data: { isActive: !eventFacility.isActive },
      include: {
        facility: true,
        event: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
