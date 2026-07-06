import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";

@Entity("error_logs")
export class ErrorLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 255 })
  service: string;

  @Column({ type: "varchar", length: 255 })
  method: string;

  @Column({ type: "text", nullable: true })
  message: string;

  @Column({ type: "json", nullable: true })
  error: any;

  @Column({ type: "json", nullable: true })
  requestData: any;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;
}
