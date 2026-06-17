import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewDto } from './dto/query-review.dto';
import { ReviewResponseDto } from './dto/review-response.dto';

@Injectable()
export class ReviewService {
  constructor(private prisma: PrismaService) {}

  async create(
    createReviewDto: CreateReviewDto,
    userId: string,
  ): Promise<ReviewResponseDto> {
    const { locationId, comment, stars } = createReviewDto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if location exists
    const location = await this.prisma.location.findUnique({
      where: { id: locationId },
    });
    if (!location) {
      throw new BadRequestException('Location not found');
    }

    // Check if review already exists (unique constraint)
    const existingReview = await this.prisma.review.findUnique({
      where: {
        userId_locationId: {
          userId,
          locationId,
        },
      },
    });

    if (existingReview) {
      throw new ConflictException('User has already reviewed this location');
    }

    const review = await this.prisma.review.create({
      data: {
        comment,
        stars,
        userId,
        locationId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return review;
  }

  async findAll(queryDto: QueryReviewDto = {}): Promise<{
    data: ReviewResponseDto[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const { locationId, userId, minStars, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (locationId) where.locationId = locationId;
    if (userId) where.userId = userId;
    if (minStars) where.stars = { gte: minStars };

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: reviews,
      total,
      page,
      limit,
      totalPages,
    };
  }

  async findOne(id: number): Promise<ReviewResponseDto> {
    const review = await this.prisma.review.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByLocation(
    locationId: number,
    queryDto: QueryReviewDto = {},
  ): Promise<{
    data: ReviewResponseDto[];
    total: number;
    averageRating: number;
  }> {
    const { minStars, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const where: any = { locationId };
    if (minStars) where.stars = { gte: minStars };

    const [reviews, total, avgResult] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          location: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
      }),
      this.prisma.review.count({ where }),
      this.prisma.review.aggregate({
        where: { locationId },
        _avg: {
          stars: true,
        },
      }),
    ]);

    const averageRating = avgResult._avg.stars || 0;

    return {
      data: reviews,
      total,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimal places
    };
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto,
  ): Promise<ReviewResponseDto> {
    // Check if review exists
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    const review = await this.prisma.review.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        location: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return review;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if review exists
    const existingReview = await this.prisma.review.findUnique({
      where: { id },
    });

    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    await this.prisma.review.delete({
      where: { id },
    });

    return { message: `Review with ID ${id} has been deleted` };
  }

  async getLocationStats(locationId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { stars: number; count: number }[];
  }> {
    const [total, avgResult, distribution] = await Promise.all([
      this.prisma.review.count({ where: { locationId } }),
      this.prisma.review.aggregate({
        where: { locationId },
        _avg: { stars: true },
      }),
      this.prisma.review.groupBy({
        by: ['stars'],
        where: { locationId },
        _count: { stars: true },
        orderBy: { stars: 'asc' },
      }),
    ]);

    const averageRating = avgResult._avg.stars || 0;
    const ratingDistribution = distribution.map((item) => ({
      stars: item.stars,
      count: item._count.stars,
    }));

    return {
      totalReviews: total,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
    };
  }
}
