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
  VirtualColumn,
} from "typeorm";
import { UserBusinessRoles } from "./userBusinessRoles";
import { Locations } from "./locations";
import { User } from "./user";

@Index("businesses_name_ownerId_key", ["name", "ownerId"], { unique: true })
@Index("businesses_ownerId_idx", ["ownerId"], {})
@Index("businesses_name_idx", ["name"], {})
@Entity("businesses")
export class Businesses {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("varchar", { name: "description", nullable: true, length: 191 })
  description: string | null;

  @Column({ name: "ownerId" })
  ownerId: string;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @OneToMany(
    () => UserBusinessRoles,
    (userBusinessRoles) => userBusinessRoles.business
  )
  userBusinessRoles: UserBusinessRoles[];

  @OneToMany(() => Locations, (locations) => locations.business)
  locations: Locations[];

  @ManyToOne(() => User, (user) => user.businesses, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "ownerId", referencedColumnName: "id" }])
  owner: User;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM locations WHERE locations.businessId = ${alias}.id`,
  })
  locationsCount: number;

  @VirtualColumn({
    query: (alias) =>
      `SELECT COUNT(*) FROM user_business_roles WHERE user_business_roles.businessId = ${alias}.id`,
  })
  userBusinessRolesCount: number;
}
