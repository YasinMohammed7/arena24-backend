import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from "typeorm";

@Index("media_modelType_modelId_idx", ["modelType", "modelId"], {})
@Entity("media")
export class Media {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("varchar", { name: "modelType", length: 191 })
  modelType: string;

  @Column("varchar", { name: "modelId", length: 191 })
  modelId: string;

  @Column("varchar", { name: "type", length: 191 })
  type: string;

  @Column("varchar", { name: "fileName", length: 191 })
  fileName: string;

  @Column("varchar", { name: "mimeType", length: 191 })
  mimeType: string;

  @Column("int", { name: "size" })
  size: number;

  @Column("varchar", { name: "path", length: 191 })
  path: string;

  @Column("varchar", { name: "url", length: 191 })
  url: string;

  @Column("varchar", { name: "altText", nullable: true, length: 191 })
  altText: string | null;

  @Column("int", { name: "sortOrder", nullable: true })
  sortOrder: number | null;

  @CreateDateColumn({ name: "createdAt", precision: 3 })
  createdAt: Date;
}
