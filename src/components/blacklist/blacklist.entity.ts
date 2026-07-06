import { BaseEntity } from "../../common/entities/base.entity";
import { Entity, Column } from "typeorm";

@Entity("blacklist")
export class BlacklistEntity extends BaseEntity {
  @Column()
  username: string;

  @Column()
  acToken: string;

  @Column()
  deviceId: string;

  @Column({ type: "timestamp" })
  expiresAt: Date;
}
