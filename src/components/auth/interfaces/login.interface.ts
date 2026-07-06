import { Request } from "express";

export interface UserGameData {
  totalBetCount: number;
  level: string;
  totalRechargeAmount: number;
  totalValidBetAmount: number;
  totalWinLossAmount: number;
  totalPayoutAmount: number;
}

export interface LoginDto {
  username: string;
  deviceId: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    username: string;
    token: string;
    refreshToken: string;
  };
}

export interface LogoutResponse {
  success: boolean;
  message: string;
}

export interface ApiResponse {
  code: number;
  msg: string;
  data: UserGameData;
}

interface RefreshTokenResponseData {
  token: string;
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: RefreshTokenResponseData;
}

export interface AuthUser extends Request {
  user: {
    username: string;
  };
}
