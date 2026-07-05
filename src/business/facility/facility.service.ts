import {
  Injectable,
  NotFoundException,
  ConflictException,
} from "@nestjs/common";
import { CreateFacilityDto } from "./dto/create-facility.dto";
import { UpdateFacilityDto } from "./dto/update-facility.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, QueryFailedError } from "typeorm";
import { Facilities } from "@/database/entities/facilities";
import { LocationFacilities } from "@/database/entities/locationFacilities";

@Injectable()
export class FacilityService {
  constructor(
    @InjectRepository(Facilities)
    private readonly facilityRepo: Repository<Facilities>,

    @InjectRepository(LocationFacilities)
    private readonly locationFacilityRepo: Repository<LocationFacilities>
  ) {}

  async create(createFacilityDto: CreateFacilityDto) {
    try {
      const facility = this.facilityRepo.create(createFacilityDto);
      const saved = await this.facilityRepo.save(facility);
      // A brand-new facility has no linked locations yet.
      saved.locationsCount = 0;
      return saved;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === "ER_DUP_ENTRY"
      ) {
        throw new ConflictException(
          `Facility with name '${createFacilityDto.name}' already exists`
        );
      }
      throw error;
    }
  }

  async findAll(includeInactive: boolean = false) {
    const queryBuilder = this.facilityRepo
      .createQueryBuilder("facility")
      .orderBy("facility.name", "ASC");

    if (!includeInactive) {
      queryBuilder.where("facility.isActive = :isActive", { isActive: true });
    }

    return queryBuilder.getMany();
  }

  async findOne(id: number) {
    const facility = await this.facilityRepo
      .createQueryBuilder("facility")
      .leftJoinAndSelect("facility.locationFacilities", "locationFacility")
      .leftJoin("locationFacility.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.isActive",
      ])
      .where("facility.id = :id", { id })
      .getOne();

    if (!facility) {
      throw new NotFoundException(`Facility with ID ${id} not found`);
    }

    return facility;
  }

  async update(id: number, updateFacilityDto: UpdateFacilityDto) {
    await this.findOne(id); // Check if exists

    try {
      await this.facilityRepo.update(id, updateFacilityDto);

      return this.facilityRepo
        .createQueryBuilder("facility")
        .where("facility.id = :id", { id })
        .getOne();
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        (error as { code?: string }).code === "ER_DUP_ENTRY"
      ) {
        throw new ConflictException(
          `Facility with name '${updateFacilityDto.name}' already exists`
        );
      }
      throw error;
    }
  }

  async remove(id: number) {
    const facility = await this.findOne(id);

    // Check if facility is being used by any locations
    const locationCount = await this.locationFacilityRepo.count({
      where: { facilityId: id },
    });

    if (locationCount > 0) {
      throw new ConflictException(
        `Cannot delete facility '${facility.name}' as it is being used by ${locationCount} location(s). Remove it from all locations first.`
      );
    }

    await this.facilityRepo.delete(id);
  }

  async toggleStatus(id: number) {
    const facility = await this.findOne(id);

    await this.facilityRepo.update(id, { isActive: !facility.isActive });

    return this.facilityRepo
      .createQueryBuilder("facility")
      .where("facility.id = :id", { id })
      .getOne();
  }

  async getLocationsByFacility(id: number) {
    await this.findOne(id); // Check if facility exists

    return this.locationFacilityRepo
      .createQueryBuilder("locationFacility")
      .leftJoin("locationFacility.location", "location")
      .addSelect([
        "location.id",
        "location.name",
        "location.type",
        "location.address",
        "location.isActive",
      ])
      .leftJoin("location.business", "business")
      .addSelect(["business.id", "business.name"])
      .where("locationFacility.facilityId = :id", { id })
      .getMany();
  }
}
