import { Entity, Column, Index } from "typeorm";
import { MiniGameType } from "../integrations/integrations.constant";
import { BaseEntity } from "src/common/entities/base.entity";
import { NoelResult } from "./noel.constant";
import { NoelPosition } from "./interfaces/noel.interface";

@Index(["username", "isCompleted", "startTime"])
@Entity("noel_games")
export class NoelEntity extends BaseEntity {
  @Column()
  username: string;

  @Column({
    type: "enum",
    enum: MiniGameType,
  })
  miniGameType: MiniGameType;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: "timestamp", nullable: true })
  startTime: Date;

  @Column({ type: "timestamp", nullable: true })
  endTime: Date;

  @Column({
    type: "enum",
    enum: NoelResult,
    nullable: true,
  })
  result: NoelResult;

  @Column("simple-json", { nullable: true })
  noelPositions: NoelPosition[];

  @Column()
  vipLevel: number;

  @Column({ type: "float", default: 0 })
  score: number;

  @Column({ nullable: true })
  timeLeft: number;

  @Column()
  totalSymbols: number;
}
