import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  OneToOne,
  UpdateDateColumn,
} from "typeorm";
import { Reservations } from "./reservations";
import { Reviews } from "./reviews";
import { UserBusinessRoles } from "./userBusinessRoles";
import { UserRoles } from "./userRoles";
import { PasswordResetTokens } from "./passwordResetTokens";
import { UserPermissions } from "./userPermissions";
import { Locations } from "./locations";
import { LocationManagers } from "./locationManagers";
import { RefreshTokens } from "./refreshTokens";
import { Businesses } from "./businesses";

@Index("User_email_key", ["email"], { unique: true })
@Index("User_phone_key", ["phone"], { unique: true })
@Entity("User")
export class User {
  @Column("varchar", { primary: true, name: "id", length: 191 })
  id: string;

  @Column("varchar", { name: "email", unique: true, length: 191 })
  email: string;

  @Column("varchar", { name: "password", length: 191 })
  password: string;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("varchar", { name: "phone", unique: true, length: 191 })
  phone: string;

  @Column("varchar", { name: "ownerId", nullable: true, length: 191 })
  ownerId: string | null;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @Column("datetime", { name: "deletedAt", nullable: true })
  deletedAt: Date | null;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @Column("varchar", { name: "imageUrl", nullable: true, length: 191 })
  imageUrl: string | null;

  @OneToMany(() => Reservations, (reservations) => reservations.user)
  reservations: Reservations[];

  @OneToMany(() => Reviews, (reviews) => reviews.user)
  reviews: Reviews[];

  @OneToMany(
    () => UserBusinessRoles,
    (userBusinessRoles) => userBusinessRoles.user
  )
  userBusinessRoles: UserBusinessRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.user)
  userRoles: UserRoles[];

  @OneToOne(
    () => PasswordResetTokens,
    (passwordResetTokens) => passwordResetTokens.user
  )
  passwordResetTokens: PasswordResetTokens;

  @OneToMany(() => UserPermissions, (userPermissions) => userPermissions.user)
  userPermissions: UserPermissions[];

  @OneToMany(() => Locations, (locations) => locations.owner)
  locations: Locations[];

  @OneToMany(
    () => LocationManagers,
    (locationManagers) => locationManagers.user
  )
  locationManagers: LocationManagers[];

  @OneToMany(() => RefreshTokens, (refreshTokens) => refreshTokens.user)
  refreshTokens: RefreshTokens[];

  @OneToMany(() => Businesses, (businesses) => businesses.owner)
  businesses: Businesses[];
}
