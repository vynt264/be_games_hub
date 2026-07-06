import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from "@nestjs/common";
import { LoginDto } from "./dto/login.dto";
import {
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
} from "./interfaces/login.interface";
import { TokenService } from "../jwt/jwt.service";
import { BlacklistService } from "../blacklist/blacklist.service";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "../../common/constants/message.constant";
import { GameType } from "../integrations/integrations.constant";
import { ConfigService } from "@nestjs/config";
import { getInfoUser } from "../integrations/integrations.helper";
import { IntegrationsService } from "../integrations/integrations.service";
import { ADMIN_STATUS, ROLE_USER } from "../../common/constants/admin.constant";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserInfoEntity } from "./entities/user-info.entity";
import { NoelConfigService } from "../admin/mini-game-config/noel/noel-config.service";
import { getRevenueTimeForThirdParty } from "src/common/helpers/get-revenue-time.helper";
import { TurnsService } from "../turns/turns.service";

@Injectable()
export class AuthService {
  constructor(
    private readonly tokenService: TokenService,
    private readonly blacklistService: BlacklistService,
    private readonly configService: ConfigService,
    private readonly integrationsService: IntegrationsService,
    @InjectRepository(UserInfoEntity)
    private readonly userRepo: Repository<UserInfoEntity>,
    private readonly noelConfigService: NoelConfigService,
    private readonly turnsService: TurnsService,
  ) {}

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    try {
      const config = await this.noelConfigService.getNoelConfig();
      const { username, deviceId } = loginDto;
      const { startOfDay, endOfDay } = getRevenueTimeForThirdParty(
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      await this.validateGameLevel(
        username,
        startOfDay,
        endOfDay,
        GameType.CASINO,
      );

      const user = await this.findOrCreateUser(username);
      this.checkUserActive(user);
      await this.turnsService.configureLoginTurns(username, config);

      const tokens = await this.generateAndSaveTokens(
        username,
        ROLE_USER,
        deviceId,
      );

      return {
        success: true,
        message: SUCCESS_MESSAGE.LOGIN_SUCCESS,
        data: {
          username,
          ...tokens,
        },
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      throw new UnauthorizedException(ERROR_MESSAGE.LOGIN_FAILED);
    }
  }

  async refreshToken(
    refreshToken: string,
    deviceId: string,
  ): Promise<RefreshTokenResponse> {
    try {
      const { username } =
        await this.tokenService.verifyRefreshToken(refreshToken);
      const config = await this.noelConfigService.getNoelConfig();
      const { startOfDay, endOfDay } = getRevenueTimeForThirdParty(
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      await this.validateGameLevel(username, startOfDay, endOfDay);
      const tokens = await this.generateAndSaveTokens(
        username,
        ROLE_USER,
        deviceId,
      );

      return {
        success: true,
        message: SUCCESS_MESSAGE.TOKEN_REFRESHED,
        data: tokens,
      };
    } catch (error) {
      throw new UnauthorizedException(
        ERROR_MESSAGE.INVALID_REFRESH_TOKEN,
        error,
      );
    }
  }

  private async validateGameLevel(
    username: string,
    startTime: string,
    endTime: string,
    specificGameType?: GameType,
  ): Promise<void> {
    const keyMD5 = this.configService.get<string>("GAME_API_SIGN");
    await getInfoUser(
      username,
      keyMD5,
      this.integrationsService.getUserGameData.bind(this.integrationsService),
      startTime,
      endTime,
      specificGameType,
    );
  }

  private async generateAndSaveTokens(
    username: string,
    role: string,
    deviceId: string,
  ) {
    await this.blacklistService.deleteUserTokens(username);
    const { token, refreshToken } = await this.tokenService.generateTokens(
      username,
      role,
      deviceId,
    );
    await this.blacklistService.blacklistToken(username, token, deviceId);
    return { token, refreshToken };
  }

  private async findOrCreateUser(username: string): Promise<UserInfoEntity> {
    let user = await this.userRepo.findOne({ where: { username } });
    if (!user) {
      user = this.userRepo.create({ username, status: ADMIN_STATUS.ACTIVE });
      await this.userRepo.save(user);
    }
    return user;
  }

  private checkUserActive(user: UserInfoEntity) {
    if (user.status !== ADMIN_STATUS.ACTIVE) {
      throw new UnauthorizedException("Tài khoản đã bị khóa");
    }
  }

  async logout(username: string): Promise<LogoutResponse> {
    await this.blacklistService.deleteUserTokens(username);
    return {
      success: true,
      message: SUCCESS_MESSAGE.LOGOUT_SUCCESS,
    };
  }
}
