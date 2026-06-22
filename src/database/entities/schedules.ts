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

@Index("schedules_locationId_idx", ["locationId"], {})
@Entity("schedules")
export class Schedules {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("int", { name: "locationId" })
  locationId: number;

  @Column("varchar", { name: "dayOfWeek", length: 191 })
  dayOfWeek: string;

  @Column("varchar", { name: "startTime", length: 191 })
  startTime: string;

  @Column("varchar", { name: "endTime", length: 191 })
  endTime: string;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => Locations, (locations) => locations.schedules, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;
}
