import {
  GameType,
  MiniGameType,
} from "../../integrations/integrations.constant";
import { NoelResult } from "../noel.constant";

export interface UserRechargeData {
  dailyRecharge: number;
  totalRechargeAmount: number;
}

export enum NoelHitSymbolWithPoints {
  BELL = "BELL", // Chuông
  ORNAMENT = "ORNAMENT", // Quả châu
  CANDY_CANE = "CANDY_CANE", // Kẹo gậy
  GIFT_BOX = "GIFT_BOX", // Hộp quà
}

export enum NoelHitSymbolWithoutPoints {
  SNOW_GLOBE = "SNOW_GLOBE", // Cầu tuyết
  CHRISTMAS_TREE = "CHRISTMAS_TREE", // Cây thông
  FIREPLACE = "FIREPLACE", // Lò sưởi
  SNOWMAN = "SNOWMAN", // Người tuyết
}
export interface NoelPosition {
  id: number;
  x: number;
  y: number;
  symbolType?: NoelHitSymbolWithPoints | NoelHitSymbolWithoutPoints;
  isSelected?: boolean;
  score?: number;
}

export interface NoelGameState {
  id: number;
  username: string;
  deviceId: string;
  gameType: GameType;
  miniGameType: MiniGameType;
  score: number;
  timeLeft: number;
  isCompleted: boolean;
  startTime?: Date;
  endTime?: Date;
  result?: NoelResult;
  noelPositions: NoelPosition[];
  createdAt: Date;
}

export interface IGameResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
