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

  // ISO 8601 weekday: 1 = Monday ... 7 = Sunday. Localized (luni/Monday) in the UI.
  @Column("tinyint", { name: "dayOfWeek", unsigned: true })
  dayOfWeek: number;

  // Wall-clock time of day, e.g. "09:00:00".
  @Column("time", { name: "startTime" })
  startTime: string;

  @Column("time", { name: "endTime" })
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
