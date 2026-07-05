import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  VirtualColumn,
} from "typeorm";
import { LocationAmenities } from "./locationAmenities";

@Index("amenities_name_key", ["name"], { unique: true })
@Index("amenities_name_idx", ["name"], {})
@Entity("amenities")
export class Amenities {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 191 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 191 })
  description: string | null;

  @Column("varchar", { name: "iconUrl", nullable: true, length: 191 })
  iconUrl: string | null;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @OneToMany(
    () => LocationAmenities,
    (locationAmenities) => locationAmenities.amenity
  )
  locationAmenities: LocationAmenities[];

  // Read-only count of linked locations, computed per query (not persisted).
  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM location_amenities WHERE amenityId = ${alias}.id`,
  })
  locationsCount: number;
}
