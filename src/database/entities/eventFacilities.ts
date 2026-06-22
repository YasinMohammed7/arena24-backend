import { Column, Entity, Index, JoinColumn, ManyToOne } from "typeorm";
import { Event } from "./event";
import { Facilities } from "./facilities";

@Index("event_facilities_facilityId_fkey", ["facilityId"], {})
@Entity("event_facilities")
export class EventFacilities {
  @Column("int", { primary: true, name: "eventId" })
  eventId: number;

  @Column("int", { primary: true, name: "facilityId" })
  facilityId: number;

  @Column({ type: "boolean", name: "isActive", default: true })
  isActive: boolean;

  @ManyToOne(() => Event, (event) => event.eventFacilities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "eventId", referencedColumnName: "id" }])
  event: Event;

  @ManyToOne(() => Facilities, (facilities) => facilities.eventFacilities, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "facilityId", referencedColumnName: "id" }])
  facility: Facilities;
}
