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
import { User } from "./user";

@Index("refresh_tokens_token_key", ["token"], { unique: true })
@Index("refresh_tokens_userId_fkey", ["userId"], {})
@Entity("refresh_tokens")
export class RefreshTokens {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "token", unique: true, length: 191 })
  token: string;

  @Column({ name: "userId" })
  userId: string;

  @Column("datetime", { name: "expiresAt" })
  expiresAt: Date;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => User, (user) => user.refreshTokens, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
