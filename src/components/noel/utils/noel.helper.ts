import { format } from "date-fns";
import {
  Between,
  LessThanOrEqual,
  MoreThanOrEqual,
  FindOptionsWhere,
} from "typeorm";
import { NoelEntity } from "../noel.entity";
import { IMiniGameConfig } from "../../admin/mini-game-config/mini-game-config.interface";
import { GameType } from "../../integrations/integrations.constant";
import { GameUserData } from "../../integrations/integrations.interface";

export function getVipLevelConfig(level: number, config: IMiniGameConfig) {
  if (level >= 0 && level <= 5) return config.vipLevels.VIP_0_5;
  if (level >= 6 && level <= 11) return config.vipLevels.VIP_6_11;
  if (level >= 12 && level <= 15) return config.vipLevels.VIP_12_15;
  return config.vipLevels.VIP_16_20;
}

export function extractTotalValidBetAmounts(
  gameData: Record<GameType, GameUserData>,
): Record<GameType, number> {
  return {
    [GameType.BAN_CA]: gameData[GameType.BAN_CA].totalValidBetAmount || 0,
    [GameType.SLOT]: gameData[GameType.SLOT].totalValidBetAmount || 0,
    [GameType.CASINO]: gameData[GameType.CASINO].totalValidBetAmount || 0,
    [GameType.GAME_VIET]: gameData[GameType.GAME_VIET].totalValidBetAmount || 0,
    [GameType.THE_THAO]: gameData[GameType.THE_THAO].totalValidBetAmount || 0,
  } as Record<GameType, number>;
}

export function getConditionHistory(
  username: string,
  fromDate?: string,
  toDate?: string,
) {
  const where: FindOptionsWhere<NoelEntity> = {
    username,
    isCompleted: true,
  };

  const from = fromDate ? new Date(`${fromDate}T00:00:00+07:00`) : undefined;
  const to = toDate ? new Date(`${toDate}T23:59:59+07:00`) : undefined;

  if (from && to) {
    where.startTime = Between(from, to);
  } else if (from) {
    where.startTime = MoreThanOrEqual(from);
  } else if (to) {
    where.startTime = LessThanOrEqual(to);
  }

  return where;
}

export function mapHistoryItem(game: NoelEntity) {
  const time = game.startTime ? format(game.startTime, "HH:mm:ss") : "";
  const date = game.startTime ? format(game.startTime, "yyyy-MM-dd HH:mm:ss") : "";
  return {
    id: game.id,
    time,
    date,
    score: game.score,
  };
}

export function canPlayNoel(
  config: IMiniGameConfig,
  now = new Date(),
): boolean {
  if (!config) return false;
  if (!config.isGameEnabled) return false;

  if (config.eventStart) {
    const eventStart = new Date(config.eventStart);
    if (eventStart > now) return false;
  }

  if (config.eventEnd) {
    const eventEnd = new Date(config.eventEnd);
    if (eventEnd < now) return false;
  }

  return true;
}

export function calculateTimeDiff(
  startTime: Date,
  config: IMiniGameConfig,
): { timeDiff: number; isTimeout: boolean } {
  const timeDiff = (new Date().getTime() - startTime.getTime()) / 1000;
  const isTimeout = timeDiff > config.turnDuration + 20;
  return { timeDiff, isTimeout };
}
