import { Injectable, NotFoundException } from "@nestjs/common";
import { QueryOfferDto } from "./dto/query-offer.dto";
import { QueryOfferCategoryDto } from "@/business/offer-category/dto/query-offer-category.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Locations } from "@/database/entities/locations";
import { Brackets, IsNull, MoreThanOrEqual, Repository } from "typeorm";
import { Offers } from "@/database/entities/offers";
import { Media } from "@/database/entities/media";
import { OfferCategories } from "@/database/entities/offerCategories";
import { Event } from "@/database/entities/event";
import { PaginatedResult, paginate } from "@/common/dto/paginated-result";

@Injectable()
export class ClientService {
  constructor(
    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>,

    @InjectRepository(Event)
    private readonly eventRepo: Repository<Event>,

    @InjectRepository(Offers)
    private readonly offerRepo: Repository<Offers>,

    @InjectRepository(Media)
    private readonly mediaRepo: Repository<Media>,

    @InjectRepository(OfferCategories)
    private readonly offerCategoryRepo: Repository<OfferCategories>
  ) {}

  async findAllActiveLocations() {
    const now = new Date();

    return this.locationRepo
      .createQueryBuilder("location")
      .leftJoin("location.business", "business")
      .addSelect(["business.id", "business.name", "business.description"])
      .leftJoinAndSelect("location.schedules", "schedule")
      .leftJoinAndSelect(
        "location.locationFacilities",
        "locationFacility",
        "locationFacility.isActive = :isActive",
        { isActive: true }
      )
      .leftJoin("locationFacility.facility", "facility")
      .addSelect(["facility.id", "facility.name", "facility.isActive"])
      .leftJoinAndSelect(
        "location.locationAmenities",
        "locationAmenity",
        "locationAmenity.isActive = :isActive",
        { isActive: true }
      )
      .leftJoin("locationAmenity.amenity", "amenity")
      .addSelect([
        "amenity.id",
        "amenity.name",
        "amenity.description",
        "amenity.iconUrl",
        "amenity.isActive",
      ])
      .leftJoinAndSelect("location.events", "event", "event.date >= :now", {
        now,
      })
      .leftJoinAndSelect(
        "location.offers",
        "offer",
        "offer.startDate <= :now AND offer.endDate >= :now",
        { now }
      )
      .leftJoinAndSelect("location.reviews", "review")
      .leftJoin("review.user", "reviewUser")
      .addSelect(["reviewUser.id", "reviewUser.name"])
      .where("location.isActive = :isActive", { isActive: true })
      .andWhere("location.deletedAt IS NULL")
      .orderBy("location.createdAt", "DESC")
      .addOrderBy("review.createdAt", "DESC")
      .getMany();
  }

  async findActiveLocationById(id: number) {
    const now = new Date();

    const location = await this.locationRepo
      .createQueryBuilder("location")
      .leftJoin("location.business", "business")
      .addSelect(["business.id", "business.name", "business.description"])
      .leftJoinAndSelect("location.schedules", "schedule")
      .leftJoinAndSelect(
        "location.locationFacilities",
        "locationFacility",
        "locationFacility.isActive = :isActive",
        { isActive: true }
      )
      .leftJoin("locationFacility.facility", "facility")
      .addSelect(["facility.id", "facility.name", "facility.isActive"])
      .leftJoinAndSelect(
        "location.locationAmenities",
        "locationAmenity",
        "locationAmenity.isActive = :isActive",
        { isActive: true }
      )
      .leftJoin("locationAmenity.amenity", "amenity")
      .addSelect([
        "amenity.id",
        "amenity.name",
        "amenity.description",
        "amenity.iconUrl",
        "amenity.isActive",
      ])
      .leftJoinAndSelect("location.events", "event", "event.date >= :now", {
        now,
      })
      .leftJoinAndSelect(
        "location.offers",
        "offer",
        "offer.startDate <= :now AND offer.endDate >= :now",
        { now }
      )
      .leftJoinAndSelect("location.reviews", "review")
      .leftJoin("review.user", "reviewUser")
      .addSelect(["reviewUser.id", "reviewUser.name"])
      .where("location.id = :id", { id })
      .andWhere("location.isActive = :isActive", { isActive: true })
      .andWhere("location.deletedAt IS NULL")
      .orderBy("event.date", "ASC")
      .addOrderBy("review.createdAt", "DESC")
      .getOne();

    if (!location) {
      throw new NotFoundException("Location not found or not active");
    }

    const media = await this.mediaRepo.find({
      where: {
        modelType: "Location",
        modelId: id.toString(),
      },
      order: {
        createdAt: "ASC",
      },
    });

    return {
      ...location,
      media,
    };
  }

  async findAllActiveEvents() {
    const now = new Date();

    return this.eventRepo.find({
      where: {
        date: MoreThanOrEqual(now),
        location: {
          isActive: true,
          deletedAt: IsNull(),
        },
      },
      relations: {
        location: {
          business: true,
        },
        eventFacilities: {
          facility: true,
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        startHour: true,
        endHour: true,
        price: true,
        imageUrl: true,
        location: {
          id: true,
          name: true,
          address: true,
          business: {
            id: true,
            name: true,
            description: true,
          },
        },
        eventFacilities: {
          eventId: true,
          facilityId: true,
          isActive: true,
          facility: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
      order: {
        date: "ASC",
      },
    });
  }

  async findActiveEventById(id: number) {
    const now = new Date();

    const event = await this.eventRepo.findOne({
      where: {
        id,
        date: MoreThanOrEqual(now),
        location: {
          isActive: true,
          deletedAt: IsNull(),
        },
      },
      relations: {
        location: {
          business: true,
        },
        eventFacilities: {
          facility: true,
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        date: true,
        startHour: true,
        endHour: true,
        price: true,
        imageUrl: true,
        location: {
          id: true,
          name: true,
          address: true,
          business: {
            id: true,
            name: true,
            description: true,
          },
        },
        eventFacilities: {
          eventId: true,
          facilityId: true,
          isActive: true,
          facility: {
            id: true,
            name: true,
            isActive: true,
          },
        },
        eventIncludedOptions: true,
        eventRequirements: true,
      },
    });

    if (!event) {
      throw new NotFoundException("Event not found or not available");
    }

    return event;
  }

  /**
   * Find all offers with filtering support
   * Example queries supported:
   * ?activeOnly=true - Show only currently active offers
   * ?globalOnly=true - Show only global offers (no location)
   * ?locationId=1&categoryId=2 - Specific location and category
   * ?minDiscount=20 - Only offers with 20%+ discount
   * ?name=pizza - Search offers containing "pizza"
   * ?startDate=2025-08-01&endDate=2025-12-31 - Date range filtering
   */
  async findAllOffers(
    queryDto: QueryOfferDto = {}
  ): Promise<PaginatedResult<Offers>> {
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

    const skip = (page - 1) * limit;
    const now = new Date();

    const query = this.offerRepo
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

    if (globalOnly) {
      query.andWhere("offer.locationId IS NULL");
    } else if (locationId) {
      query.andWhere("offer.locationId = :locationId", { locationId });
    }

    if (categoryId) {
      query.andWhere("offer.categoryId = :categoryId", { categoryId });
    }

    if (name) {
      query.andWhere("offer.name LIKE :name", { name: `%${name}%` });
    }

    if (startDate) {
      query.andWhere("offer.startDate >= :startDate", {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      query.andWhere("offer.endDate <= :endDate", {
        endDate: new Date(endDate),
      });
    }

    if (activeOnly) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where("offer.startDate <= :now", { now }).andWhere(
            "offer.endDate >= :now",
            { now }
          );
        })
      );
    }

    if (minDiscount !== undefined) {
      query.andWhere("offer.discount >= :minDiscount", { minDiscount });
    }

    const [offers, total] = await query
      .orderBy("offer.endDate", "ASC")
      .addOrderBy("offer.createdAt", "DESC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return paginate(offers, total, page, limit);
  }

  /**
   * Find a single offer by ID
   */
  async findOneOffer(id: number): Promise<Offers> {
    const offer = await this.offerRepo.findOne({
      where: { id },
      relations: {
        location: true,
        category: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        discount: true,
        image: true,
        startDate: true,
        endDate: true,
        createdAt: true,
        updatedAt: true,
        location: {
          id: true,
          name: true,
          type: true,
          address: true,
        },
        category: {
          id: true,
          name: true,
        },
      },
    });

    if (!offer) {
      throw new NotFoundException(`Offer with ID ${id} not found`);
    }

    return offer;
  }

  async findAllOfferCategories(
    queryDto: QueryOfferCategoryDto = {}
  ): Promise<PaginatedResult<OfferCategories>> {
    const { name, page = 1, limit = 10 } = queryDto;
    const skip = (page - 1) * limit;

    const query = this.offerCategoryRepo.createQueryBuilder("category");

    if (name) {
      query.andWhere("category.name LIKE :name", { name: `%${name}%` });
    }

    const [categories, total] = await query
      .orderBy("category.name", "ASC")
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return paginate(categories, total, page, limit);
  }

  async findOne(id: number): Promise<OfferCategories> {
    const category = await this.offerCategoryRepo.findOne({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    return category;
  }
}
