import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { Prisma, OfferCategory } from "@prisma/client";
import { ParsedQueryOfferDto } from "./dto/query-offer.dto";
import { OfferResponseDto } from "./dto/offer-response.dto";
import { QueryOfferCategoryDto } from "@/business/offer-category/dto/query-offer-category.dto";
import { OfferCategoryResponseDto } from "@/business/offer-category/dto/offer-category-response.dto";

// Type for offer with included relations
type OfferWithRelations = Prisma.OfferGetPayload<{
  include: {
    location: {
      select: {
        id: true;
        name: true;
        type: true;
        address: true;
      };
    };
    category: {
      select: {
        id: true;
        name: true;
      };
    };
  };
}>;

@Injectable()
export class ClientService {
  constructor(private prisma: PrismaService) {}

  async findAllActiveLocations() {
    return this.prisma.location.findMany({
      where: {
        isActive: true,
        deletedAt: null,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        schedule: true,
        LocationFacility: {
          where: {
            isActive: true,
          },
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        LocationAmenity: {
          where: {
            isActive: true,
          },
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                description: true,
                iconUrl: true,
                isActive: true,
              },
            },
          },
        },
        events: {
          where: {
            date: {
              gte: new Date(), // Only show future events
            },
          },
          select: {
            id: true,
            name: true,
            description: true,
            date: true,
            startHour: true,
            endHour: true,
            price: true,
            imageUrl: true,
          },
        },
        Offer: {
          where: {
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            name: true,
            description: true,
            discount: true,
            image: true,
            startDate: true,
            endDate: true,
          },
        },
        Review: {
          select: {
            id: true,
            stars: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async findActiveLocationById(id: number) {
    const location = await this.prisma.location.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
      },
      include: {
        business: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        schedule: true,
        LocationFacility: {
          where: {
            isActive: true,
          },
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        LocationAmenity: {
          where: {
            isActive: true,
          },
          include: {
            amenity: {
              select: {
                id: true,
                name: true,
                description: true,
                iconUrl: true,
                isActive: true,
              },
            },
          },
        },
        events: {
          where: {
            date: {
              gte: new Date(), // Only show future events
            },
          },
          select: {
            id: true,
            name: true,
            description: true,
            date: true,
            startHour: true,
            endHour: true,
            price: true,
            imageUrl: true,
          },
          orderBy: {
            date: "asc",
          },
        },
        Offer: {
          where: {
            startDate: {
              lte: new Date(),
            },
            endDate: {
              gte: new Date(),
            },
          },
          select: {
            id: true,
            name: true,
            description: true,
            discount: true,
            image: true,
            startDate: true,
            endDate: true,
          },
        },
        Review: {
          select: {
            id: true,
            stars: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!location) {
      throw new NotFoundException("Location not found or not active");
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

  async findAllActiveEvents() {
    return this.prisma.event.findMany({
      where: {
        date: {
          gte: new Date(), // Only show future events
        },
        location: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            business: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        facilities: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        includedOptions: true,
        requirements: true,
        _count: {
          select: { reservations: true },
        },
      },
      orderBy: { date: "asc" },
    });
  }

  async findActiveEventById(id: number) {
    const event = await this.prisma.event.findFirst({
      where: {
        id,
        date: {
          gte: new Date(), // Only show future events
        },
        location: {
          isActive: true,
          deletedAt: null,
        },
      },
      include: {
        location: {
          select: {
            id: true,
            name: true,
            address: true,
            business: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        facilities: {
          include: {
            facility: {
              select: {
                id: true,
                name: true,
                isActive: true,
              },
            },
          },
        },
        includedOptions: true,
        requirements: true,
        _count: {
          select: { reservations: true },
        },
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found or not available");
    }

    return event;
  }

  /**
   * Find all offers with filtering support
   * Example queries supported:
   * ?activeOnly=true - Show only currently active offers
   * ?globalOnly=true - Show only global offers (no location)
   * ?locationId=1&categoryId=2 - Specific location and category
   * ?minDiscount=20 - Only offers with 20%+ discount
   * ?name=pizza - Search offers containing "pizza"
   * ?startDate=2025-08-01&endDate=2025-12-31 - Date range filtering
   */
  async findAllOffers(queryDto: ParsedQueryOfferDto = {}): Promise<{
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

    const where: Prisma.OfferWhereInput = {};

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
        orderBy: [{ endDate: "asc" }, { createdAt: "desc" }],
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
    const mappedOffers = offers.map((offer) =>
      this.mapOfferToResponseDto(offer)
    );

    return {
      data: mappedOffers,
      total,
      page,
      limit,
      totalPages,
    };
  }

  /**
   * Find a single offer by ID
   */
  async findOneOffer(id: number): Promise<OfferResponseDto> {
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

    return this.mapOfferToResponseDto(offer);
  }

  async findAllOfferCategories(queryDto: QueryOfferCategoryDto = {}): Promise<{
    data: OfferCategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { name, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: Prisma.OfferCategoryWhereInput = {};

    // Filter by name (partial match)
    if (name) {
      where.name = {
        contains: name,
      };
    }

    const [categories, total] = await Promise.all([
      this.prisma.offerCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              offers: {
                where: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() },
                },
              },
            },
          },
        },
      }),
      this.prisma.offerCategory.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);
    const mappedCategories = categories.map((category) =>
      this.mapToResponseDto(category, category._count.offers)
    );

    return {
      data: mappedCategories,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<OfferCategoryResponseDto> {
    const category = await this.prisma.offerCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            offers: {
              where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() },
              },
            },
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    return this.mapToResponseDto(category, category._count.offers);
  }

  private mapToResponseDto(
    category: OfferCategory,
    offerCount: number
  ): OfferCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      offerCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  private mapOfferToResponseDto(offer: OfferWithRelations): OfferResponseDto {
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
