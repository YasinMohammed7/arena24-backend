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
import { OfferCategories } from "./offerCategories";
import { Locations } from "./locations";

@Index("offers_locationId_idx", ["locationId"], {})
@Index("offers_categoryId_idx", ["categoryId"], {})
@Entity("offers")
export class Offers {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("varchar", { name: "image", nullable: true, length: 191 })
  image: string | null;

  @Column("datetime", { name: "startDate" })
  startDate: Date;

  @Column("datetime", { name: "endDate" })
  endDate: Date;

  @Column("int", { name: "discount", nullable: true })
  discount: number | null;

  @Column("int", { name: "locationId", nullable: true })
  locationId: number | null;

  @Column("int", { name: "categoryId" })
  categoryId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(
    () => OfferCategories,
    (offerCategories) => offerCategories.offers,
    { onDelete: "CASCADE", onUpdate: "CASCADE" }
  )
  @JoinColumn([{ name: "categoryId", referencedColumnName: "id" }])
  category: OfferCategories;

  @ManyToOne(() => Locations, (locations) => locations.offers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;
}
