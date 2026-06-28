import {
  Column,
  Entity,
  Index,
  ManyToMany,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Permission } from "./permission";
import { UserBusinessRoles } from "./userBusinessRoles";
import { UserRoles } from "./userRoles";

@Index("Role_name_key", ["name"], { unique: true })
@Entity("Role")
export class Role {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { name: "name", unique: true, length: 191 })
  name: string;

  @ManyToMany(() => Permission, (permission) => permission.roles)
  permissions: Permission[];

  @OneToMany(
    () => UserBusinessRoles,
    (userBusinessRoles) => userBusinessRoles.role
  )
  userBusinessRoles: UserBusinessRoles[];

  @OneToMany(() => UserRoles, (userRoles) => userRoles.role)
  userRoles: UserRoles[];
}
