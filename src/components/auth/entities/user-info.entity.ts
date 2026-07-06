import { BaseEntity } from "../../../common/entities/base.entity";
import { ADMIN_STATUS } from "../../../common/constants/admin.constant";
import { Entity, Column } from "typeorm";

@Entity("user")
export class UserInfoEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;

  @Column({
    type: "enum",
    enum: ADMIN_STATUS,
  })
  status: ADMIN_STATUS;
}
