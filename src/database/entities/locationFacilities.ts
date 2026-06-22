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
import { Facilities } from "./facilities";
import { Locations } from "./locations";

@Index(
  "location_facilities_facilityId_locationId_key",
  ["facilityId", "locationId"],
  { unique: true }
)
@Index("location_facilities_facilityId_idx", ["facilityId"], {})
@Index("location_facilities_locationId_idx", ["locationId"], {})
@Entity("location_facilities")
export class LocationFacilities {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "facilityId" })
  facilityId: number;

  @Column("int", { name: "locationId" })
  locationId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @ManyToOne(() => Facilities, (facilities) => facilities.locationFacilities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "facilityId", referencedColumnName: "id" }])
  facility: Facilities;

  @ManyToOne(() => Locations, (locations) => locations.locationFacilities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;
}
