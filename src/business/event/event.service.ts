import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from "@nestjs/common";
import { CreateEventDto } from "./dto/create-event.dto";
import { UpdateEventDto } from "./dto/update-event.dto";
import { DataSource, QueryFailedError, Repository } from "typeorm";
import { Locations } from "@/database/entities/locations";
import { Event } from "@/database/entities/event";
import { EventFacilities } from "@/database/entities/eventFacilities";
import { InjectRepository } from "@nestjs/typeorm";
import { EventRequirements } from "@/database/entities/eventRequirements";
import { EventIncludedOptions } from "@/database/entities/eventIncludedOptions";

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(EventFacilities)
    private readonly eventFacilitiesRepo: Repository<EventFacilities>,

    private readonly dataSource: DataSource
  ) {}

  async create(createEventDto: CreateEventDto) {
    const { facilityIds, includedOptions, requirements, ...eventData } =
      createEventDto;

    const location = await this.locationRepo.findOne({
      where: { id: eventData.locationId },
    });

    if (!location) {
      throw new BadRequestException("Location not found");
    }

    try {
      const eventId = await this.dataSource.transaction(async (manager) => {
        const event = manager.create(Event, {
          ...eventData,
          date: new Date(eventData.date),
          startHour: new Date(eventData.startHour),
          endHour: new Date(eventData.endHour),
        });

        const savedEvent = await manager.save(Event, event);

        if (facilityIds?.length) {
          await manager.insert(
            EventFacilities,
            facilityIds.map((facilityId) => ({
              eventId: savedEvent.id,
              facilityId,
            }))
          );
        }

        if (includedOptions?.length) {
          await manager.insert(
            EventIncludedOptions,
            includedOptions.map((name) => ({
              eventId: savedEvent.id,
              name,
            }))
          );
        }

        if (requirements?.length) {
          await manager.insert(
            EventRequirements,
            requirements.map((name) => ({
              eventId: savedEvent.id,
              name,
            }))
          );
        }

        return savedEvent.id;
      });

      return this.findOne(eventId);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;

          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new ConflictException(
            `Event with name '${createEventDto.name}' already exists at this location`
          );
        }
      }

      throw error;
    }
  }

  async findAll() {
    return this.eventRepo.find({
      relations: {
        location: true,
        eventFacilities: {
          facility: true,
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
      order: {
        date: "ASC",
      },
    });
  }

  async findOne(id: number) {
    const event = await this.eventRepo.findOne({
      where: { id },
      relations: {
        location: {
          business: true,
        },
        eventFacilities: {
          facility: true,
        },
        eventIncludedOptions: true,
        eventRequirements: true,
        reservations: true,
      },
    });

    if (!event) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    return event;
  }

  async update(id: number, updateEventDto: UpdateEventDto) {
    const existingEvent = await this.eventRepo.findOne({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    const { facilityIds, includedOptions, requirements, ...eventData } =
      updateEventDto;

    try {
      await this.dataSource.transaction(async (manager) => {
        const scalarUpdate = {
          ...eventData,
          ...(eventData.date && {
            date: new Date(eventData.date),
          }),
          ...(eventData.startHour && {
            startHour: new Date(eventData.startHour),
          }),
          ...(eventData.endHour && {
            endHour: new Date(eventData.endHour),
          }),
        };

        if (Object.keys(scalarUpdate).length > 0) {
          await manager.update(Event, id, scalarUpdate);
        }

        if (facilityIds !== undefined) {
          await manager.delete(EventFacilities, { eventId: id });

          if (facilityIds.length > 0) {
            await manager.insert(
              EventFacilities,
              facilityIds.map((facilityId) => ({
                eventId: id,
                facilityId,
              }))
            );
          }
        }

        if (includedOptions !== undefined) {
          await manager.delete(EventIncludedOptions, { eventId: id });

          if (includedOptions.length > 0) {
            await manager.insert(
              EventIncludedOptions,
              includedOptions.map((name) => ({
                eventId: id,
                name,
              }))
            );
          }
        }

        if (requirements !== undefined) {
          await manager.delete(EventRequirements, { eventId: id });

          if (requirements.length > 0) {
            await manager.insert(
              EventRequirements,
              requirements.map((name) => ({
                eventId: id,
                name,
              }))
            );
          }
        }
      });

      return this.findOne(id);
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new BadRequestException(
            "Event with this name already exists at this location"
          );
        }
      }

      throw error;
    }
  }

  async remove(id: number) {
    const existingEvent = await this.eventRepo.findOne({
      where: { id },
    });

    if (!existingEvent) {
      throw new NotFoundException(`Event with ID ${id} not found`);
    }

    if (existingEvent.reservationsCount > 0) {
      throw new BadRequestException(
        "Cannot delete event with existing reservations"
      );
    }

    await this.eventRepo.delete(id);

    return { message: "Event deleted successfully" };
  }

  async findByLocation(locationId: number) {
    return this.eventRepo.find({
      where: { locationId },
      relations: {
        location: true,
        eventFacilities: {
          facility: true,
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
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
        imageUrl: true,
        locationId: true,
        createdAt: true,
        updatedAt: true,
        reservationsCount: true,
        location: {
          id: true,
          name: true,
          address: true,
        },
      },
      order: {
        date: "ASC",
      },
    });
  }

  async toggleEventFacilityStatus(eventId: number, facilityId: number) {
    const eventFacility = await this.eventFacilitiesRepo.findOne({
      where: {
        eventId,
        facilityId,
      },
      relations: {
        facility: true,
        event: true,
      },
      select: {
        eventId: true,
        facilityId: true,
        isActive: true,
        facility: true,
        event: {
          id: true,
          name: true,
        },
      },
    });

    if (!eventFacility) {
      throw new NotFoundException(
        `EventFacility relation not found for event ${eventId} and facility ${facilityId}`
      );
    }

    eventFacility.isActive = !eventFacility.isActive;

    await this.eventFacilitiesRepo.save(eventFacility);

    return eventFacility;
  }
}
