import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import {
  AdminRole,
  ADMIN_STATUS,
  ROLE_ADMIN,
} from "../../../common/constants/admin.constant";
import { BaseEntity } from "../../../common/entities/base.entity";

@Entity("admin")
export class AdminAuthEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ default: ROLE_ADMIN })
  role: AdminRole;

  @Column({
    type: "enum",
    enum: ADMIN_STATUS,
  })
  status: ADMIN_STATUS;

  @Column({ nullable: true })
  updatedBy: string;
}
