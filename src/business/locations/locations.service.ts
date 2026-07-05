import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, DataSource, IsNull } from "typeorm";
import { Locations } from "@/database/entities/locations";
import { Schedules } from "@/database/entities/schedules";
import { LocationFacilities } from "@/database/entities/locationFacilities";
import { LocationAmenities } from "@/database/entities/locationAmenities";
import { LocationManagers } from "@/database/entities/locationManagers";
import { UserBusinessRoles } from "@/database/entities/userBusinessRoles";
import { Media } from "@/database/entities/media";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";

@Injectable()
export class LocationsService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>,
    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,
    @InjectRepository(LocationFacilities)
    private readonly locationFacilitiesRepo: Repository<LocationFacilities>,
    @InjectRepository(LocationAmenities)
    private readonly locationAmenitiesRepo: Repository<LocationAmenities>,

    private readonly dataSource: DataSource
  ) {}

  // Loads a location with all its relations (owner/manager/role as User subsets).
  private locationWithRelationsQuery() {
    return this.locationRepo
      .createQueryBuilder("location")
      .leftJoinAndSelect("location.business", "business")
      .leftJoin("location.owner", "owner")
      .addSelect(["owner.id", "owner.name", "owner.email"])
      .leftJoinAndSelect("location.schedules", "schedule")
      .leftJoinAndSelect("location.locationFacilities", "locationFacility")
      .leftJoinAndSelect("locationFacility.facility", "facility")
      .leftJoinAndSelect("location.locationAmenities", "locationAmenity")
      .leftJoinAndSelect("locationAmenity.amenity", "amenity")
      .leftJoinAndSelect("location.locationManagers", "manager")
      .leftJoin("manager.user", "managerUser")
      .addSelect(["managerUser.id", "managerUser.name", "managerUser.email"])
      .leftJoinAndSelect("location.userBusinessRoles", "userRole")
      .leftJoin("userRole.user", "userRoleUser")
      .addSelect(["userRoleUser.id", "userRoleUser.name", "userRoleUser.email"])
      .leftJoin("userRole.role", "role")
      .addSelect(["role.id", "role.name"]);
  }

  async create(createLocationDto: CreateLocationDto) {
    const {
      schedules,
      facilityIds,
      amenityIds,
      managerIds,
      userRoles,
      ...locationData
    } = createLocationDto;

    const locationId = await this.dataSource.transaction(async (manager) => {
      const location: Locations = await manager.save(
        manager.create(Locations, locationData)
      );

      if (schedules?.length) {
        await manager.save(
          schedules.map((schedule) =>
            manager.create(Schedules, { ...schedule, locationId: location.id })
          )
        );
      }
      if (facilityIds?.length) {
        await manager.save(
          facilityIds.map((facilityId) =>
            manager.create(LocationFacilities, {
              facilityId,
              locationId: location.id,
            })
          )
        );
      }
      if (amenityIds?.length) {
        await manager.save(
          amenityIds.map((amenityId) =>
            manager.create(LocationAmenities, {
              amenityId,
              locationId: location.id,
            })
          )
        );
      }
      if (managerIds?.length) {
        await manager.save(
          managerIds.map((userId) =>
            manager.create(LocationManagers, {
              userId,
              locationId: location.id,
            })
          )
        );
      }
      if (userRoles?.length) {
        await manager.save(
          userRoles.map((role) =>
            manager.create(UserBusinessRoles, {
              userId: role.userId,
              roleId: role.roleId,
              businessId: location.businessId,
              locationId: location.id,
            })
          )
        );
      }

      return location.id;
    });

    return this.locationWithRelationsQuery()
      .where("location.id = :id", { id: locationId })
      .getOne();
  }

  async findAll(businessId?: number, ownerId?: string) {
    return this.locationRepo.find({
      // Load each relation in its own query — avoids the cartesian row
      // explosion that joining many one-to-many collections would cause.
      relationLoadStrategy: "query",
      where: {
        isActive: true,
        deletedAt: IsNull(),
        ...(businessId ? { businessId } : {}),
        ...(ownerId ? { ownerId } : {}),
      },
      relations: {
        business: true,
        owner: true,
        schedules: true,
        locationFacilities: { facility: true },
        locationAmenities: { amenity: true },
        events: true,
        offers: true,
        reviews: true,
      },
      select: {
        owner: { id: true, name: true, email: true },
      },
      order: { createdAt: "DESC" },
    });
  }

  async findOne(id: number) {
    const location = await this.locationWithRelationsQuery()
      .where("location.id = :id", { id })
      .andWhere("location.isActive = :isActive", { isActive: true })
      .andWhere("location.deletedAt IS NULL")
      .getOne();

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    const media = await this.mediaRepo.find({
      where: { modelType: "Location", modelId: id.toString() },
      order: { createdAt: "ASC" },
    });

    return {
      ...location,
      media,
    };
  }

  async update(id: number, updateLocationDto: UpdateLocationDto) {
    const {
      schedules,
      facilityIds,
      amenityIds,
      managerIds,
      userRoles,
      deletedAt,
      ...locationData
    } = updateLocationDto;

    // Check if location exists (and is active)
    await this.findOne(id);

    await this.dataSource.transaction(async (manager) => {
      // Update location scalar fields (skip if there is nothing to set)
      const scalarUpdate = {
        ...locationData,
        ...(deletedAt !== undefined && {
          deletedAt: deletedAt ? new Date(deletedAt) : null,
        }),
      };
      if (Object.keys(scalarUpdate).length > 0) {
        await manager.update(Locations, id, scalarUpdate);
      }

      // Replace schedules
      if (schedules) {
        await manager.delete(Schedules, { locationId: id });
        if (schedules.length > 0) {
          await manager.save(
            schedules.map((schedule) =>
              manager.create(Schedules, { ...schedule, locationId: id })
            )
          );
        }
      }

      // Replace facilities
      if (facilityIds) {
        await manager.delete(LocationFacilities, { locationId: id });
        if (facilityIds.length > 0) {
          await manager.save(
            facilityIds.map((facilityId) =>
              manager.create(LocationFacilities, { locationId: id, facilityId })
            )
          );
        }
      }

      // Replace amenities
      if (amenityIds) {
        await manager.delete(LocationAmenities, { locationId: id });
        if (amenityIds.length > 0) {
          await manager.save(
            amenityIds.map((amenityId) =>
              manager.create(LocationAmenities, { locationId: id, amenityId })
            )
          );
        }
      }

      // Replace managers
      if (managerIds) {
        await manager.delete(LocationManagers, { locationId: id });
        if (managerIds.length > 0) {
          await manager.save(
            managerIds.map((userId) =>
              manager.create(LocationManagers, { locationId: id, userId })
            )
          );
        }
      }

      // Replace user business roles (needs the location's businessId)
      if (userRoles) {
        await manager.delete(UserBusinessRoles, { locationId: id });
        if (userRoles.length > 0) {
          const currentLocation = await manager.findOne(Locations, {
            where: { id },
            select: { businessId: true },
          });
          if (!currentLocation) {
            throw new NotFoundException(`Location with ID ${id} not found`);
          }
          await manager.save(
            userRoles.map((role) =>
              manager.create(UserBusinessRoles, {
                locationId: id,
                userId: role.userId,
                roleId: role.roleId,
                businessId: currentLocation.businessId,
              })
            )
          );
        }
      }
    });

    // Return the updated location with all relations
    return this.locationWithRelationsQuery()
      .where("location.id = :id", { id })
      .getOne();
  }

  async remove(id: number) {
    // Check if location exists (and is active)
    await this.findOne(id);

    // Soft delete
    await this.locationRepo.update(id, {
      isActive: false,
      deletedAt: new Date(),
    });

    return this.locationRepo.findOneBy({ id });
  }

  async hardDelete(id: number) {
    // Check if location exists; keep the record to return after deletion.
    const location = await this.findOne(id);

    await this.locationRepo.delete(id);

    return location;
  }

  async addGallery(restaurantId: number, files: Express.Multer.File[]) {
    const mediaRecords = files.map((file) => {
      // Generate the relative path that should be stored in the database
      const relativePath = `/public/uploads/restaurants/${restaurantId}/gallery/${file.filename}`;
      const url = `/uploads/restaurants/${restaurantId}/gallery/${file.filename}`;

      return {
        modelType: "Location", // or 'Restaurant' depending on your business logic
        modelId: restaurantId.toString(),
        type: "gallery",
        fileName: file.filename,
        mimeType: file.mimetype,
        size: file.size,
        path: relativePath, // Store the relative path for database storage
        url: url, // Public URL (same as path in this case)
        altText: file.originalname,
        sortOrder: 0,
      };
    });

    await this.mediaRepo.insert(mediaRecords);

    return {
      message: "Gallery uploaded successfully",
      files: mediaRecords,
    };
  }

  async toggleLocationFacilityStatus(locationId: number, facilityId: number) {
    const locationFacility = await this.locationFacilitiesRepo.findOne({
      where: {
        locationId,
        facilityId,
      },
      relations: {
        facility: true,
        location: true,
      },
      select: {
        id: true,
        locationId: true,
        facilityId: true,
        isActive: true,
        facility: true,
        location: {
          id: true,
          name: true,
        },
      },
    });

    if (!locationFacility) {
      throw new NotFoundException(
        `LocationFacility relation not found for location ${locationId} and facility ${facilityId}`
      );
    }

    locationFacility.isActive = !locationFacility.isActive;

    await this.locationFacilitiesRepo.save(locationFacility);

    return locationFacility;
  }

  async toggleLocationAmenityStatus(locationId: number, amenityId: number) {
    const locationAmenity = await this.locationAmenitiesRepo.findOne({
      where: {
        locationId,
        amenityId,
      },
      relations: {
        amenity: true,
        location: true,
      },
      select: {
        id: true,
        locationId: true,
        amenityId: true,
        isActive: true,
        amenity: true,
        location: {
          id: true,
          name: true,
        },
      },
    });

    if (!locationAmenity) {
      throw new NotFoundException(
        `LocationAmenity relation not found for location ${locationId} and amenity ${amenityId}`
      );
    }

    locationAmenity.isActive = !locationAmenity.isActive;

    await this.locationAmenitiesRepo.save(locationAmenity);

    return locationAmenity;
  }
}
