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
} from "@nestjs/common";
import { BusinessService } from "./business.service";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { AuthorizationGuard } from "@/auth/guards/authorization.guard";
import { HasRoleOr } from "@/auth/decorators/authorize.decorator";
import { CurrentUser } from "@/auth/decorators/current-user.decorator";

@Controller("business")
@UseGuards(JwtAuthGuard)
export class BusinessController {
  constructor(private readonly businessService: BusinessService) {}

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(
    ["BUSINESS_OWNER", "PLATFORM_MANAGER"],
    ["create:any", "create:business"]
  )
  @Post()
  async create(
    @Body() createBusinessDto: CreateBusinessDto,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.create(createBusinessDto, userId);
  }

  @Get()
  async findAll(
    @CurrentUser("id") userId: string,
    @Query("page", new ParseIntPipe({ optional: true })) page: number = 1,
    @Query("limit", new ParseIntPipe({ optional: true })) limit: number = 10
  ) {
    return this.businessService.findAll(userId, page, limit);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["read:business"])
  @Get("my-businesses")
  async getMyBusinesses(@CurrentUser("id") userId: string) {
    return this.businessService.getBusinessesByUser(userId);
  }

  @Get("business/:id")
  async findOne(@Param("id") id: number, @CurrentUser("id") userId: string) {
    return this.businessService.findOne(id, userId);
  }

  @Get("business/:id/stats")
  async getBusinessStats(
    @Param("id") id: number,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.getBusinessStats(id, userId);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["update:business"])
  @Patch("business/:id")
  async update(
    @Param("id") id: number,
    @Body() updateBusinessDto: UpdateBusinessDto,
    @CurrentUser("id") userId: string
  ) {
    return this.businessService.update(id, updateBusinessDto, userId);
  }

  @UseGuards(AuthorizationGuard)
  @HasRoleOr(["BUSINESS_OWNER", "PLATFORM_MANAGER"], ["delete:business"])
  @Delete("business/:id")
  async remove(@Param("id") id: number, @CurrentUser("id") userId: string) {
    await this.businessService.remove(id, userId);
    return { message: "Business deleted successfully" };
  }
}
