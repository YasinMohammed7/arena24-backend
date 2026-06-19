import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  HttpStatus,
  ValidationPipe,
  UseGuards,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { QueryReviewDto } from "./dto/query-review.dto";
import { ReviewResponseDto } from "./dto/review-response.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";

@ApiTags("Reviews")
@Controller("business/reviews")
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  @ApiOperation({ summary: "Create a new review" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Review created successfully",
    type: ReviewResponseDto,
  })
  @ApiBadRequestResponse({
    description: "Invalid input data or user/location not found",
  })
  @ApiConflictResponse({
    description: "User has already reviewed this location",
  })
  async create(
    @CurrentUser("id") userId: string,
    @Body() createReviewDto: CreateReviewDto
  ): Promise<ReviewResponseDto> {
    return this.reviewService.create(createReviewDto, userId);
  }

  @Get()
  @ApiOperation({
    summary: "Get all reviews with optional filtering and pagination",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Reviews retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/ReviewResponseDto" },
        },
        total: { type: "number" },
        page: { type: "number" },
        limit: { type: "number" },
        totalPages: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "locationId", required: false, type: Number })
  @ApiQuery({ name: "userId", required: false, type: String })
  @ApiQuery({ name: "minStars", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findAll(@Query(ValidationPipe) queryDto: QueryReviewDto) {
    return this.reviewService.findAll(queryDto);
  }

  @Get("location/:locationId")
  @ApiOperation({
    summary: "Get reviews for a specific location with statistics",
  })
  @ApiParam({ name: "locationId", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location reviews retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/ReviewResponseDto" },
        },
        total: { type: "number" },
        averageRating: { type: "number" },
      },
    },
  })
  @ApiQuery({ name: "minStars", required: false, type: Number })
  @ApiQuery({ name: "page", required: false, type: Number })
  @ApiQuery({ name: "limit", required: false, type: Number })
  async findByLocation(
    @Param("locationId", ParseIntPipe) locationId: number,
    @Query(ValidationPipe) queryDto: QueryReviewDto
  ) {
    return this.reviewService.findByLocation(locationId, queryDto);
  }

  @Get("location/:locationId/stats")
  @ApiOperation({ summary: "Get review statistics for a location" })
  @ApiParam({ name: "locationId", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location review statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalReviews: { type: "number" },
        averageRating: { type: "number" },
        ratingDistribution: {
          type: "array",
          items: {
            type: "object",
            properties: {
              stars: { type: "number" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  })
  async getLocationStats(
    @Param("locationId", ParseIntPipe) locationId: number
  ) {
    return this.reviewService.getLocationStats(locationId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get a review by ID" })
  @ApiParam({ name: "id", type: "number", description: "Review ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Review retrieved successfully",
    type: ReviewResponseDto,
  })
  @ApiNotFoundResponse({ description: "Review not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<ReviewResponseDto> {
    return this.reviewService.findOne(id);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Update a review" })
  @ApiParam({ name: "id", type: "number", description: "Review ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Review updated successfully",
    type: ReviewResponseDto,
  })
  @ApiNotFoundResponse({ description: "Review not found" })
  @ApiBadRequestResponse({ description: "Invalid input data" })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto
  ): Promise<ReviewResponseDto> {
    return this.reviewService.update(id, updateReviewDto);
  }

  @Delete(":id")
  @ApiOperation({ summary: "Delete a review" })
  @ApiParam({ name: "id", type: "number", description: "Review ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Review deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiNotFoundResponse({ description: "Review not found" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.reviewService.remove(id);
  }
}
