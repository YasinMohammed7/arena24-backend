import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Permission } from "./permission";
import { User } from "./user";

@Index("user_permissions_permissionId_fkey", ["permissionId"], {})
@Entity("user_permissions")
export class UserPermissions {
  @Column("varchar", { primary: true, name: "userId", length: 191 })
  userId: string;

  @Column("varchar", { primary: true, name: "permissionId", length: 191 })
  permissionId: string;

  @Column("datetime", {
    name: "assignedAt",
    default: () => "current_timestamp(3)",
  })
  assignedAt: Date;

  @Column("varchar", { name: "assignedBy", nullable: true, length: 191 })
  assignedBy: string | null;

  @Column("datetime", { name: "expiresAt", nullable: true })
  expiresAt: Date | null;

  @ManyToOne(() => Permission, (permission) => permission.userPermissions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "permissionId", referencedColumnName: "id" }])
  permission: Permission;

  @ManyToOne(() => User, (user) => user.userPermissions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
