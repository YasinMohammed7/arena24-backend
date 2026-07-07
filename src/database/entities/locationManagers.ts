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

@Index("location_managers_userId_locationId_key", ["userId", "locationId"], {
  unique: true,
})
@Index("location_managers_locationId_idx", ["locationId"], {})
@Index("location_managers_userId_idx", ["userId"], {})
@Entity("location_managers")
export class LocationManagers {
  @PrimaryGeneratedColumn({ type: "int", name: "id" })
  id: number;

  @Column({ name: "userId" })
  userId: string;

  @Column("int", { name: "locationId" })
  locationId: number;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;

  @UpdateDateColumn({ name: "updatedAt", precision: 3 })
  updatedAt: Date;

  @ManyToOne(() => Locations, (locations) => locations.locationManagers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "locationId", referencedColumnName: "id" }])
  location: Locations;

  @ManyToOne(() => User, (user) => user.locationManagers, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn([{ name: "userId", referencedColumnName: "id" }])
  user: User;
}
