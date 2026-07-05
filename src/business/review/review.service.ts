import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Reviews } from "@/database/entities/reviews";
import { User } from "@/database/entities/user";
import { Locations } from "@/database/entities/locations";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { QueryReviewDto } from "./dto/query-review.dto";
import { ReviewResponseDto } from "./dto/review-response.dto";
import { PaginatedResult, paginate } from "@/common/dto/paginated-result";

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Reviews)
    private readonly reviewRepo: Repository<Reviews>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>
  ) {}

  // Loads a review with its user + location subsets.
  private reviewWithRelationsQuery() {
    return this.reviewRepo
      .createQueryBuilder("review")
      .leftJoin("review.user", "user")
      .addSelect(["user.id", "user.name", "user.email"])
      .leftJoin("review.location", "location")
      .addSelect(["location.id", "location.name", "location.type"]);
  }

  async create(
    createReviewDto: CreateReviewDto,
    userId: string
  ): Promise<ReviewResponseDto> {
    const { locationId, comment, stars } = createReviewDto;

    const user = await this.userRepo.findOneBy({ id: userId });
    if (!user) {
      throw new BadRequestException("User not found");
    }

    const location = await this.locationRepo.findOneBy({ id: locationId });
    if (!location) {
      throw new BadRequestException("Location not found");
    }

    // Unique review per (user, location)
    const existingReview = await this.reviewRepo.findOneBy({
      userId,
      locationId,
    });
    if (existingReview) {
      throw new ConflictException("User has already reviewed this location");
    }

    const newReview = this.reviewRepo.create({
      comment: comment ?? null,
      stars,
      userId,
      locationId,
    });
    const saved: Reviews = await this.reviewRepo.save(newReview);

    return this.findOne(saved.id);
  }

  async findAll(
    queryDto: QueryReviewDto = {}
  ): Promise<PaginatedResult<ReviewResponseDto>> {
    const { locationId, userId, minStars, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.reviewWithRelationsQuery()
      .orderBy("review.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (locationId) {
      queryBuilder.andWhere("review.locationId = :locationId", { locationId });
    }
    if (userId) {
      queryBuilder.andWhere("review.userId = :userId", { userId });
    }
    if (minStars) {
      queryBuilder.andWhere("review.stars >= :minStars", { minStars });
    }

    const [data, total] = await queryBuilder.getManyAndCount();
    return paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<ReviewResponseDto> {
    const review = await this.reviewWithRelationsQuery()
      .where("review.id = :id", { id })
      .getOne();

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    return review;
  }

  async findByLocation(
    locationId: number,
    queryDto: QueryReviewDto = {}
  ): Promise<{
    data: ReviewResponseDto[];
    total: number;
    averageRating: number;
  }> {
    const { minStars, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.reviewWithRelationsQuery()
      .where("review.locationId = :locationId", { locationId })
      .orderBy("review.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    if (minStars) {
      queryBuilder.andWhere("review.stars >= :minStars", { minStars });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    // Average rating across all reviews for the location (ignores minStars).
    const avgRaw = await this.reviewRepo
      .createQueryBuilder("review")
      .select("AVG(review.stars)", "avg")
      .where("review.locationId = :locationId", { locationId })
      .getRawOne<{ avg: string | null }>();

    const averageRating = avgRaw?.avg ? Number(avgRaw.avg) : 0;

    return {
      data,
      total,
      averageRating: Math.round(averageRating * 100) / 100,
    };
  }

  async update(
    id: number,
    updateReviewDto: UpdateReviewDto
  ): Promise<ReviewResponseDto> {
    const existingReview = await this.reviewRepo.findOneBy({ id });
    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    await this.reviewRepo.update(id, updateReviewDto);
    return this.findOne(id);
  }

  async remove(id: number): Promise<{ message: string }> {
    const existingReview = await this.reviewRepo.findOneBy({ id });
    if (!existingReview) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    await this.reviewRepo.delete(id);

    return { message: `Review with ID ${id} has been deleted` };
  }

  async getLocationStats(locationId: number): Promise<{
    totalReviews: number;
    averageRating: number;
    ratingDistribution: { stars: number; count: number }[];
  }> {
    const [totalReviews, avgRaw, distribution] = await Promise.all([
      this.reviewRepo.count({ where: { locationId } }),
      this.reviewRepo
        .createQueryBuilder("review")
        .select("AVG(review.stars)", "avg")
        .where("review.locationId = :locationId", { locationId })
        .getRawOne<{ avg: string | null }>(),
      this.reviewRepo
        .createQueryBuilder("review")
        .select("review.stars", "stars")
        .addSelect("COUNT(*)", "count")
        .where("review.locationId = :locationId", { locationId })
        .groupBy("review.stars")
        .orderBy("review.stars", "ASC")
        .getRawMany<{ stars: number; count: string }>(),
    ]);

    const averageRating = avgRaw?.avg ? Number(avgRaw.avg) : 0;
    const ratingDistribution = distribution.map((item) => ({
      stars: Number(item.stars),
      count: Number(item.count),
    }));

    return {
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100,
      ratingDistribution,
    };
  }
}
