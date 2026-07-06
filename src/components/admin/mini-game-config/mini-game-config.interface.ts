import { MiniGameType } from "../../integrations/integrations.constant";
import { TYPE_EVENT } from "./constants/terms.constant";

export interface IVipLevelConfig {
  MIN_SCORE: number;
  MAX_SCORE: number;
  ITEM_WITH_POINTS: number;
}

export type VipLevelKey = "VIP_0_5" | "VIP_6_11" | "VIP_12_15" | "VIP_16_20";

export type VipLevels = Record<VipLevelKey, IVipLevelConfig>;

export type TermKey = "term1" | "term2";

export interface IMiniGameConfig {
  typeGame: MiniGameType | string;
  vipLevels: VipLevels;
  dtcRequirements: Record<string, number>;
  createdAt?: Date;
  eventStart?: string;
  eventEnd?: string;
  isGameEnabled: boolean;
  term1?: string;
  term2?: string;
  rules?: string;
  minDeposit: number;
  multiple?: number;
  eventType?: TYPE_EVENT;
  maxTurns?: number;
  turnDuration?: number;
  totalSymbols?: number;
  fallSpeed?: number;
  carSpeed?: number;
  roadSpeed?: number;
}
