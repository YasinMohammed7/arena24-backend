import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Offers } from "@/database/entities/offers";
import { OfferCategories } from "@/database/entities/offerCategories";
import { Locations } from "@/database/entities/locations";
import { CreateOfferDto } from "./dto/create-offer.dto";
import { UpdateOfferDto } from "./dto/update-offer.dto";
import { QueryOfferDto } from "./dto/query-offer.dto";
import { OfferResponseDto } from "./dto/offer-response.dto";
import { PaginatedResult, paginate } from "@/common/dto/paginated-result";

@Injectable()
export class OfferService {
  constructor(
    @InjectRepository(Offers)
    private readonly offerRepo: Repository<Offers>,
    @InjectRepository(OfferCategories)
    private readonly offerCategoryRepo: Repository<OfferCategories>,
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>
  ) {}

  // Loads an offer with its location + category subsets (isActive comes from
  // the @VirtualColumn on the entity).
  private offerWithRelationsQuery() {
    return this.offerRepo
      .createQueryBuilder("offer")
      .leftJoin("offer.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.address",
      ])
      .leftJoin("offer.category", "category")
      .addSelect(["category.id", "category.name"]);
  }

  async create(createOfferDto: CreateOfferDto): Promise<OfferResponseDto> {
    const { locationId, categoryId, startDate, endDate, ...offerData } =
      createOfferDto;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (start >= end) {
      throw new BadRequestException("Start date must be before end date");
    }

    // Check if category exists
    const category = await this.offerCategoryRepo.findOneBy({ id: categoryId });
    if (!category) {
      throw new BadRequestException("Offer category not found");
    }

    // Check if location exists (if provided)
    if (locationId) {
      const location = await this.locationRepo.findOneBy({ id: locationId });
      if (!location) {
        throw new BadRequestException("Location not found");
      }
    }

    const newOffer = this.offerRepo.create({
      ...offerData,
      startDate: start,
      endDate: end,
      locationId: locationId ?? null,
      categoryId,
    });
    const saved: Offers = await this.offerRepo.save(newOffer);

    const offer = await this.offerWithRelationsQuery()
      .where("offer.id = :id", { id: saved.id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${saved.id} not found`);
    }

    return offer;
  }

  async findAll(
    queryDto: QueryOfferDto = {}
  ): Promise<PaginatedResult<OfferResponseDto>> {
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

    const queryBuilder = this.offerWithRelationsQuery()
      .orderBy("offer.endDate", "ASC") // Show expiring offers first
      .addOrderBy("offer.createdAt", "DESC")
      .skip((page - 1) * limit)
      .take(limit);

    // Filter by location
    if (globalOnly) {
      queryBuilder.andWhere("offer.locationId IS NULL");
    } else if (locationId) {
      queryBuilder.andWhere("offer.locationId = :locationId", { locationId });
    }

    // Filter by category
    if (categoryId) {
      queryBuilder.andWhere("offer.categoryId = :categoryId", { categoryId });
    }

    // Filter by name (partial match)
    if (name) {
      queryBuilder.andWhere("offer.name LIKE :name", { name: `%${name}%` });
    }

    // Filter by date range
    if (startDate) {
      queryBuilder.andWhere("offer.startDate >= :startDate", {
        startDate: new Date(startDate),
      });
    }
    if (endDate) {
      queryBuilder.andWhere("offer.endDate <= :endDate", {
        endDate: new Date(endDate),
      });
    }

    // Show only active offers
    if (activeOnly) {
      queryBuilder
        .andWhere("offer.startDate <= NOW()")
        .andWhere("offer.endDate >= NOW()");
    }

    // Filter by minimum discount
    if (minDiscount !== undefined) {
      queryBuilder.andWhere("offer.discount >= :minDiscount", { minDiscount });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return paginate(data, total, page, limit);
  }

  async findOne(id: number): Promise<OfferResponseDto> {
    const offer = await this.offerWithRelationsQuery()
      .where("offer.id = :id", { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async findByLocation(
    locationId: number,
    queryDto: QueryOfferDto = {}
  ): Promise<{
    data: OfferResponseDto[];
    total: number;
    activeOffers: number;
  }> {
    const modifiedQuery = { ...queryDto, locationId };
    const result = await this.findAll(modifiedQuery);

    // Count active offers for this location
    const activeOffers = await this.offerRepo
      .createQueryBuilder("offer")
      .where("offer.locationId = :locationId", { locationId })
      .andWhere("offer.startDate <= NOW()")
      .andWhere("offer.endDate >= NOW()")
      .getCount();

    return {
      data: result.data,
      total: result.total,
      activeOffers,
    };
  }

  async findByCategory(
    categoryId: number,
    queryDto: QueryOfferDto = {}
  ): Promise<{
    data: OfferResponseDto[];
    total: number;
    activeOffers: number;
  }> {
    const modifiedQuery = { ...queryDto, categoryId };
    const result = await this.findAll(modifiedQuery);

    // Count active offers for this category
    const activeOffers = await this.offerRepo
      .createQueryBuilder("offer")
      .where("offer.categoryId = :categoryId", { categoryId })
      .andWhere("offer.startDate <= NOW()")
      .andWhere("offer.endDate >= NOW()")
      .getCount();

    return {
      data: result.data,
      total: result.total,
      activeOffers,
    };
  }

  async update(
    id: number,
    updateOfferDto: UpdateOfferDto
  ): Promise<OfferResponseDto> {
    // Check if offer exists
    const existingOffer = await this.offerRepo.findOneBy({ id });

    if (!existingOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    const { locationId, categoryId, startDate, endDate, ...offerData } =
      updateOfferDto;

    // Validate dates if provided
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : existingOffer.startDate;
      const end = endDate ? new Date(endDate) : existingOffer.endDate;

      if (start >= end) {
        throw new BadRequestException("Start date must be before end date");
      }
    }

    // Check if category exists (if provided)
    if (categoryId) {
      const category = await this.offerCategoryRepo.findOneBy({
        id: categoryId,
      });
      if (!category) {
        throw new BadRequestException("Offer category not found");
      }
    }

    // Check if location exists (if provided)
    if (locationId) {
      const location = await this.locationRepo.findOneBy({ id: locationId });
      if (!location) {
        throw new BadRequestException("Location not found");
      }
    }

    // Apply changes — set FK columns directly (relation connect/disconnect)
    Object.assign(existingOffer, offerData);
    if (startDate) existingOffer.startDate = new Date(startDate);
    if (endDate) existingOffer.endDate = new Date(endDate);
    if (locationId !== undefined) existingOffer.locationId = locationId;
    if (categoryId) existingOffer.categoryId = categoryId;

    await this.offerRepo.save(existingOffer);

    const offer = await this.offerWithRelationsQuery()
      .where("offer.id = :id", { id })
      .getOne();

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async remove(id: number): Promise<{ message: string }> {
    // Check if offer exists
    const existingOffer = await this.offerRepo.findOneBy({ id });

    if (!existingOffer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    await this.offerRepo.delete(id);

    return { message: `Offer with ID ${id} has been deleted` };
  }

  async getOfferStats(): Promise<{
    totalOffers: number;
    activeOffers: number;
    expiredOffers: number;
    upcomingOffers: number;
    offersByCategory: { category: string; count: number }[];
  }> {
    const [totalOffers, activeOffers, expiredOffers, upcomingOffers, rows] =
      await Promise.all([
        this.offerRepo.count(),
        this.offerRepo
          .createQueryBuilder("offer")
          .where("offer.startDate <= NOW()")
          .andWhere("offer.endDate >= NOW()")
          .getCount(),
        this.offerRepo
          .createQueryBuilder("offer")
          .where("offer.endDate < NOW()")
          .getCount(),
        this.offerRepo
          .createQueryBuilder("offer")
          .where("offer.startDate > NOW()")
          .getCount(),
        this.offerRepo
          .createQueryBuilder("offer")
          .leftJoin("offer.category", "category")
          .select("category.name", "category")
          .addSelect("COUNT(*)", "count")
          .groupBy("offer.categoryId")
          .addGroupBy("category.name")
          .orderBy("count", "DESC")
          .getRawMany<{ category: string | null; count: string }>(),
      ]);

    const offersByCategory = rows.map((row) => ({
      category: row.category ?? "Unknown",
      count: Number(row.count),
    }));

    return {
      totalOffers,
      activeOffers,
      expiredOffers,
      upcomingOffers,
      offersByCategory,
    };
  }
}
