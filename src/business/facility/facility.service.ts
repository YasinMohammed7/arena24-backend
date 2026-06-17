import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateFacilityDto } from './dto/create-facility.dto';
import { UpdateFacilityDto } from './dto/update-facility.dto';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class FacilityService {
  constructor(private prisma: PrismaService) {}

  async create(createFacilityDto: CreateFacilityDto) {
    try {
      return await this.prisma.facility.create({
        data: createFacilityDto,
        include: {
          _count: {
            select: { locations: true },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Facility with name '${createFacilityDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    return await this.prisma.facility.findMany({
      where,
      include: {
        _count: {
          select: { locations: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: number) {
    const facility = await this.prisma.facility.findUnique({
      where: { id },
      include: {
        locations: {
          include: {
            location: {
              select: {
                id: true,
                name: true,
                type: true,
                isActive: true,
              },
            },
          },
        },
        _count: {
          select: { locations: true },
        },
      },
    });

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }

    return facility;
  }

  async update(id: number, updateFacilityDto: UpdateFacilityDto) {
    await this.findOne(id); // Check if exists

    try {
      return await this.prisma.facility.update({
        where: { id },
        data: updateFacilityDto,
        include: {
          _count: {
            select: { locations: true },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Facility with name '${updateFacilityDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const facility = await this.findOne(id);

    // Check if facility is being used by any locations
    const locationCount = await this.prisma.locationFacility.count({
      where: { facilityId: id },
    });

    if (locationCount > 0) {
      throw new ConflictException(
        `Cannot delete facility '${facility.name}' as it is being used by ${locationCount} location(s). Remove it from all locations first.`,
      );
    }

    return await this.prisma.facility.delete({
      where: { id },
    });
  }

  async toggleStatus(id: number) {
    const facility = await this.findOne(id);

    return await this.prisma.facility.update({
      where: { id },
      data: { isActive: !facility.isActive },
      include: {
        _count: {
          select: { locations: true },
        },
      },
    });
  }

  async getLocationsByFacility(id: number) {
    await this.findOne(id); // Check if facility exists

    return await this.prisma.locationFacility.findMany({
      where: { facilityId: id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
            isActive: true,
            business: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }
}
