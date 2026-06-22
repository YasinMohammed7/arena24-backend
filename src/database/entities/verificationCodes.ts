import { Column, CreateDateColumn, Entity, Index } from "typeorm";

@Index("verification_codes_contact_key", ["contact"], { unique: true })
@Entity("verification_codes")
export class VerificationCodes {
  @Column("varchar", { primary: true, name: "id", length: 191 })
  id: string;

  @Column("varchar", { name: "contact", unique: true, length: 191 })
  contact: string;

  @Column("varchar", { name: "code", length: 191 })
  code: string;

  @Column("datetime", { name: "expiresAt" })
  expiresAt: Date;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;
}
