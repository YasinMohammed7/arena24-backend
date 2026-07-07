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
import { Event } from "./event";
import { Locations } from "./locations";
import { User } from "./user";
import { ReservationStatus } from "../../common/enums/reservation-status.enum";

@Index("reservations_userId_idx", ["userId"], {})
@Index("reservations_eventId_idx", ["eventId"], {})
@Index("reservations_locationId_idx", ["locationId"], {})
@Entity("reservations")
export class Reservations {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column({ name: "userId", nullable: true })
  userId: string | null;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("varchar", { name: "email", nullable: true, length: 191 })
  email: string | null;

  @Column("varchar", { name: "phone", nullable: true, length: 191 })
  phone: string | null;

  @Column("int", { name: "peopleCount" })
  peopleCount: number;

  @Column("enum", {
    name: "status",
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column("varchar", { name: "details", nullable: true, length: 191 })
  details: string | null;

  @Column("int", { name: "eventId", nullable: true })
  eventId: number | null;

  @Column("int", { name: "locationId", nullable: true })
  locationId: number | null;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => Event, (event) => event.reservations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "eventId", referencedColumnName: "id" }])
  event: Event;

  @ManyToOne(() => Locations, (locations) => locations.reservations, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;

  @ManyToOne(() => User, (user) => user.reservations, {
    onDelete: "SET NULL",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
