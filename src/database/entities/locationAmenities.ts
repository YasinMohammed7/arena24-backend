import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Amenities } from "./amenities";
import { Locations } from "./locations";

@Index(
  "location_amenities_locationId_amenityId_key",
  ["locationId", "amenityId"],
  { unique: true }
)
@Index("location_amenities_amenityId_idx", ["amenityId"], {})
@Index("location_amenities_locationId_idx", ["locationId"], {})
@Entity("location_amenities")
export class LocationAmenities {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "amenityId" })
  amenityId: number;

  @Column("int", { name: "locationId" })
  locationId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @ManyToOne(() => Amenities, (amenities) => amenities.locationAmenities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "amenityId", referencedColumnName: "id" }])
  amenity: Amenities;

  @ManyToOne(() => Locations, (locations) => locations.locationAmenities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;
}
