import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { CreateAmenityDto } from './dto/create-amenity.dto';
import { UpdateAmenityDto } from './dto/update-amenity.dto';
import { PrismaService } from '@/prisma/prisma.service';
import { promises as fs } from 'fs';
import * as path from 'path';

@Injectable()
export class AmenityService {
  constructor(private prisma: PrismaService) { }

  async create(createAmenityDto: CreateAmenityDto) {
    try {
      return await this.prisma.amenity.create({
        data: createAmenityDto,
        include: {
          _count: {
            select: { locations: true },
          },
        },
      });
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Amenity with name '${createAmenityDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false) {
    const where = includeInactive ? {} : { isActive: true };

    return await this.prisma.amenity.findMany({
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
    const amenity = await this.prisma.amenity.findUnique({
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

    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found`);
    }

    return amenity;
  }

  async update(id: number, updateAmenityDto: UpdateAmenityDto) {
    const amenity = await this.findOne(id); // Check if exists

    try {
      const updated = await this.prisma.amenity.update({
        where: { id },
        data: updateAmenityDto,
        include: {
          _count: {
            select: { locations: true },
          },
        },
      });

      if (updateAmenityDto.iconUrl && amenity.iconUrl) {
        const absPath = path.join(process.cwd(), 'public', amenity.iconUrl);
        try {
          await fs.unlink(absPath);
        } catch (err) {
          if (err.code !== 'ENOENT') {
            console.error('Error deleting old file:', err);
          }
        }
      }

      return updated;
    } catch (error) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          `Amenity with name '${updateAmenityDto.name}' already exists`,
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const amenity = await this.findOne(id);

    // Check if amenity is being used by any locations
    const locationCount = await this.prisma.locationAmenity.count({
      where: { amenityId: id },
    });

    if (locationCount > 0) {
      throw new ConflictException(
        `Cannot delete amenity '${amenity.name}' as it is being used by ${locationCount} location(s). Remove it from all locations first.`,
      );
    }

    return await this.prisma.amenity.delete({
      where: { id },
    });
  }

  async toggleStatus(id: number) {
    const amenity = await this.findOne(id);

    return await this.prisma.amenity.update({
      where: { id },
      data: { isActive: !amenity.isActive },
      include: {
        _count: {
          select: { locations: true },
        },
      },
    });
  }

  async getLocationsByAmenity(id: number) {
    await this.findOne(id); // Check if amenity exists

    return await this.prisma.locationAmenity.findMany({
      where: { amenityId: id },
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
