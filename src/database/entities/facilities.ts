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
import { EventFacilities } from "./eventFacilities";
import { LocationFacilities } from "./locationFacilities";

@Index("facilities_name_key", ["name"], { unique: true })
@Index("facilities_name_idx", ["name"], {})
@Entity("facilities")
export class Facilities {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 191 })
  name: string;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @OneToMany(
    () => EventFacilities,
    (eventFacilities) => eventFacilities.facility
  )
  eventFacilities: EventFacilities[];

  @OneToMany(
    () => LocationFacilities,
    (locationFacilities) => locationFacilities.facility
  )
  locationFacilities: LocationFacilities[];

  // Read-only count of linked locations, computed per query (not persisted).
  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM location_facilities WHERE facilityId = ${alias}.id`,
  })
  locationsCount: number;
}
