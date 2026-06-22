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
import { Locations } from "./locations";
import { User } from "./user";

@Index("reviews_userId_locationId_key", ["userId", "locationId"], {
  unique: true,
})
@Index("reviews_userId_idx", ["userId"], {})
@Index("reviews_locationId_idx", ["locationId"], {})
@Entity("reviews")
export class Reviews {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("text", { name: "comment", nullable: true })
  comment: string | null;

  @Column("int", { name: "stars" })
  stars: number;

  @Column("varchar", { name: "userId", length: 191 })
  userId: string;

  @Column("int", { name: "locationId" })
  locationId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => Locations, (locations) => locations.reviews, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;

  @ManyToOne(() => User, (user) => user.reviews, {
    onDelete: "RESTRICT",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
