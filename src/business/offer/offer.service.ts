import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';

@Injectable()
export class OfferService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferDto: CreateOfferDto): Promise<OfferResponseDto> {
    const { locationId, categoryId, startDate, endDate, ...offerData } =
      createOfferDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException('Start date must be before end date');
    }

    // Check if category exists
    const category = await this.prisma.offerCategory.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new BadRequestException('Offer category not found');
    }

    // Check if location exists (if provided)
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        throw new BadRequestException('Location not found');
      }
    }

    const offer = await this.prisma.offer.create({
      data: {
        ...offerData,
        startDate: start,
        endDate: end,
        locationId,
        categoryId,
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponseDto(offer);
  }

  async findAll(queryDto: QueryOfferDto = {}): Promise<{
    data: OfferResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const {
      locationId,
      categoryId,
      name,
      startDate,
      endDate,
      minDiscount,
      activeOnly = true,
      globalOnly = false,
      page = 1,
      limit = 10,
    } = queryDto;

    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {};

    // Filter by location
    if (globalOnly) {
      where.locationId = null;
    } else if (locationId) {
      where.locationId = locationId;
    }

    // Filter by category
    if (categoryId) where.categoryId = categoryId;

    // Filter by name (partial match)
    if (name) {
      where.name = {
        contains: name,
      };
    }

    // Filter by date range
    if (startDate || endDate || activeOnly) {
      where.AND = [];

      if (startDate) {
        where.AND.push({
          startDate: {
            gte: new Date(startDate),
          },
        });
      }

      if (endDate) {
        where.AND.push({
          endDate: {
            lte: new Date(endDate),
          },
        });
      }

      // Show only active offers
      if (activeOnly) {
        where.AND.push({
          startDate: {
            lte: now,
          },
          endDate: {
            gte: now,
          },
        });
      }
    }

    // Filter by minimum discount
    if (minDiscount !== undefined) {
      where.discount = {
        gte: minDiscount,
      };
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { endDate: 'asc' }, // Show expiring offers first
          { createdAt: 'desc' },
        ],
        include: {
          location: {
            select: {
              id: true,
              name: true,
              type: true,
              address: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      }),
      this.prisma.offer.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const mappedOffers = offers.map((offer) => this.mapToResponseDto(offer));

    return {
      data: mappedOffers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<OfferResponseDto> {
    const offer = await this.prisma.offer.findUnique({
      where: { id },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return this.mapToResponseDto(offer);
  }

  async findByLocation(
    locationId: number,
    queryDto: QueryOfferDto = {},
  ): Promise<{
    data: OfferResponseDto[];
    total: number;
    activeOffers: number;
  }> {
    const modifiedQuery = { ...queryDto, locationId };
    const result = await this.findAll(modifiedQuery);

    // Count active offers for this location
    const now = new Date();
    const activeOffers = await this.prisma.offer.count({
      where: {
        locationId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return {
      data: result.data,
      total: result.total,
      activeOffers,
    };
  }

  async findByCategory(
    categoryId: number,
    queryDto: QueryOfferDto = {},
  ): Promise<{
    data: OfferResponseDto[];
    total: number;
    activeOffers: number;
  }> {
    const modifiedQuery = { ...queryDto, categoryId };
    const result = await this.findAll(modifiedQuery);

    // Count active offers for this category
    const now = new Date();
    const activeOffers = await this.prisma.offer.count({
      where: {
        categoryId,
        startDate: { lte: now },
        endDate: { gte: now },
      },
    });

    return {
      data: result.data,
      total: result.total,
      activeOffers,
    };
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto,
  ): Promise<OfferResponseDto> {
    // Check if offer exists
    const existingOffer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    const { locationId, categoryId, startDate, endDate, ...offerData } =
      updateOfferDto;

    // Validate dates if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : existingOffer.startDate;
      const end = endDate ? new Date(endDate) : existingOffer.endDate;

      if (start >= end) {
        throw new BadRequestException('Start date must be before end date');
      }
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await this.prisma.offerCategory.findUnique({
        where: { id: categoryId },
      });
      if (!category) {
        throw new BadRequestException('Offer category not found');
      }
    }

    // Check if location exists (if provided)
    if (locationId) {
      const location = await this.prisma.location.findUnique({
        where: { id: locationId },
      });
      if (!location) {
        throw new BadRequestException('Location not found');
      }
    }

    const updateData: any = { ...offerData };
    if (startDate) updateData.startDate = new Date(startDate);
    if (endDate) updateData.endDate = new Date(endDate);
    if (locationId !== undefined) updateData.locationId = locationId;
    if (categoryId) updateData.categoryId = categoryId;

    const offer = await this.prisma.offer.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: {
            id: true,
            name: true,
            type: true,
            address: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return this.mapToResponseDto(offer);
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if offer exists
    const existingOffer = await this.prisma.offer.findUnique({
      where: { id },
    });

    if (!existingOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    await this.prisma.offer.delete({
      where: { id },
    });

    return { message: `Offer with ID ${id} has been deleted` };
  }

  async getOfferStats(): Promise<{
    totalOffers: number;
    activeOffers: number;
    expiredOffers: number;
    upcomingOffers: number;
    offersByCategory: { category: string; count: number }[];
  }> {
    const now = new Date();

    const [total, active, expired, upcoming, byCategory] = await Promise.all([
      this.prisma.offer.count(),
      this.prisma.offer.count({
        where: {
          startDate: { lte: now },
          endDate: { gte: now },
        },
      }),
      this.prisma.offer.count({
        where: {
          endDate: { lt: now },
        },
      }),
      this.prisma.offer.count({
        where: {
          startDate: { gt: now },
        },
      }),
      this.prisma.offer.groupBy({
        by: ['categoryId'],
        _count: { categoryId: true },
        orderBy: { _count: { categoryId: 'desc' } },
      }),
    ]);

    // Get category names
    const categoryIds = byCategory.map((item) => item.categoryId);
    const categories = await this.prisma.offerCategory.findMany({
      where: { id: { in: categoryIds } },
      select: { id: true, name: true },
    });

    const offersByCategory = byCategory.map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId);
      return {
        category: category?.name || 'Unknown',
        count: item._count.categoryId,
      };
    });

    return {
      totalOffers: total,
      activeOffers: active,
      expiredOffers: expired,
      upcomingOffers: upcoming,
      offersByCategory,
    };
  }

  private mapToResponseDto(offer: any): OfferResponseDto {
    const now = new Date();
    const isActive = offer.startDate <= now && offer.endDate >= now;

    return {
      id: offer.id,
      name: offer.name,
      description: offer.description,
      image: offer.image,
      startDate: offer.startDate,
      endDate: offer.endDate,
      discount: offer.discount,
      location: offer.location,
      category: offer.category,
      isActive,
      createdAt: offer.createdAt,
      updatedAt: offer.updatedAt,
    };
  }
}
