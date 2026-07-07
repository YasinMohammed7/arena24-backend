import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Role } from "./role";
import { User } from "./user";

@Index("user_roles_roleId_fkey", ["roleId"], {})
@Entity("user_roles")
export class UserRoles {
  @Column("varchar", { primary: true, name: "userId" })
  userId: string;

  @Column("varchar", { primary: true, name: "roleId" })
  roleId: string;

  @Column("datetime", {
    name: "assignedAt",
    default: () => "current_timestamp(3)",
  })
  assignedAt: Date;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "roleId", referencedColumnName: "id" }])
  role: Role;

  @ManyToOne(() => User, (user) => user.userRoles, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
