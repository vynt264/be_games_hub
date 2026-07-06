import { Injectable, Logger } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { ConfigService } from "@nestjs/config";
import { GameType, MiniGameType } from "./integrations.constant";
import { UserGameData, ApiResponse } from "../auth/interfaces/login.interface";
import { calculateGameSign, calculateRewardSign } from "./integrations.helper";
import { format } from "date-fns";
import { ErrorLogService } from "../../common/services/error-log.service";

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
    private readonly errorLogService: ErrorLogService,
  ) {}

  async getUserGameData(
    username: string,
    gameType: GameType,
    startTime: string,
    endTime: string,
  ): Promise<UserGameData> {
    try {
      const keyMD5 = this.configService.get<string>("GAME_API_SIGN");
      const sign = calculateGameSign(
        username,
        startTime,
        endTime,
        gameType,
        keyMD5,
      );

      const body = {
        userName: username,
        startTime: startTime,
        endTime: endTime,
        gameType,
        sign,
      };

      let response: any;
      if (this.configService.get<string>("FAKE_DATA")) {
        response = {
          data: {
            code: 0,
            msg: "Success",
            data: {
              level: "VIP4",
              totalBetCount: 100,
              totalPayoutAmount: 8669.2,
              totalRechargeAmount: 2000,
              totalValidBetAmount: 11043,
              totalWithdrawAmount: -2373.82,
            },
          },
        };
      } else {
        const gameApiUrl = this.configService.get<string>("GAME_API_URL");
        response = await this.httpService.axiosRef.post<ApiResponse>(
          `${gameApiUrl}/member/r/userCe`,
          body,
        );
      }

      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }

      return response.data.data;
    } catch (error) {
      this.logger.error(error);
      await this.errorLogService.logError({
        service: "IntegrationsService",
        method: "getUserGameData",
        message: error?.message || "Failed to get user game data",
        error,
        requestData: { username, gameType, startTime, endTime },
      });
      throw error;
    }
  }

  async updateUserScore(
    username: string,
    awardAmount: number,
    gameType: MiniGameType,
    multiple: number,
  ): Promise<void> {
    try {
      const keyMD5 = this.configService.get<string>("GAME_API_SIGN");
      const sign = calculateRewardSign(username, awardAmount, multiple, keyMD5);

      const dateString = format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX");
      const body = {
        userName: username,
        awardAmount,
        multiple,
        remark: `${gameType}_${dateString}`,
        sign,
      };

      let response: any;
      if (this.configService.get<string>("FAKE_DATA")) {
        response = {
          data: {
            code: 0,
            msg: "Success",
            data: {
              level: "VIP4",
              totalBetCount: 100,
              totalPayoutAmount: 8669.2,
              totalRechargeAmount: 2000,
              totalValidBetAmount: 11043,
              totalWithdrawAmount: -2373.82,
            },
          },
        };
      } else {
        const gameApiUrl = this.configService.get<string>("GAME_API_URL");
        response = await this.httpService.axiosRef.post<ApiResponse>(
          `${gameApiUrl}/member/r/re`,
          body,
        );
      }

      if (response.data.code !== 0) {
        throw new Error(response.data.msg);
      }
    } catch (error) {
      this.logger.error(error);
      this.errorLogService.logError({
        service: "IntegrationsService",
        method: "updateUserScore",
        message: error?.message || "Failed to update user score",
        error,
        requestData: { username, awardAmount, gameType, multiple },
      });
    }
  }
}
