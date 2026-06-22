import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Event } from "./event";

@Index("event_included_options_eventId_fkey", ["eventId"], {})
@Entity("event_included_options")
export class EventIncludedOptions {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column("varchar", { name: "name", length: 191 })
  name: string;

  @Column("int", { name: "eventId" })
  eventId: number;

  @ManyToOne(() => Event, (event) => event.eventIncludedOptions, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "eventId", referencedColumnName: "id" }])
  event: Event;
}
