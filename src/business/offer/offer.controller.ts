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
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from "@nestjs/swagger";
import { OfferService } from "./offer.service";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { QueryOfferDto } from "./dto/query-offer.dto";
import { OfferResponseDto } from "./dto/offer-response.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";
import { FileInterceptor } from "@nestjs/platform-express";
import { MAX_COVER_SIZE } from "./multer.config";
import { ApiPaginatedResponse } from "@/common/decorators/api-paginated-response.decorator";

// Optional cover image, size-capped. Used by create.
const coverFilePipe = new ParseFilePipe({
  fileIsRequired: false,
  validators: [
    new MaxFileSizeValidator({ maxSize: MAX_COVER_SIZE }),
    new FileTypeValidator({ fileType: /^image\/(jpeg|png|webp|svg\+xml)$/ }),
  ],
});

@ApiTags("Offers")
@Controller("business/offers")
@UseGuards(JwtAuthGuard)
@ApiBearerAuth("access-token")
export class OfferController {
  constructor(private readonly offerService: OfferService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:offer"]
  )
  @Post()
  @ApiOperation({ summary: "Create a new offer" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      required: ["name", "startDate", "endDate", "categoryId"],
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        startDate: { type: "string", format: "date-time" },
        endDate: { type: "string", format: "date-time" },
        discount: { type: "number" },
        locationId: { type: "number" },
        categoryId: { type: "number" },
        cover: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Offer created successfully",
    type: OfferResponseDto,
  })
  @ApiBadRequestResponse({
    description:
      "Invalid input data, category not found, location not found, or invalid date range",
  })
  @UseInterceptors(FileInterceptor("cover"))
  async create(
    @Body() createOfferDto: CreateOfferDto,
    @UploadedFile(coverFilePipe) file?: Express.Multer.File
  ): Promise<OfferResponseDto> {
    const offerData = {
      ...createOfferDto,
      image: file
        ? `/uploads/offers/image/${file.filename}`
        : createOfferDto.image,
    };
    return this.offerService.create(offerData);
  }

  @Get()
  @ApiOperation({
    summary: "Get all offers with optional filtering and pagination",
  })
  @ApiPaginatedResponse(OfferResponseDto)
  async findAll(@Query() queryDto: QueryOfferDto) {
    return this.offerService.findAll(queryDto);
  }

  @Get("stats")
  @ApiOperation({ summary: "Get offer statistics" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Offer statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalOffers: { type: "number" },
        activeOffers: { type: "number" },
        expiredOffers: { type: "number" },
        upcomingOffers: { type: "number" },
        offersByCategory: {
          type: "array",
          items: {
            type: "object",
            properties: {
              category: { type: "string" },
              count: { type: "number" },
            },
          },
        },
      },
    },
  })
  async getStats() {
    return this.offerService.getOfferStats();
  }

  @Get("location/:locationId")
  @ApiOperation({ summary: "Get offers for a specific location" })
  @ApiParam({ name: "locationId", type: "number", description: "Location ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Location offers retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/OfferResponseDto" },
        },
        total: { type: "number" },
        activeOffers: { type: "number" },
      },
    },
  })
  async findByLocation(
    @Param("locationId", ParseIntPipe) locationId: number,
    @Query() queryDto: QueryOfferDto
  ) {
    return this.offerService.findByLocation(locationId, queryDto);
  }

  @Get("category/:categoryId")
  @ApiOperation({ summary: "Get offers for a specific category" })
  @ApiParam({ name: "categoryId", type: "number", description: "Category ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Category offers retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { $ref: "#/components/schemas/OfferResponseDto" },
        },
        total: { type: "number" },
        activeOffers: { type: "number" },
      },
    },
  })
  async findByCategory(
    @Param("categoryId", ParseIntPipe) categoryId: number,
    @Query() queryDto: QueryOfferDto
  ) {
    return this.offerService.findByCategory(categoryId, queryDto);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get an offer by ID" })
  @ApiParam({ name: "id", type: "number", description: "Offer ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Offer retrieved successfully",
    type: OfferResponseDto,
  })
  @ApiNotFoundResponse({ description: "Offer not found" })
  async findOne(
    @Param("id", ParseIntPipe) id: number
  ): Promise<OfferResponseDto> {
    return this.offerService.findOne(id);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["update:any", "update:offer"]
  )
  @Patch(":id")
  @ApiOperation({ summary: "Update an offer" })
  @ApiParam({ name: "id", type: "number", description: "Offer ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Offer updated successfully",
    type: OfferResponseDto,
  })
  @ApiNotFoundResponse({ description: "Offer not found" })
  @ApiBadRequestResponse({
    description:
      "Invalid input data, category not found, location not found, or invalid date range",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateOfferDto: UpdateOfferDto
  ): Promise<OfferResponseDto> {
    return this.offerService.update(id, updateOfferDto);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["delete:any", "delete:offer"]
  )
  @Delete(":id")
  @ApiOperation({ summary: "Delete an offer" })
  @ApiParam({ name: "id", type: "number", description: "Offer ID" })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Offer deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: { type: "string" },
      },
    },
  })
  @ApiNotFoundResponse({ description: "Offer not found" })
  async remove(@Param("id", ParseIntPipe) id: number) {
    return this.offerService.remove(id);
  }
}
