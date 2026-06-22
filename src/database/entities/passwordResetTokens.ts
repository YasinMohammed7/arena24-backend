import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
} from "typeorm";
import { User } from "./user";

@Index("password_reset_tokens_token_key", ["token"], { unique: true })
@Index("password_reset_tokens_userId_key", ["userId"], { unique: true })
@Entity("password_reset_tokens")
export class PasswordResetTokens {
  @Column("varchar", { primary: true, name: "id", length: 191 })
  id: string;

  @Column("varchar", { name: "token", unique: true, length: 191 })
  token: string;

  @Column("varchar", { name: "userId", unique: true, length: 191 })
  userId: string;

  @Column("datetime", { name: "expiresAt" })
  expiresAt: Date;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @OneToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
