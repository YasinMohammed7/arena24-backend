import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Role } from "./role";
import { Permission } from "./permission";

@Index("role_permissions_permissionId_fkey", ["permissionId"])
@Entity("role_permissions")
export class RolePermission {
  @Column("varchar", {
    primary: true,
    name: "roleId",
  })
  roleId: string;

  @Column("varchar", {
    primary: true,
    name: "permissionId",
  })
  permissionId: string;

  @ManyToOne(() => Role, (role) => role.rolePermissions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "roleId", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => Permission, (permission) => permission.rolePermissions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "permissionId", referencedColumnName: "id" }])
  permission: Permission;
}
