import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { OfferCategories } from "@/database/entities/offerCategories";
import { Offers } from "@/database/entities/offers";
import { CreateOfferCategoryDto } from "./dto/create-offer-category.dto";
import { UpdateOfferCategoryDto } from "./dto/update-offer-category.dto";
import { QueryOfferCategoryDto } from "./dto/query-offer-category.dto";

@Injectable()
export class OfferCategoryService {
  constructor(
    @InjectRepository(OfferCategories)
    private readonly offerCategoryRepo: Repository<OfferCategories>,

    @InjectRepository(Offers)
    private readonly offersRepo: Repository<Offers>
  ) {}

  async create(createOfferCategoryDto: CreateOfferCategoryDto) {
    const { name } = createOfferCategoryDto;

    const existingCategory = await this.offerCategoryRepo.findOneBy({ name });
    if (existingCategory) {
      throw new ConflictException(
        `Offer category with name '${name}' already exists`
      );
    }

    const category: OfferCategories = await this.offerCategoryRepo.save(
      this.offerCategoryRepo.create({ name })
    );
    category.offerCount = 0; // brand-new category has no active offers
    return category;
  }

  async findAll(queryDto: QueryOfferCategoryDto = {}) {
    const { name, page = 1, limit = 10 } = queryDto;

    const queryBuilder = this.offerCategoryRepo
      .createQueryBuilder("category")
      .orderBy("category.name", "ASC")
      .skip((page - 1) * limit)
      .take(limit);

    if (name) {
      queryBuilder.where("category.name LIKE :name", { name: `%${name}%` });
    }

    const [data, total] = await queryBuilder.getManyAndCount();

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: number) {
    const category = await this.offerCategoryRepo
      .createQueryBuilder("category")
      .where("category.id = :id", { id })
      .getOne();

    if (!category) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    return category;
  }

  async findWithOffers(id: number, includeInactive = false) {
    const category = await this.findOne(id); // existence check + offerCount

    const offersQb = this.offersRepo
      .createQueryBuilder("offer")
      .leftJoin("offer.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.address",
      ])
      .where("offer.categoryId = :id", { id })
      .orderBy("offer.endDate", "ASC");

    if (!includeInactive) {
      offersQb
        .andWhere("offer.startDate <= NOW()")
        .andWhere("offer.endDate >= NOW()");
    }

    const offers = await offersQb.getMany();

    return { category, offers };
  }

  async update(id: number, updateOfferCategoryDto: UpdateOfferCategoryDto) {
    const { name } = updateOfferCategoryDto;

    const existingCategory = await this.offerCategoryRepo.findOneBy({ id });
    if (!existingCategory) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    if (name && name !== existingCategory.name) {
      const nameConflict = await this.offerCategoryRepo.findOneBy({ name });
      if (nameConflict) {
        throw new ConflictException(
          `Offer category with name '${name}' already exists`
        );
      }
    }

    await this.offerCategoryRepo.update(id, updateOfferCategoryDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    const existingCategory = await this.offerCategoryRepo.findOneBy({ id });
    if (!existingCategory) {
      throw new NotFoundException(`Offer category with ID ${id} not found`);
    }

    const offerCount = await this.offersRepo.count({
      where: { categoryId: id },
    });

    if (offerCount > 0) {
      throw new ConflictException(
        `Cannot delete category '${existingCategory.name}' because it has ${offerCount} associated offer(s). Please delete or reassign the offers first.`
      );
    }

    await this.offerCategoryRepo.delete(id);

    return {
      message: `Offer category '${existingCategory.name}' has been deleted successfully`,
    };
  }

  async getCategoryStats() {
    // Active count comes from the @VirtualColumn (offerCount); total offers per
    // category via a single grouped count. Aggregates are derived in memory.
    const categories = await this.offerCategoryRepo
      .createQueryBuilder("category")
      .orderBy("category.name", "ASC")
      .getMany();

    const totals = await this.offersRepo
      .createQueryBuilder("offer")
      .select("offer.categoryId", "categoryId")
      .addSelect("COUNT(*)", "total")
      .groupBy("offer.categoryId")
      .getRawMany<{ categoryId: number; total: string }>();

    const totalByCategory = new Map(
      totals.map((t) => [t.categoryId, Number(t.total)])
    );

    const categoryDistribution = categories.map((category) => ({
      category: category.name,
      totalOffers: totalByCategory.get(category.id) ?? 0,
      activeOffers: category.offerCount,
    }));

    return {
      totalCategories: categories.length,
      categoriesWithActiveOffers: categories.filter((c) => c.offerCount > 0)
        .length,
      categoryDistribution,
    };
  }
}
