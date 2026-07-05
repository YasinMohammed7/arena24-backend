import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateAmenityDto } from "./dto/create-amenity.dto";
import { UpdateAmenityDto } from "./dto/update-amenity.dto";
import { promises as fs } from "fs";
import * as path from "path";
import { Amenities } from "@/database/entities/amenities";
import { Repository, QueryFailedError } from "typeorm";
import { InjectRepository } from "@nestjs/typeorm";
import { LocationAmenities } from "@/database/entities/locationAmenities";

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(Amenities)
    private readonly amenityRepo: Repository<Amenities>,

    @InjectRepository(LocationAmenities)
    private readonly locationAmenityRepo: Repository<LocationAmenities>
  ) {}

  async create(createAmenityDto: CreateAmenityDto) {
    try {
      const amenity = this.amenityRepo.create(createAmenityDto);
      const saved = await this.amenityRepo.save(amenity);
      // A brand-new amenity has no linked locations yet.
      saved.locationsCount = 0;
      return saved;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === "ER_DUP_ENTRY"
      ) {
        throw new ConflictException(
          `Amenity with name '${createAmenityDto.name}' already exists`
        );
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false) {
    const queryBuilder = this.amenityRepo
      .createQueryBuilder("amenity")
      .orderBy("amenity.name", "ASC");

    if (!includeInactive) {
      queryBuilder.where("amenity.isActive = :isActive", { isActive: true });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const amenity = await this.amenityRepo
      .createQueryBuilder("amenity")
      .leftJoinAndSelect("amenity.locationAmenities", "locationAmenity")
      .leftJoin("locationAmenity.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.isActive",
      ])
      .where("amenity.id = :id", { id })
      .getOne();

    if (!amenity) {
      throw new NotFoundException(`Amenity with ID ${id} not found`);
    }

    return amenity;
  }

  async update(id: number, updateAmenityDto: UpdateAmenityDto) {
    const amenity = await this.findOne(id); // Check if exists

    try {
      await this.amenityRepo.update(id, updateAmenityDto);

      // If the icon was replaced, delete the old file.
      if (updateAmenityDto.iconUrl && amenity.iconUrl) {
        const absPath = path.join(process.cwd(), "public", amenity.iconUrl);
        try {
          await fs.unlink(absPath);
        } catch (err) {
          // Ignore "file not found"; surface anything else.
          const code =
            err instanceof Error && "code" in err ? err.code : undefined;
          if (code !== "ENOENT") {
            console.error("Error deleting old file:", err);
          }
        }
      }

      return this.amenityRepo
        .createQueryBuilder("amenity")
        .where("amenity.id = :id", { id })
        .getOne();
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === "ER_DUP_ENTRY"
      ) {
        throw new ConflictException(
          `Amenity with name '${updateAmenityDto.name}' already exists`
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const amenity = await this.findOne(id);

    // Check if amenity is being used by any locations
    const locationCount = await this.locationAmenityRepo.count({
      where: { amenityId: id },
    });

    if (locationCount > 0) {
      throw new ConflictException(
        `Cannot delete amenity '${amenity.name}' as it is being used by ${locationCount} location(s). Remove it from all locations first.`
      );
    }

    await this.amenityRepo.delete(id);
  }

  async toggleStatus(id: number) {
    const amenity = await this.findOne(id);

    await this.amenityRepo.update(id, { isActive: !amenity.isActive });

    return this.amenityRepo
      .createQueryBuilder("amenity")
      .where("amenity.id = :id", { id })
      .getOne();
  }

  async getLocationsByAmenity(id: number) {
    await this.findOne(id); // Check if amenity exists

    return this.locationAmenityRepo
      .createQueryBuilder("locationAmenity")
      .leftJoin("locationAmenity.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.address",
        "location.isActive",
      ])
      .leftJoin("location.business", "business")
      .addSelect(["business.id", "business.name"])
      .where("locationAmenity.amenityId = :id", { id })
      .getMany();
  }
}
