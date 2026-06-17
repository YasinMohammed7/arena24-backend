import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { BusinessEntity } from './entities/business.entity';

@Injectable()
export class BusinessService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    ownerId: string,
  ): Promise<BusinessEntity> {
    try {
      const business = await this.prisma.business.create({
        data: {
          ...createBusinessDto,
          ownerId,
        },
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true,
            },
          },
        },
      });

      return new BusinessEntity(business);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A business with this name already exists for this owner',
        );
      }
      throw error;
    }
  }

  async findAll(
    ownerId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{
    businesses: BusinessEntity[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [businesses, total] = await Promise.all([
      this.prisma.business.findMany({
        where: { ownerId },
        skip,
        take: limit,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true,
            },
          },
          _count: {
            select: {
              locations: true,
              userRoles: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.business.count({
        where: { ownerId },
      }),
    ]);

    return {
      businesses: businesses.map((business) => new BusinessEntity(business)),
      total,
      page,
      limit,
    };
  }

  async findOne(id: number, ownerId: string): Promise<BusinessEntity> {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        ownerId,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        locations: {
          where: {
            isActive: true,
            deletedAt: null,
          },
          include: {
            managers: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                    email: true,
                  },
                },
              },
            },
            schedule: true,
            LocationFacility: {
              include: {
                facility: true,
              },
            },
            LocationAmenity: {
              include: {
                amenity: true,
              },
            },
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            locations: true,
            userRoles: true,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return new BusinessEntity(business);
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
    ownerId: string,
  ): Promise<BusinessEntity> {
    const existingBusiness = await this.prisma.business.findFirst({
      where: {
        id,
        ownerId,
      },
    });

    if (!existingBusiness) {
      throw new NotFoundException('Business not found');
    }

    try {
      const business = await this.prisma.business.update({
        where: { id },
        data: updateBusinessDto,
        include: {
          owner: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          locations: {
            select: {
              id: true,
              name: true,
              type: true,
              isActive: true,
            },
          },
        },
      });

      return new BusinessEntity(business);
    } catch (error: any) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error.code === 'P2002') {
        throw new ConflictException(
          'A business with this name already exists for this owner',
        );
      }
      throw error;
    }
  }

  async remove(id: number, ownerId: string): Promise<void> {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        ownerId,
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    await this.prisma.business.delete({
      where: { id },
    });
  }

  async getBusinessStats(
    businessId: number,
    ownerId: string,
  ): Promise<{
    totalLocations: number;
    activeLocations: number;
    totalStaff: number;
    businessAge: number;
  }> {
    const business = await this.prisma.business.findFirst({
      where: {
        id: businessId,
        ownerId,
      },
      include: {
        _count: {
          select: {
            locations: true,
            userRoles: true,
          },
        },
        locations: {
          where: {
            isActive: true,
            deletedAt: null,
          },
        },
      },
    });

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    const businessAge = Math.floor(
      (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24),
    );

    return {
      totalLocations: business._count.locations,
      activeLocations: business.locations.length,
      totalStaff: business._count.userRoles,
      businessAge,
    };
  }

  async getBusinessesByUser(userId: string): Promise<BusinessEntity[]> {
    const businesses = await this.prisma.business.findMany({
      where: {
        OR: [
          { ownerId: userId },
          {
            userRoles: {
              some: {
                userId: userId,
              },
            },
          },
        ],
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        locations: {
          select: {
            id: true,
            name: true,
            type: true,
            isActive: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return businesses.map((business) => new BusinessEntity(business));
  }
}
