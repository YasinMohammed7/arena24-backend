import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Offers } from "./offers";

@Index("offer_categories_name_key", ["name"], { unique: true })
@Index("offer_categories_name_idx", ["name"], {})
@Entity("offer_categories")
export class OfferCategories {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", unique: true, length: 191 })
  name: string;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @OneToMany(() => Offers, (offers) => offers.category)
  offers: Offers[];
}
