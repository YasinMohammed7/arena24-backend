import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateLocationDto } from "./dto/create-location.dto";
import { UpdateLocationDto } from "./dto/update-location.dto";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class LocationsService {
  constructor(private prisma: PrismaService) {}

  async create(createLocationDto: CreateLocationDto) {
    const {
      schedules,
      facilityIds,
      amenityIds,
      managerIds,
      userRoles,
      ...locationData
    } = createLocationDto;

    return this.prisma.location.create({
      data: {
        ...locationData,
        schedule: schedules
          ? {
              create: schedules,
            }
          : undefined,
        LocationFacility: facilityIds
          ? {
              create: facilityIds.map((facilityId) => ({ facilityId })),
            }
          : undefined,
        LocationAmenity: amenityIds
          ? {
              create: amenityIds.map((amenityId) => ({ amenityId })),
            }
          : undefined,
        managers: managerIds
          ? {
              create: managerIds.map((userId) => ({ userId })),
            }
          : undefined,
        userRoles: userRoles
          ? {
              create: userRoles.map((role) => ({
                userId: role.userId,
                roleId: role.roleId,
                businessId: locationData.businessId, // Add businessId from location
              })),
            }
          : undefined,
      },
      include: {
        business: true,
        owner: { select: { id: true, name: true, email: true } },
        schedule: true,
        LocationFacility: { include: { facility: true } },
        LocationAmenity: { include: { amenity: true } },
        managers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        userRoles: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            role: { select: { id: true, name: true } },
          },
        },
      },
    });
  }

  async findAll(businessId?: number, ownerId?: string) {
    const where: {
      isActive: boolean;
      deletedAt: null;
      businessId?: number;
      ownerId?: string;
    } = {
      isActive: true,
      deletedAt: null,
    };

    if (businessId) where.businessId = businessId;
    if (ownerId) where.ownerId = ownerId;

    return this.prisma.location.findMany({
      where,
      include: {
        business: true,
        owner: { select: { id: true, name: true, email: true } },
        schedule: true,
        LocationFacility: { include: { facility: true } },
        LocationAmenity: { include: { amenity: true } },
        events: true,
        Offer: true,
        Review: true,
        _count: { select: { managers: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: number) {
    const location = await this.prisma.location.findUnique({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
      include: {
        business: true,
        owner: { select: { id: true, name: true, email: true } },
        schedule: true,
        LocationFacility: { include: { facility: true } },
        LocationAmenity: { include: { amenity: true } },
        managers: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        userRoles: {
          include: {
            user: { select: { id: true, name: true, email: true } },
            role: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException(`Location with ID ${id} not found`);
    }

    const media = await this.prisma.media.findMany({
      where: { modelType: "Location", modelId: id.toString() },
      orderBy: { createdAt: "asc" },
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
      ...locationData
    } = updateLocationDto;

    // Check if location exists
    await this.findOne(id);

    return this.prisma.$transaction(async (prisma) => {
      // Update location data
      await prisma.location.update({
        where: { id },
        data: locationData,
      });

      // Update schedules if provided
      if (schedules) {
        await prisma.schedules.deleteMany({ where: { locationId: id } });
        if (schedules.length > 0) {
          await prisma.schedules.createMany({
            data: schedules.map((schedule) => ({
              ...schedule,
              locationId: id,
            })),
          });
        }
      }

      // Update facilities if provided
      if (facilityIds) {
        await prisma.locationFacility.deleteMany({ where: { locationId: id } });
        if (facilityIds.length > 0) {
          await prisma.locationFacility.createMany({
            data: facilityIds.map((facilityId) => ({
              locationId: id,
              facilityId,
            })),
          });
        }
      }

      // Update amenities if provided
      if (amenityIds) {
        await prisma.locationAmenity.deleteMany({ where: { locationId: id } });
        if (amenityIds.length > 0) {
          await prisma.locationAmenity.createMany({
            data: amenityIds.map((amenityId) => ({
              locationId: id,
              amenityId,
            })),
          });
        }
      }

      // Update managers if provided
      if (managerIds) {
        await prisma.locationManager.deleteMany({ where: { locationId: id } });
        if (managerIds.length > 0) {
          await prisma.locationManager.createMany({
            data: managerIds.map((userId) => ({
              locationId: id,
              userId,
            })),
          });
        }
      }

      // Update user roles if provided
      if (userRoles) {
        await prisma.userBusinessRole.deleteMany({ where: { locationId: id } });
        if (userRoles.length > 0) {
          // Get the current location to access its businessId
          const currentLocation = await prisma.location.findUnique({
            where: { id },
            select: { businessId: true },
          });

          if (!currentLocation) {
            throw new NotFoundException(`Location with ID ${id} not found`);
          }

          await prisma.userBusinessRole.createMany({
            data: userRoles.map((role) => ({
              locationId: id,
              userId: role.userId,
              roleId: role.roleId,
              businessId: currentLocation.businessId, // Add businessId from location
            })),
          });
        }
      }

      // Return updated location with relations
      return prisma.location.findUnique({
        where: { id },
        include: {
          business: true,
          owner: { select: { id: true, name: true, email: true } },
          schedule: true,
          LocationFacility: { include: { facility: true } },
          LocationAmenity: { include: { amenity: true } },
          managers: {
            include: {
              user: { select: { id: true, name: true, email: true } },
            },
          },
          userRoles: {
            include: {
              user: { select: { id: true, name: true, email: true } },
              role: { select: { id: true, name: true } },
            },
          },
        },
      });
    });
  }

  async remove(id: number) {
    // Check if location exists
    await this.findOne(id);

    // Soft delete
    return this.prisma.location.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });
  }

  async hardDelete(id: number) {
    // Check if location exists
    await this.findOne(id);

    return this.prisma.location.delete({
      where: { id },
    });
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

    await this.prisma.media.createMany({
      data: mediaRecords,
    });

    return {
      message: "Gallery uploaded successfully",
      files: mediaRecords,
    };
  }

  async toggleLocationFacilityStatus(locationId: number, facilityId: number) {
    // Check if the location-facility relation exists
    const locationFacility = await this.prisma.locationFacility.findUnique({
      where: {
        facilityId_locationId: {
          locationId,
          facilityId,
        },
      },
      include: {
        facility: true,
        location: {
          select: { id: true, name: true },
        },
      },
    });

    if (!locationFacility) {
      throw new NotFoundException(
        `LocationFacility relation not found for location ${locationId} and facility ${facilityId}`
      );
    }

    return this.prisma.locationFacility.update({
      where: {
        facilityId_locationId: {
          locationId,
          facilityId,
        },
      },
      data: { isActive: !locationFacility.isActive },
      include: {
        facility: true,
        location: {
          select: { id: true, name: true },
        },
      },
    });
  }

  async toggleLocationAmenityStatus(locationId: number, amenityId: number) {
    // Check if the location-amenity relation exists
    const locationAmenity = await this.prisma.locationAmenity.findUnique({
      where: {
        locationId_amenityId: {
          locationId,
          amenityId,
        },
      },
      include: {
        amenity: true,
        location: {
          select: { id: true, name: true },
        },
      },
    });

    if (!locationAmenity) {
      throw new NotFoundException(
        `LocationAmenity relation not found for location ${locationId} and amenity ${amenityId}`
      );
    }

    return this.prisma.locationAmenity.update({
      where: {
        locationId_amenityId: {
          locationId,
          amenityId,
        },
      },
      data: { isActive: !locationAmenity.isActive },
      include: {
        amenity: true,
        location: {
          select: { id: true, name: true },
        },
      },
    });
  }
}
