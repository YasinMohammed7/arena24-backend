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
import { Businesses } from "./businesses";
import { Locations } from "./locations";
import { Role } from "./role";
import { User } from "./user";

@Index(
  "user_business_roles_userId_businessId_locationId_key",
  ["userId", "businessId", "locationId"],
  { unique: true }
)
@Index("user_business_roles_userId_idx", ["userId"], {})
@Index("user_business_roles_businessId_idx", ["businessId"], {})
@Index("user_business_roles_locationId_idx", ["locationId"], {})
@Index("user_business_roles_roleId_idx", ["roleId"], {})
@Entity("user_business_roles")
export class UserBusinessRoles {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column({ name: "userId" })
  userId: string;

  @Column("int", { name: "businessId", nullable: true })
  businessId: number | null;

  @Column("int", { name: "locationId", nullable: true })
  locationId: number | null;

  @Column({ name: "roleId" })
  roleId: string;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => Businesses, (businesses) => businesses.userBusinessRoles, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "businessId", referencedColumnName: "id" }])
  business: Businesses;

  @ManyToOne(() => Locations, (locations) => locations.userBusinessRoles, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;

  @ManyToOne(() => Role, (role) => role.userBusinessRoles, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "roleId", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => User, (user) => user.userBusinessRoles, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
