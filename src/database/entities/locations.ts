import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Offers } from "./offers";
import { Reservations } from "./reservations";
import { LocationFacilities } from "./locationFacilities";
import { Reviews } from "./reviews";
import { LocationAmenities } from "./locationAmenities";
import { Schedules } from "./schedules";
import { UserBusinessRoles } from "./userBusinessRoles";
import { Businesses } from "./businesses";
import { User } from "./user";
import { LocationManagers } from "./locationManagers";
import { Event } from "./event";

@Index("locations_name_businessId_key", ["name", "businessId"], {
  unique: true,
})
@Index("locations_businessId_idx", ["businessId"], {})
@Index("locations_ownerId_idx", ["ownerId"], {})
@Entity("locations")
export class Locations {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "type", length: 191 })
  type: string;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("varchar", { name: "address", length: 191 })
  address: string;

  @Column("varchar", { name: "contact", nullable: true, length: 191 })
  contact: string | null;

  @Column("int", { name: "capacity", nullable: true })
  capacity: number | null;

  @Column("double", { name: "latitude", nullable: true, precision: 22 })
  latitude: number | null;

  @Column("double", { name: "longitude", nullable: true, precision: 22 })
  longitude: number | null;

  @Column("varchar", { name: "experience", nullable: true, length: 191 })
  experience: string | null;

  @Column("varchar", { name: "amenities", nullable: true, length: 191 })
  amenities: string | null;

  @Column("varchar", { name: "imageUrl", nullable: true, length: 191 })
  imageUrl: string | null;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @Column("datetime", { name: "deletedAt", nullable: true })
  deletedAt: Date | null;

  @Column("varchar", { name: "openingHours", nullable: true, length: 191 })
  openingHours: string | null;

  @Column("int", { name: "businessId" })
  businessId: number;

  @Column("varchar", { name: "ownerId", length: 191 })
  ownerId: string;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @Column("varchar", { name: "meniuUrl", nullable: true, length: 191 })
  meniuUrl: string | null;

  @OneToMany(() => Offers, (offers) => offers.location)
  offers: Offers[];

  @OneToMany(() => Reservations, (reservations) => reservations.location)
  reservations: Reservations[];

  @OneToMany(
    () => LocationFacilities,
    (locationFacilities) => locationFacilities.location
  )
  locationFacilities: LocationFacilities[];

  @OneToMany(() => Reviews, (reviews) => reviews.location)
  reviews: Reviews[];

  @OneToMany(
    () => LocationAmenities,
    (locationAmenities) => locationAmenities.location
  )
  locationAmenities: LocationAmenities[];

  @OneToMany(() => Schedules, (schedules) => schedules.location)
  schedules: Schedules[];

  @OneToMany(
    () => UserBusinessRoles,
    (userBusinessRoles) => userBusinessRoles.location
  )
  userBusinessRoles: UserBusinessRoles[];

  @ManyToOne(() => Businesses, (businesses) => businesses.locations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "businessId", referencedColumnName: "id" }])
  business: Businesses;

  @ManyToOne(() => User, (user) => user.locations, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "ownerId", referencedColumnName: "id" }])
  owner: User;

  @OneToMany(
    () => LocationManagers,
    (locationManagers) => locationManagers.location
  )
  locationManagers: LocationManagers[];

  @OneToMany(() => Event, (event) => event.location)
  events: Event[];
}
