import {
  Column,
  Entity,
  Index,
  JoinTable,
  ManyToMany,
  OneToMany,
} from "typeorm";
import { Role } from "./role";
import { UserPermissions } from "./userPermissions";

@Index("Permission_name_key", ["name"], { unique: true })
@Entity("Permission")
export class Permission {
  @Column("varchar", { primary: true, name: "id", length: 191 })
  id: string;

  @Column("varchar", { name: "name", unique: true, length: 191 })
  name: string;

  @ManyToMany(() => Role, (role) => role.permissions)
  @JoinTable({
    name: "role_permissions",
    joinColumns: [{ name: "permissionId", referencedColumnName: "id" }],
    inverseJoinColumns: [{ name: "roleId", referencedColumnName: "id" }],
  })
  roles: Role[];

  @OneToMany(
    () => UserPermissions,
    (userPermissions) => userPermissions.permission
  )
  userPermissions: UserPermissions[];
}
