import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NoelEntity } from "./noel.entity";
import { GameType, MiniGameType } from "../integrations/integrations.constant";
import {
  ERROR_MESSAGE,
  SUCCESS_MESSAGE,
} from "../../common/constants/message.constant";
import { ConfigService } from "@nestjs/config";
import { TurnsService } from "../turns/turns.service";
import { getInfoUser } from "../integrations/integrations.helper";
import { IntegrationsService } from "../integrations/integrations.service";
import { GameUserData } from "../integrations/integrations.interface";
import { NoelConfigService } from "../admin/mini-game-config/noel/noel-config.service";
import { IMiniGameConfig } from "../admin/mini-game-config/mini-game-config.interface";
import { getRevenueTimeForThirdParty } from "src/common/helpers/get-revenue-time.helper";
import {
  NoelHitSymbolWithoutPoints,
  NoelHitSymbolWithPoints,
  NoelPosition,
} from "./interfaces/noel.interface";
import {
  getConditionHistory,
  mapHistoryItem,
  canPlayNoel,
  extractTotalValidBetAmounts,
  getVipLevelConfig,
  calculateTimeDiff,
} from "./utils/noel.helper";
import { SocketService } from "../socket/socket.service";
import { shuffleArray } from "src/common/helpers/array.helper";
import { NoelResult } from "./noel.constant";
import { NoelDataDto, SelectedNoelDto } from "./dto";
import { plainToClass } from "class-transformer";
import { makePicker } from "src/common/helpers/randomHelper";

@Injectable()
export class NoelService {
  // Map để lưu public key của client theo username
  private clientPublicKeys = new Map<
    string,
    { encryptKey: string; verifyKey: string; exp: number }
  >();
  constructor(
    @InjectRepository(NoelEntity)
    private readonly noelRepository: Repository<NoelEntity>,
    private readonly integrationsService: IntegrationsService,
    private readonly turnsService: TurnsService,
    private readonly configService: ConfigService,
    private readonly noelConfigService: NoelConfigService,
    private readonly socketService: SocketService,
  ) { }

  // Lưu public key cho user
  saveClientPublicKey(
    username: string,
    encryptKey: string,
    verifyKey: string,
  ): void {
    this.clientPublicKeys.set(username, {
      encryptKey,
      verifyKey,
      exp: Date.now() + 60 * 1000, // 1 phút
    });
  }

  // Lấy public key của user
  getClientPublicKey(username: string) {
    const data = this.clientPublicKeys.get(username);
    if (!data) return null;
    if (data.exp < Date.now()) {
      this.clientPublicKeys.delete(username);
      return null;
    }
    return data;
  }

  deleteClientPublicKey(username: string) {
    this.clientPublicKeys.delete(username);
  }

  async startGame(username: string) {
    try {
      const config = await this.noelConfigService.getNoelConfig();
      const canPlay = canPlayNoel(config);
      if (!canPlay) {
        throw new BadRequestException(
          "Game hiện đang tắt hoặc ngoài thời gian sự kiện!",
        );
      }

      const { startOfDay, endOfDay } = getRevenueTimeForThirdParty(
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      const gameData = await this.validateAndGetGameData(
        username,
        startOfDay,
        endOfDay,
      );
      await this.calculateTotalTurns(username, gameData, config);
      await this.validateCanPlay(username, config);

      const game = await this.createNewGame(
        username,
        gameData[GameType.CASINO].level,
        config,
      );

      await this.turnsService.incrementUsedTurns(
        username,
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      const gameStateDto = plainToClass(NoelDataDto, game);

      return {
        success: true,
        message: SUCCESS_MESSAGE.GAME_STARTED,
        data: {
          noelState: gameStateDto,
        },
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async endGame(
    username: string,
    gameId: number,
    selectedPositions: SelectedNoelDto[],
  ) {
    const config = await this.noelConfigService.getNoelConfig();
    const canPlay = canPlayNoel(config);
    if (!canPlay) {
      throw new BadRequestException(
        "Game hiện đang tắt hoặc ngoài thời gian sự kiện!",
      );
    }
    const game = await this.findAndValidateGame(username, gameId);
    this.validateSelectedPositions(selectedPositions, game, config);

    const { timeDiff, isTimeout } = calculateTimeDiff(game.startTime, config);
    const { finalScore, result } = this.calculateGameResult(
      game,
      selectedPositions,
    );

    const gameResult = isTimeout ? NoelResult.TIMEOUT : result;

    this.processGameRewards(username, finalScore, config.multiple);
    this.broadcastRewardNotification(username, finalScore);
    await this.updateGameState(game, finalScore, gameResult, timeDiff, config);

    return {
      success: true,
      message: isTimeout
        ? ERROR_MESSAGE.GAME_TIME_EXPIRED
        : SUCCESS_MESSAGE.GAME_ENDED,
      data: {
        finalScore,
        result: gameResult,
      },
    };
  }

  async getHistory(
    username: string,
    fromDate?: string,
    toDate?: string,
    page?: number,
    pageSize?: number,
  ) {
    const where = getConditionHistory(username, fromDate, toDate);
    const pageCondition = page && page > 0 ? page : 1;
    const pageSizeCondition = pageSize && pageSize > 0 ? pageSize : 10;
    const skip = (pageCondition - 1) * pageSizeCondition;
    const take = pageSizeCondition;
    const [games, total] = await this.noelRepository.findAndCount({
      where,
      order: { startTime: "DESC" },
      skip,
      take,
    });

    return {
      success: true,
      data: games.map((game) => mapHistoryItem(game)),
      more: total > pageCondition * pageSizeCondition,
    };
  }

  async getConfig() {
    return this.noelConfigService.getNoelConfig();
  }

  async getTurnsLeft(username: string) {
    const config = await this.noelConfigService.getNoelConfig();
    await this.ensureTurnsInitialized(username, config);
    await this.handleActiveGameTimeout(username);
    const turns = await this.turnsService.getTurns(
      username,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
    const { totalTurns, usedTurns } = turns;
    return {
      success: true,
      totalTurns,
      turnsLeft: totalTurns - usedTurns,
    };
  }

  private async handleActiveGameTimeout(username: string) {
    const activeGame = await this.noelRepository.findOne({
      where: {
        username,
        isCompleted: false,
      },
    });
    if (activeGame) {
      const now = new Date();
      await this.noelRepository.update(activeGame.id, {
        isCompleted: true,
        score: 0,
        endTime: now,
        result: NoelResult.TIMEOUT,
      });
    }
  }

  private calculateGameResult(
    game: NoelEntity,
    selectedPositions: SelectedNoelDto[],
  ) {
    let finalScore = 0;
    let hasEndGame = false;
    let resultLost;

    for (const position of selectedPositions) {
      const positionId = Number(position.id);
      const originalPosition = game.noelPositions.find(
        (p) => Number(p.id) === positionId,
      );
      if (!originalPosition) {
        throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
      }
    }

    const selectedIds = selectedPositions
      .filter((pos) => pos.isSelected)
      .map((pos) => Number(pos.id));

    for (const id of selectedIds) {
      const originalPosition = game.noelPositions.find(
        (p) => Number(p.id) === id,
      );

      if (
        Object.values(NoelHitSymbolWithoutPoints).includes(
          originalPosition.symbolType as any,
        )
      ) {
        hasEndGame = true;
        resultLost = originalPosition.symbolType
      } else {
        finalScore += originalPosition.score || 0;
      }
    }

    return {
      finalScore: Number(finalScore.toFixed(1)),
      result: hasEndGame ? resultLost : NoelResult.WIN,
    };
  }

  private async updateGameState(
    game: NoelEntity,
    finalScore: number,
    result: NoelResult,
    timeDiff: number,
    config: IMiniGameConfig,
  ) {
    game.score = finalScore;
    game.isCompleted = true;
    game.endTime = new Date();
    game.result = result;
    game.timeLeft = Math.max(0, config.turnDuration - timeDiff);

    return this.noelRepository.save(game);
  }

  private async validateCanPlay(
    username: string,
    config: IMiniGameConfig,
  ): Promise<void> {
    const canPlay = await this.turnsService.canPlayToday(
      username,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
    if (!canPlay) {
      throw new BadRequestException(ERROR_MESSAGE.NO_TURNS_AVAILABLE);
    }
  }

  private async validateAndGetGameData(
    username: string,
    startTime: string,
    endTime: string,
  ): Promise<Record<GameType, GameUserData>> {
    const keyMD5 = this.configService.get<string>("GAME_API_SIGN");
    return getInfoUser(
      username,
      keyMD5,
      this.integrationsService.getUserGameData.bind(this.integrationsService),
      startTime,
      endTime,
    );
  }

  private async calculateTotalTurns(
    username: string,
    gameData: Record<GameType, GameUserData>,
    config: IMiniGameConfig,
    throwError = true,
  ): Promise<number> {
    const totalValidBetAmounts = extractTotalValidBetAmounts(gameData);
    const minDeposit = gameData[GameType.CASINO].totalRechargeAmount;
    const totalTurns = await this.turnsService.calculateAndSaveTurns(
      username,
      totalValidBetAmounts,
      config,
      minDeposit,
    );

    if (totalTurns <= 0 && throwError) {
      throw new BadRequestException(ERROR_MESSAGE.NO_TURNS_AVAILABLE);
    }

    return totalTurns;
  }

  private calculateGridSize(itemsCount: number): {
    width: number;
    height: number;
  } {
    const height = Math.ceil(Math.sqrt(itemsCount));
    const width = Math.ceil(itemsCount / height);
    return { width, height };
  }

  private generateNoelPositions(
    withoutPointsCount: number,
    withPointsCount: number,
    maxScore: number,
    totalSymbols: number,
  ) {
    const { width, height } = this.calculateGridSize(totalSymbols);
    const totalPositions = width * height;
    const allPositions = Array.from({ length: totalPositions }, (_, i) => ({
      id: i + 1,
    }));

    shuffleArray(allPositions);

    const positions = [];
    const minPoint = 0.1;
    let extraRemain = maxScore - minPoint * withPointsCount;
    let scores: number[] = [];
    if (extraRemain <= 0) {
      scores = Array(withPointsCount).fill(minPoint);
    } else {
      for (let i = 0; i < withPointsCount; i++) {
        const ghostsLeft = withPointsCount - i - 1;
        let extraMax = Math.max(0, extraRemain);
        let extra = 0;
        if (ghostsLeft === 0) {
          extra = extraMax;
        } else {
          const rand = Math.random();
          extra = rand * extraMax;
        }
        extra = Math.floor(extra * 10) / 10;
        if (extra > extraRemain) extra = Math.floor(extraRemain * 10) / 10;
        let score = minPoint + extra;
        score = Math.round(score * 10) / 10;
        if (Object.is(score, -0)) score = 0;
        if (score < minPoint) score = minPoint;
        scores.push(score);
        extraRemain = Math.max(0, Math.round((extraRemain - extra) * 10) / 10);
      }
    }
    shuffleArray(scores);

    let normalIdx = 0;
    const symbolsWithPoints: string[] = Object.values(NoelHitSymbolWithPoints);
    const symbolsWithoutPoints: string[] = Object.values(
      NoelHitSymbolWithoutPoints,
    );

    for (let i = 0; i < totalSymbols; i++) {
      const pos = allPositions[i];
      const isWithoutPoints = i < withoutPointsCount;
      const symbolWithPointPicker = makePicker(symbolsWithPoints);
      const symbolWithoutPointPicker = makePicker(symbolsWithoutPoints);
      positions.push({
        ...pos,
        score: isWithoutPoints ? 0 : scores[normalIdx++],
        symbolType: isWithoutPoints
          ? symbolWithoutPointPicker()
          : symbolWithPointPicker(),
      });
    }

    return positions;
  }

  private async createNewGame(
    username: string,
    level: number,
    config: IMiniGameConfig,
  ) {
    const vipConfig = getVipLevelConfig(level, config);
    const withoutPointsRate = 1 - vipConfig.ITEM_WITH_POINTS;
    const withoutPointsCount = Math.round(
      config.totalSymbols * withoutPointsRate,
    );
    const withPointsRate = vipConfig.ITEM_WITH_POINTS;
    const withPointsCount = Math.round(config.totalSymbols * withPointsRate);
    const noelPositions = this.generateNoelPositions(
      withoutPointsCount,
      withPointsCount,
      vipConfig.MAX_SCORE,
      config.totalSymbols,
    );

    const game = this.noelRepository.create({
      username,
      miniGameType: MiniGameType.NOEL,
      startTime: new Date(),
      timeLeft: config.turnDuration,
      noelPositions,
      vipLevel: level,
      totalSymbols: config.totalSymbols,
    });

    return this.noelRepository.save(game);
  }

  private async processGameRewards(
    username: string,
    score: number,
    multiple?: number,
  ) {
    await this.integrationsService.updateUserScore(
      username,
      score,
      MiniGameType.NOEL,
      multiple,
    );
  }

  private async ensureTurnsInitialized(
    username: string,
    config: IMiniGameConfig,
  ) {
    if (!canPlayNoel(config)) {
      throw new BadRequestException(
        "Game hiện đang tắt hoặc ngoài thời gian sự kiện!",
      );
    }

    const { startOfDay, endOfDay } = getRevenueTimeForThirdParty(
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );

    const gameData = await this.validateAndGetGameData(
      username,
      startOfDay,
      endOfDay,
    );
    await this.calculateTotalTurns(username, gameData, config, false);
  }

  private broadcastRewardNotification(username: string, score: number) {
    const notification: any = { username };
    if (score > 12) {
      notification.score = score;
      this.socketService.broadcastPopup(notification);
    }
  }

  private async findAndValidateGame(
    username: string,
    gameId: number,
  ): Promise<NoelEntity> {
    const game = await this.noelRepository.findOne({
      where: { id: gameId, username },
    });

    if (!game) {
      throw new BadRequestException(ERROR_MESSAGE.GAME_NOT_FOUND);
    }

    if (game.isCompleted) {
      throw new BadRequestException(ERROR_MESSAGE.GAME_ALREADY_COMPLETED);
    }

    return game;
  }

  private validateSelectedPositions(
    selectedPositions: SelectedNoelDto[],
    game: NoelEntity,
    config: IMiniGameConfig,
  ): void {
    if (!selectedPositions || !Array.isArray(selectedPositions)) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
    }

    if (selectedPositions.length === 0) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
    }

    this.validatePositionIds(selectedPositions, game, config);

    this.validateDuplicatePositions(selectedPositions);
  }

  private validatePositionIds(
    selectedPositions: SelectedNoelDto[],
    game: NoelEntity,
    config: IMiniGameConfig,
  ): void {
    for (const position of selectedPositions) {
      if (
        !position.id ||
        typeof position.id !== "number" ||
        position.id < 1 ||
        position.id > config.totalSymbols
      ) {
        throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
      }

      const positionId = Number(position.id);
      const exists = game.noelPositions.some(
        (p) => Number(p.id) === positionId,
      );

      if (!exists) {
        throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
      }
    }
  }

  private validateDuplicatePositions(
    selectedPositions: SelectedNoelDto[],
  ): void {
    const uniqueIds = new Set(selectedPositions.map((p) => p.id));
    if (uniqueIds.size !== selectedPositions.length) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_POSITION);
    }
  }
}
