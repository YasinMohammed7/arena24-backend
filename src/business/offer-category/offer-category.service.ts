import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateOfferCategoryDto } from './dto/create-offer-category.dto';
import { UpdateOfferCategoryDto } from './dto/update-offer-category.dto';
import { QueryOfferCategoryDto } from './dto/query-offer-category.dto';
import { OfferCategoryResponseDto } from './dto/offer-category-response.dto';

@Injectable()
export class OfferCategoryService {
  constructor(private prisma: PrismaService) {}

  async create(createOfferCategoryDto: CreateOfferCategoryDto): Promise<OfferCategoryResponseDto> {
    const { name } = createOfferCategoryDto;

    // Check if category with the same name already exists
    const existingCategory = await this.prisma.offerCategory.findUnique({
      where: { name }
    });

    if (existingCategory) {
      throw new ConflictException(`Offer category with name '${name}' already exists`);
    }

    const category = await this.prisma.offerCategory.create({
      data: { name }
    });

    return this.mapToResponseDto(category, 0);
  }

  async findAll(queryDto: QueryOfferCategoryDto = {}): Promise<{
    data: OfferCategoryResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { name, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by name (partial match)
    if (name) {
      where.name = {
        contains: name
      };
    }

    const [categories, total] = await Promise.all([
      this.prisma.offerCategory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { name: 'asc' },
        include: {
          _count: {
            select: {
              offers: {
                where: {
                  startDate: { lte: new Date() },
                  endDate: { gte: new Date() }
                }
              }
            }
          }
        }
      }),
      this.prisma.offerCategory.count({ where })
    ]);

    const totalPages = Math.ceil(total / limit);
    const mappedCategories = categories.map(category =>
      this.mapToResponseDto(category, category._count.offers)
    );

    return {
      data: mappedCategories,
      total,
      page,
      limit,
      totalPages
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
                endDate: { gte: new Date() }
              }
            }
          }
        }
      }
    });

    if (!category) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    return this.mapToResponseDto(category, category._count.offers);
  }

  async findWithOffers(id: number, includeInactive = false): Promise<{
    category: OfferCategoryResponseDto;
    offers: any[];
  }> {
    const now = new Date();
    const whereCondition = includeInactive
      ? {}
      : {
          startDate: { lte: now },
          endDate: { gte: now }
        };

    const category = await this.prisma.offerCategory.findUnique({
      where: { id },
      include: {
        offers: {
          where: whereCondition,
          include: {
            location: {
              select: {
                id: true,
                name: true,
                type: true,
                address: true
              }
            }
          },
          orderBy: { endDate: 'asc' }
        }
      }
    });

    if (!category) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    return {
      category: this.mapToResponseDto(category, category.offers.length),
      offers: category.offers
    };
  }

  async update(id: number, updateOfferCategoryDto: UpdateOfferCategoryDto): Promise<OfferCategoryResponseDto> {
    const { name } = updateOfferCategoryDto;

    // Check if category exists
    const existingCategory = await this.prisma.offerCategory.findUnique({
      where: { id }
    });

    if (!existingCategory) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    // Check if new name conflicts with existing category
    if (name && name !== existingCategory.name) {
      const nameConflict = await this.prisma.offerCategory.findUnique({
        where: { name }
      });

      if (nameConflict) {
        throw new ConflictException(`Offer category with name '${name}' already exists`);
      }
    }

    const category = await this.prisma.offerCategory.update({
      where: { id },
      data: updateOfferCategoryDto,
      include: {
        _count: {
          select: {
            offers: {
              where: {
                startDate: { lte: new Date() },
                endDate: { gte: new Date() }
              }
            }
          }
        }
      }
    });

    return this.mapToResponseDto(category, category._count.offers);
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if category exists
    const existingCategory = await this.prisma.offerCategory.findUnique({
      where: { id },
      include: {
        _count: {
          select: { offers: true }
        }
      }
    });

    if (!existingCategory) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    // Check if category has associated offers
    if (existingCategory._count.offers > 0) {
      throw new ConflictException(
        `Cannot delete category '${existingCategory.name}' because it has ${existingCategory._count.offers} associated offer(s). Please delete or reassign the offers first.`
      );
    }

    await this.prisma.offerCategory.delete({
      where: { id }
    });

    return { message: `Offer category '${existingCategory.name}' has been deleted successfully` };
  }

  async getCategoryStats(): Promise<{
    totalCategories: number;
    categoriesWithActiveOffers: number;
    categoryDistribution: {
      category: string;
      totalOffers: number;
      activeOffers: number;
    }[];
  }> {
    const now = new Date();

    const [total, categoriesWithOffers, distribution] = await Promise.all([
      this.prisma.offerCategory.count(),
      this.prisma.offerCategory.count({
        where: {
          offers: {
            some: {
              startDate: { lte: now },
              endDate: { gte: now }
            }
          }
        }
      }),
      this.prisma.offerCategory.findMany({
        include: {
          _count: {
            select: {
              offers: true
            }
          },
          offers: {
            where: {
              startDate: { lte: now },
              endDate: { gte: now }
            }
          }
        },
        orderBy: { name: 'asc' }
      })
    ]);

    const categoryDistribution = distribution.map(category => ({
      category: category.name,
      totalOffers: category._count.offers,
      activeOffers: category.offers.length
    }));

    return {
      totalCategories: total,
      categoriesWithActiveOffers: categoriesWithOffers,
      categoryDistribution
    };
  }

  private mapToResponseDto(category: any, offerCount: number): OfferCategoryResponseDto {
    return {
      id: category.id,
      name: category.name,
      offerCount,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt
    };
  }
}
