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
  UseGuards,
  HttpStatus,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
} from "@nestjs/swagger";

import { BusinessService } from "./business.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";

import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";

@ApiTags("Business")
@ApiBearerAuth("access-token")
@Controller()
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:business"]
  )
  @Post()
  @ApiOperation({ summary: "Create a new business" })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: "Business created successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
  })
  @ApiConflictResponse({
    description: "A business with this name already exists for this owner",
  })
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.create(createBusinessDto, userId);
  }

  @Get()
  @ApiOperation({ summary: "Get current user's businesses with pagination" })
  @ApiQuery({
    name: "page",
    required: false,
    type: Number,
    example: 1,
  })
  @ApiQuery({
    name: "limit",
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Businesses retrieved successfully",
    schema: {
      type: "object",
      properties: {
        data: {
          type: "array",
          items: { type: "object" },
        },
        total: { type: "number", example: 25 },
        page: { type: "number", example: 1 },
        limit: { type: "number", example: 10 },
        totalPages: { type: "number", example: 3 },
      },
    },
  })
  async findAll(
    @CurrentUser("id") userId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit = 10
  ) {
    return this.businessService.findAll(userId, page, limit);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:business"])
  @Get("my-businesses")
  @ApiOperation({
    summary: "Get businesses where the current user is owner or staff",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User businesses retrieved successfully",
  })
  async getMyBusinesses(@CurrentUser("id") userId: string) {
    return this.businessService.getBusinessesByUser(userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "Get business by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Business ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business retrieved successfully",
  })
  @ApiNotFoundResponse({
    description: "Business not found",
  })
  async findOne(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.findOne(id, userId);
  }

  @Get(":id/stats")
  @ApiOperation({ summary: "Get business statistics" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Business ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business statistics retrieved successfully",
    schema: {
      type: "object",
      properties: {
        totalLocations: { type: "number", example: 10 },
        activeLocations: { type: "number", example: 8 },
        totalStaff: { type: "number", example: 24 },
        businessAge: {
          type: "number",
          description: "Business age in days",
          example: 120,
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Business not found",
  })
  async getBusinessStats(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.getBusinessStats(id, userId);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["update:business"])
  @Patch(":id")
  @ApiOperation({ summary: "Update business by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Business ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business updated successfully",
  })
  @ApiBadRequestResponse({
    description: "Invalid input data",
  })
  @ApiNotFoundResponse({
    description: "Business not found",
  })
  @ApiConflictResponse({
    description: "A business with this name already exists for this owner",
  })
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.update(id, updateBusinessDto, userId);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["delete:business"])
  @Delete(":id")
  @ApiOperation({ summary: "Delete business by ID" })
  @ApiParam({
    name: "id",
    type: Number,
    description: "Business ID",
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "Business deleted successfully",
    schema: {
      type: "object",
      properties: {
        message: {
          type: "string",
          example: "Business deleted successfully",
        },
      },
    },
  })
  @ApiNotFoundResponse({
    description: "Business not found",
  })
  async remove(
    @Param("id", ParseIntPipe) id: number,
    @CurrentUser("id") userId: string
  ) {
    await this.businessService.remove(id, userId);

    return {
      message: "Business deleted successfully",
    };
  }
}
