import { BaseEntity } from "src/common/entities/base.entity";
import { Column, Entity, Index } from "typeorm";

@Entity("noel_fake_users_notification")
@Index(["username"], { unique: true })
export class NoelFakeUserNotificationEntity extends BaseEntity {
  @Column()
  username: string;

  @Column()
  updatedBy: string;
}
