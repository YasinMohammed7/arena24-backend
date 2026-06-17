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
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { OfferService } from './offer.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { QueryOfferDto } from './dto/query-offer.dto';
import { OfferResponseDto } from './dto/offer-response.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { AuthorizationGuard } from '@/auth/guards/authorization.guard';
import { HasRoleOr } from '@/auth/decorators/authorize.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@ApiTags('Offers')
@Controller('business/offers')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ['BUSINESS_OWNER', 'PLATFORM_MANAGER'],
    ['create:any', 'create:offer'],
  )
  @Post()
  @ApiOperation({ summary: 'Create a new offer' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Offer created successfully',
    type: OfferResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, category not found, location not found, or invalid date range',
  })
  @UseInterceptors(
    FileInterceptor('cover', {
      storage: diskStorage({
        destination: './public/uploads/offers/image',
        filename: (req, file, cb) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, uniqueSuffix + extname(file.originalname));
        },
      }),
    }),
  )
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<OfferResponseDto> {
    const offerData = {
      ...createOfferDto,
      image: file ? `/uploads/offers/image/${file.filename}` : createOfferDto.image,
    };
    return this.offerService.create(offerData);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all offers with optional filtering and pagination',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OfferResponseDto' },
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
        totalPages: { type: 'number' },
      },
    },
  })
  @ApiQuery({
    name: 'locationId',
    required: false,
    type: Number,
    description: 'Filter by location ID',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    type: Number,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'name',
    required: false,
    type: String,
    description: 'Filter by offer name (partial match)',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    type: String,
    description: 'Filter offers starting from this date',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    type: String,
    description: 'Filter offers ending before this date',
  })
  @ApiQuery({
    name: 'minDiscount',
    required: false,
    type: Number,
    description: 'Filter by minimum discount percentage',
  })
  @ApiQuery({
    name: 'activeOnly',
    required: false,
    type: Boolean,
    description: 'Show only active offers (default: true)',
  })
  @ApiQuery({
    name: 'globalOnly',
    required: false,
    type: Boolean,
    description: 'Show only global offers (default: false)',
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
  async findAll(@Query(ValidationPipe) queryDto: QueryOfferDto) {
    return this.offerService.findAll(queryDto);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get offer statistics' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer statistics retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        totalOffers: { type: 'number' },
        activeOffers: { type: 'number' },
        expiredOffers: { type: 'number' },
        upcomingOffers: { type: 'number' },
        offersByCategory: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              count: { type: 'number' },
            },
          },
        },
      },
    },
  })
  async getStats() {
    return this.offerService.getOfferStats();
  }

  @Get('location/:locationId')
  @ApiOperation({ summary: 'Get offers for a specific location' })
  @ApiParam({ name: 'locationId', type: 'number', description: 'Location ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Location offers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OfferResponseDto' },
        },
        total: { type: 'number' },
        activeOffers: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'minDiscount', required: false, type: Number })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByLocation(
    @Param('locationId', ParseIntPipe) locationId: number,
    @Query(ValidationPipe) queryDto: QueryOfferDto,
  ) {
    return this.offerService.findByLocation(locationId, queryDto);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: 'Get offers for a specific category' })
  @ApiParam({ name: 'categoryId', type: 'number', description: 'Category ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Category offers retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        data: {
          type: 'array',
          items: { $ref: '#/components/schemas/OfferResponseDto' },
        },
        total: { type: 'number' },
        activeOffers: { type: 'number' },
      },
    },
  })
  @ApiQuery({ name: 'locationId', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'startDate', required: false, type: String })
  @ApiQuery({ name: 'endDate', required: false, type: String })
  @ApiQuery({ name: 'minDiscount', required: false, type: Number })
  @ApiQuery({ name: 'activeOnly', required: false, type: Boolean })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findByCategory(
    @Param('categoryId', ParseIntPipe) categoryId: number,
    @Query(ValidationPipe) queryDto: QueryOfferDto,
  ) {
    return this.offerService.findByCategory(categoryId, queryDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an offer by ID' })
  @ApiParam({ name: 'id', type: 'number', description: 'Offer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer retrieved successfully',
    type: OfferResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  async findOne(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<OfferResponseDto> {
    return this.offerService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ['BUSINESS_OWNER', 'PLATFORM_MANAGER'],
    ['update:any', 'update:offer'],
  )
  @Patch(':id')
  @ApiOperation({ summary: 'Update an offer' })
  @ApiParam({ name: 'id', type: 'number', description: 'Offer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer updated successfully',
    type: OfferResponseDto,
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  @ApiBadRequestResponse({
    description:
      'Invalid input data, category not found, location not found, or invalid date range',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto,
  ): Promise<OfferResponseDto> {
    return this.offerService.update(id, updateOfferDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ['BUSINESS_OWNER', 'PLATFORM_MANAGER'],
    ['delete:any', 'delete:offer'],
  )
  @Delete(':id')
  @ApiOperation({ summary: 'Delete an offer' })
  @ApiParam({ name: 'id', type: 'number', description: 'Offer ID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Offer deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Offer not found' })
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.offerService.remove(id);
  }
}
