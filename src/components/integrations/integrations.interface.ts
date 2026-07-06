export interface GameUserData {
  level: number;
  totalValidBetAmount?: number;
  totalRechargeAmount?: number;
}

export interface UserGameResponse {
  level: string;
  totalValidBetAmount: number;
  totalRechargeAmount: number;
}
