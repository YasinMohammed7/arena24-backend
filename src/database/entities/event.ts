import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { EventFacilities } from "./eventFacilities";
import { EventIncludedOptions } from "./eventIncludedOptions";
import { Reservations } from "./reservations";
import { EventRequirements } from "./eventRequirements";
import { Locations } from "./locations";

@Index("event_locationId_fkey", ["locationId"], {})
@Entity("event")
export class Event {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("text", { name: "description", nullable: true })
  description: string | null;

  @Column("datetime", { name: "date" })
  date: Date;

  @Column("datetime", { name: "startHour" })
  startHour: Date;

  @Column("datetime", { name: "endHour" })
  endHour: Date;

  @Column("varchar", { name: "address", length: 191 })
  address: string;

  @Column("decimal", { name: "price", nullable: true, precision: 10, scale: 2 })
  price: string | null;

  @Column("int", { name: "maxPeople", nullable: true })
  maxPeople: number | null;

  @Column("varchar", { name: "imageUrl", nullable: true, length: 191 })
  imageUrl: string | null;

  @Column("int", { name: "locationId" })
  locationId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @OneToMany(() => EventFacilities, (eventFacilities) => eventFacilities.event)
  eventFacilities: EventFacilities[];

  @OneToMany(
    () => EventIncludedOptions,
    (eventIncludedOptions) => eventIncludedOptions.event
  )
  eventIncludedOptions: EventIncludedOptions[];

  @OneToMany(() => Reservations, (reservations) => reservations.event)
  reservations: Reservations[];

  @OneToMany(
    () => EventRequirements,
    (eventRequirements) => eventRequirements.event
  )
  eventRequirements: EventRequirements[];

  @ManyToOne(() => Locations, (locations) => locations.events, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;
}
