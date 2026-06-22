import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./event";

@Index("event_requirements_eventId_fkey", ["eventId"], {})
@Entity("event_requirements")
export class EventRequirements {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("int", { name: "eventId" })
  eventId: number;

  @ManyToOne(() => Event, (event) => event.eventRequirements, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "eventId", referencedColumnName: "id" }])
  event: Event;
}
