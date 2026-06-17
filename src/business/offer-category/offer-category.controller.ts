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
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OfferCategoryService } from './offer-category.service';
import { CreateOfferCategoryDto } from './dto/create-offer-category.dto';
import { UpdateOfferCategoryDto } from './dto/update-offer-category.dto';
import { QueryOfferCategoryDto } from './dto/query-offer-category.dto';
import { OfferCategoryResponseDto } from './dto/offer-category-response.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@ApiTags('Offer Categories')
@Controller('business/offer-categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OfferCategoryController {
  constructor(private readonly offerCategoryService: OfferCategoryService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new offer category' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Offer category created successfully',
    type: OfferCategoryResponseDto,
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({
    description: 'Category with this name already exists',
  })
  async create(
    @Body() createOfferCategoryDto: CreateOfferCategoryDto,
  ): Promise<OfferCategoryResponseDto> {
    return this.offerCategoryService.create(createOfferCategoryDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all offer categories with optional filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer categories retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OfferCategoryResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by category name (partial match)',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number (default: 1)',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
    description: 'Items per page (default: 10)',
  })
  async findAll(@Query(ValidationPipe) queryDto: QueryOfferCategoryDto) {
    return this.offerCategoryService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get offer category statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalCategories: { type: 'number' },
        categoriesWithActiveOffers: { type: 'number' },
        categoryDistribution: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              totalOffers: { type: 'number' },
              activeOffers: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getStats() {
    return this.offerCategoryService.getCategoryStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer category by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer category retrieved successfully',
    type: OfferCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Offer category not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OfferCategoryResponseDto> {
    return this.offerCategoryService.findOne(id);
  }

  @Get(':id/offers')
  @ApiOperation({ summary: 'Get an offer category with all its offers' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  @ApiQuery({
    name: 'includeInactive',
    required: false,
    type: Boolean,
    description: 'Include inactive offers (default: false)',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category with offers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        category: { $ref: '#/components/schemas/OfferCategoryResponseDto' },
        offers: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'number' },
              name: { type: 'string' },
              description: { type: 'string' },
              image: { type: 'string' },
              startDate: { type: 'string' },
              endDate: { type: 'string' },
              discount: { type: 'number' },
              location: {
                type: 'object',
                properties: {
                  id: { type: 'number' },
                  name: { type: 'string' },
                  type: { type: 'string' },
                  address: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Offer category not found' })
  async findWithOffers(
    @Param('id', ParseIntPipe) id: number,
    @Query('includeInactive') includeInactive = false,
  ) {
    return this.offerCategoryService.findWithOffers(
      id,
      includeInactive === true,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer category' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer category updated successfully',
    type: OfferCategoryResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Offer category not found' })
  @ApiConflictResponse({
    description: 'Category with this name already exists',
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferCategoryDto: UpdateOfferCategoryDto,
  ): Promise<OfferCategoryResponseDto> {
    return this.offerCategoryService.update(id, updateOfferCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer category' })
  @ApiParam({ name: 'id', type: 'number', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer category deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Offer category not found' })
  @ApiConflictResponse({
    description: 'Cannot delete category with associated offers',
  })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.offerCategoryService.remove(id);
  }
}
