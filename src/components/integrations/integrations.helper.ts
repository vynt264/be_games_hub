import { GameType } from "./integrations.constant";
import { Md5 } from "md5-typescript";
import { GameUserData, UserGameResponse } from "./integrations.interface";
import { ERROR_MESSAGE } from "src/common/constants/message.constant";

export function calculateGameSign(
  username: string,
  startTime: string,
  endTime: string,
  gameType: number,
  keyMD5: string,
): string {
  const signString = `${username}|${startTime}|${endTime}|${gameType}|${keyMD5}`;
  return Md5.init(signString);
}

export function calculateRewardSign(
  username: string,
  awardAmount: number,
  multiple: number,
  keyMD5: string,
): string {
  const signString = `${username}|${awardAmount}|${multiple}|${keyMD5}`;
  return Md5.init(signString);
}

export function isValidVipLevel(level: string): boolean {
  if (!level) return false;
  const match = level.match(/^VIP([0-9]|1[0-9]|20)$/);
  return !!match;
}

export const getInfoUser = async (
  username: string,
  keyMD5: string,
  getUserGameData: (
    username: string,
    gameType: GameType,
    startTime: string,
    endTime: string,
    sign: string,
  ) => Promise<UserGameResponse>,
  startTime: string,
  endTime: string,
  specificGameType?: GameType,
): Promise<Record<GameType, GameUserData>> => {
  const gameTypes = specificGameType
    ? [specificGameType]
    : (Object.values(GameType).filter(
        (value) => typeof value === "number",
      ) as GameType[]);
  const result: Record<GameType, GameUserData> = {} as Record<
    GameType,
    GameUserData
  >;

  for (const type of gameTypes) {
    const sign = calculateGameSign(username, startTime, endTime, type, keyMD5);
    const userData = await getUserGameData(
      username,
      type,
      startTime,
      endTime,
      sign,
    );

    if (!isValidVipLevel(userData.level)) {
      throw new Error(ERROR_MESSAGE.INVALID_LEVEL);
    }

    result[type] = {
      level: Number(userData.level.toString().replace("VIP", "")),
      totalValidBetAmount: userData.totalValidBetAmount || 0,
      totalRechargeAmount: userData.totalRechargeAmount || 0,
    };
  }

  return result;
};
