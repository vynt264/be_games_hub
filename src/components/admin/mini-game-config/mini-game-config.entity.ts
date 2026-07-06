import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from "typeorm";
import { IVipLevelConfig, VipLevelKey } from "./mini-game-config.interface";

@Entity("mini_game_config")
export class MiniGameConfigEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  typeGame: string;

  @Column("simple-json", { nullable: true })
  vipLevels: Record<VipLevelKey, IVipLevelConfig>;

  @Column({ nullable: true })
  minDeposit: number;

  @Column("simple-json", { nullable: true })
  dtcRequirements: Record<string, number>;

  @Column({ nullable: true })
  eventStart: string;

  @Column({ nullable: true })
  eventEnd: string;

  @Column({ nullable: true })
  isGameEnabled: boolean;

  @Column({ type: "text", nullable: true })
  term1: string;

  @Column({ type: "text", nullable: true })
  term2: string;

  @Column({ type: "text", nullable: true })
  rules: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  multiple: number;

  @Column({ nullable: true })
  eventType: number;

  @Column({ nullable: true })
  maxTurns: number;

  @Column({ nullable: true })
  turnDuration: number;

  @Column({ nullable: true })
  totalSymbols: number;

  @Column({ nullable: true })
  fallSpeed: number;

  @Column({ nullable: true })
  carSpeed: number;

  @Column({ nullable: true })
  roadSpeed: number;
}
