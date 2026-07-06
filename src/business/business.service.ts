import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateBusinessDto } from "./dto/create-business.dto";
import { UpdateBusinessDto } from "./dto/update-business.dto";
import { Businesses } from "@/database/entities/businesses";
import { IsNull, QueryFailedError, Repository } from "typeorm";
import { Locations } from "@/database/entities/locations";
import { UserBusinessRoles } from "@/database/entities/userBusinessRoles";
import { InjectRepository } from "@nestjs/typeorm";
import { PaginatedResult, paginate } from "@/common/dto/paginated-result";

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Businesses)
    private readonly businessRepo: Repository<Businesses>,

    @InjectRepository(Locations)
    private readonly locationRepo: Repository<Locations>,

    @InjectRepository(UserBusinessRoles)
    private readonly userBusinessRolesRepo: Repository<UserBusinessRoles>
  ) {}

  async create(
    createBusinessDto: CreateBusinessDto,
    ownerId: string
  ): Promise<Businesses> {
    try {
      const business = this.businessRepo.create({
        ...createBusinessDto,
        ownerId,
      });

      const savedBusiness = await this.businessRepo.save(business);

      const createdBusiness = await this.businessRepo.findOne({
        where: { id: savedBusiness.id },
        relations: {
          owner: true,
          locations: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          owner: {
            id: true,
            name: true,
            email: true,
          },
          locations: {
            id: true,
            name: true,
            type: true,
            isActive: true,
          },
        },
      });

      if (!createdBusiness) {
        throw new Error("Business was created but could not be loaded");
      }

      return createdBusiness;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new ConflictException(
            "A business with this name already exists for this owner"
          );
        }
      }

      throw error;
    }
  }

  async findAll(
    ownerId: string,
    page = 1,
    limit = 10
  ): Promise<PaginatedResult<Businesses>> {
    const skip = (page - 1) * limit;

    const [businesses, total] = await this.businessRepo.findAndCount({
      where: {
        ownerId,
      },
      skip,
      take: limit,
      relations: {
        owner: true,
        locations: true,
      },
      select: {
        id: true,
        name: true,
        description: true,
        ownerId: true,
        createdAt: true,
        updatedAt: true,
        locationsCount: true,
        userBusinessRolesCount: true,
        owner: {
          id: true,
          name: true,
          email: true,
        },
        locations: {
          id: true,
          name: true,
          type: true,
          isActive: true,
        },
      },
      order: {
        createdAt: "DESC",
      },
    });

    return paginate(businesses, total, page, limit);
  }

  async findOne(id: number, ownerId: string): Promise<Businesses> {
    const business = await this.businessRepo

      .createQueryBuilder("business")
      .leftJoin("business.owner", "owner")
      .addSelect(["owner.id", "owner.name", "owner.email"])
      .leftJoinAndSelect(
        "business.locations",
        "location",
        "location.isActive = :isActive AND location.deletedAt IS NULL",
        { isActive: true }
      )
      .leftJoinAndSelect("location.locationManagers", "locationManager")
      .leftJoin("locationManager.user", "managerUser")
      .addSelect(["managerUser.id", "managerUser.name", "managerUser.email"])
      .leftJoinAndSelect("location.schedules", "schedule")
      .leftJoinAndSelect("location.locationFacilities", "locationFacility")
      .leftJoinAndSelect("locationFacility.facility", "facility")
      .leftJoinAndSelect("location.locationAmenities", "locationAmenity")
      .leftJoinAndSelect("locationAmenity.amenity", "amenity")
      .leftJoinAndSelect("business.userBusinessRoles", "userBusinessRole")
      .leftJoin("userBusinessRole.user", "userRoleUser")
      .addSelect(["userRoleUser.id", "userRoleUser.name", "userRoleUser.email"])
      .leftJoin("userBusinessRole.role", "role")
      .addSelect(["role.id", "role.name"])
      .where("business.id = :id", { id })
      .andWhere("business.ownerId = :ownerId", { ownerId })
      .getOne();

    if (!business) {
      throw new NotFoundException("Business not found");
    }

    return business;
  }

  async update(
    id: number,
    updateBusinessDto: UpdateBusinessDto,
    ownerId: string
  ): Promise<Businesses> {
    const existingBusiness = await this.businessRepo.findOne({
      where: {
        id,
        ownerId,
      },
    });

    if (!existingBusiness) {
      throw new NotFoundException("Business not found");
    }

    try {
      await this.businessRepo.update(id, updateBusinessDto);

      const business = await this.businessRepo.findOne({
        where: { id },
        relations: {
          owner: true,
          locations: true,
        },
        select: {
          id: true,
          name: true,
          description: true,
          ownerId: true,
          createdAt: true,
          updatedAt: true,
          locationsCount: true,
          userBusinessRolesCount: true,
          owner: {
            id: true,
            name: true,
            email: true,
          },
          locations: {
            id: true,
            name: true,
            type: true,
            isActive: true,
          },
        },
      });

      if (!business) {
        throw new NotFoundException("Business not found");
      }

      return business;
    } catch (error) {
      if (error instanceof QueryFailedError) {
        const driverError = error.driverError as {
          code?: string;
          errno?: number;
        };

        if (driverError.code === "ER_DUP_ENTRY" || driverError.errno === 1062) {
          throw new ConflictException(
            "A business with this name already exists for this owner"
          );
        }
      }

      throw error;
    }
  }

  async remove(id: number, ownerId: string): Promise<void> {
    const result = await this.businessRepo.delete({
      id,
      ownerId,
    });

    if (!result.affected) {
      throw new NotFoundException("Business not found");
    }
  }

  async getBusinessStats(
    businessId: number,
    ownerId: string
  ): Promise<{
    totalLocations: number;
    activeLocations: number;
    totalStaff: number;
    businessAge: number;
  }> {
    const business = await this.businessRepo.findOne({
      where: {
        id: businessId,
        ownerId,
      },
      select: {
        id: true,
        createdAt: true,
      },
    });

    if (!business) {
      throw new NotFoundException("Business not found");
    }

    const [totalLocations, activeLocations, totalStaff] = await Promise.all([
      this.locationRepo.count({
        where: {
          businessId,
        },
      }),

      this.locationRepo.count({
        where: {
          businessId,
          isActive: true,
          deletedAt: IsNull(),
        },
      }),

      this.userBusinessRolesRepo.count({
        where: {
          businessId,
        },
      }),
    ]);

    const businessAge = Math.floor(
      (Date.now() - business.createdAt.getTime()) / (1000 * 60 * 60 * 24)
    );

    return {
      totalLocations,
      activeLocations,
      totalStaff,
      businessAge,
    };
  }

  async getBusinessesByUser(userId: string): Promise<Businesses[]> {
    return this.businessRepo
      .createQueryBuilder("business")
      .leftJoin("business.owner", "owner")
      .addSelect(["owner.id", "owner.name", "owner.email"])
      .leftJoin("business.locations", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.isActive",
      ])
      .leftJoin("business.userBusinessRoles", "userBusinessRole")
      .where("business.ownerId = :userId", { userId })
      .orWhere("userBusinessRole.userId = :userId", { userId })
      .orderBy("business.createdAt", "DESC")
      .getMany();
  }
}
