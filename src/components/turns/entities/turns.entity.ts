import { BaseEntity } from "src/common/entities/base.entity";
import { Entity, Column } from "typeorm";

@Entity("turns")
export class TurnsEntity extends BaseEntity {
  @Column()
  username: string;

  @Column({ type: "int", default: 0 })
  totalTurns: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  banCaLastBet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  slotLastBet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  casinoLastBet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  gameVietLastBet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  theThaoLastBet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  dtcBanCa: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  dtcSlots: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  dtcCasino: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  dtcGameViet: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  dtcTheThao: number;

  @Column({ type: "int", default: 0 })
  usedTurns: number;

  @Column({ type: "decimal", precision: 20, scale: 2, default: 0 })
  minDeposit: number;

  @Column({ default: false })
  isCompleted: boolean;
}
