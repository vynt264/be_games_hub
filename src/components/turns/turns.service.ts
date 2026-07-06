import { Injectable } from "@nestjs/common";
import { TurnsRepository } from "./turns.repository";
import { GameType } from "../integrations/integrations.constant";
import { IMiniGameConfig } from "../admin/mini-game-config/mini-game-config.interface";
import { InjectRepository } from "@nestjs/typeorm";
import { TurnsHistoryEntity } from "./entities/turns-history.entity";
import { Repository } from "typeorm";
import { TYPE_EVENT } from "../admin/mini-game-config/constants/terms.constant";
import { TurnsEntity } from "./entities/turns.entity";

@Injectable()
export class TurnsService {
  constructor(
    private readonly turnsRepository: TurnsRepository,
    @InjectRepository(TurnsHistoryEntity)
    private readonly turnsHistoryRepo: Repository<TurnsHistoryEntity>,
  ) {}

  async getTurns(
    username: string,
    eventStart: string,
    eventEnd: string,
    eventType: TYPE_EVENT,
  ): Promise<TurnsEntity | null> {
    return this.turnsRepository.getTurns(
      username,
      eventStart,
      eventEnd,
      eventType,
    );
  }

  async canPlayToday(
    username: string,
    eventStart: string,
    eventEnd: string,
    eventType: TYPE_EVENT,
  ): Promise<boolean> {
    const turns = await this.turnsRepository.getTurns(
      username,
      eventStart,
      eventEnd,
      eventType,
    );
    if (!turns) {
      return true;
    }
    return turns.usedTurns < turns.totalTurns;
  }

  async incrementUsedTurns(
    username: string,
    eventStart: string,
    eventEnd: string,
    eventType: TYPE_EVENT,
  ): Promise<number> {
    const turns = await this.turnsRepository.getTurns(
      username,
      eventStart,
      eventEnd,
      eventType,
    );
    if (!turns) {
      throw new Error("Không tìm thấy lượt chơi");
    }
    turns.usedTurns += 1;
    await this.turnsRepository.saveTurns(
      username,
      turns,
      eventStart,
      eventEnd,
      eventType,
    );
    return turns.usedTurns;
  }

  async calculateAndSaveTurns(
    username: string,
    totalValidBetAmounts: Record<GameType, number>,
    config: IMiniGameConfig,
    minDeposit: number,
  ): Promise<number> {
    let turns = await this.turnsRepository.getTurns(
      username,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
    if (!turns) turns = this.turnsRepository.createEmptyTurns(username);

    if (minDeposit < config.minDeposit) {
      await this.turnsRepository.saveTurns(
        username,
        turns,
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      return turns.totalTurns;
    }

    if (
      config.eventType === TYPE_EVENT.DAILY_TURN &&
      turns.totalTurns >= config.maxTurns
    ) {
      turns.dtcBanCa = totalValidBetAmounts[GameType.BAN_CA] || 0;
      turns.dtcSlots = totalValidBetAmounts[GameType.SLOT] || 0;
      turns.dtcCasino = totalValidBetAmounts[GameType.CASINO] || 0;
      turns.dtcGameViet = totalValidBetAmounts[GameType.GAME_VIET] || 0;
      turns.dtcTheThao = totalValidBetAmounts[GameType.THE_THAO] || 0;
      turns.isCompleted = true;
      await this.turnsRepository.saveTurns(
        username,
        turns,
        config.eventStart,
        config.eventEnd,
        config.eventType,
      );
      return turns.totalTurns;
    }

    const addTurns = this.accumulateTurnsForGames(
      turns,
      totalValidBetAmounts,
      config,
    );
    this.assignDtcFields(turns, totalValidBetAmounts);
    turns.minDeposit = minDeposit;
    turns.totalTurns = turns.totalTurns + addTurns;
    turns.isCompleted = true;
    await this.turnsRepository.saveTurns(
      username,
      turns,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
    if (addTurns !== 0) {
      await this.turnsHistoryRepo.save({
        username,
        updatedTurns: addTurns,
        updatedBy: "system",
      });
    }

    return turns.totalTurns;
  }

  async configureLoginTurns(
    username: string,
    config: IMiniGameConfig,
    totalTurns = 200,
  ): Promise<TurnsEntity> {
    let turns = await this.turnsRepository.getTurns(
      username,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
    if (!turns) turns = this.turnsRepository.createEmptyTurns(username);

    turns.totalTurns = totalTurns;
    turns.usedTurns = 0;
    turns.isCompleted = true;

    return this.turnsRepository.saveTurns(
      username,
      turns,
      config.eventStart,
      config.eventEnd,
      config.eventType,
    );
  }

  private calculateNewTurnsForGame(
    currentBet: number,
    lastBet: number,
    requirement: number,
  ): { newTurns: number; newLastBet: number } {
    const betIncrease = Math.max(0, currentBet - lastBet);
    const newTurns = Math.floor(betIncrease / requirement);
    const newLastBet = Number(lastBet) + newTurns * requirement;
    return { newTurns, newLastBet };
  }

  private updateLastBetField(
    turns: TurnsEntity,
    gameType: GameType,
    newLastBet: number,
  ) {
    switch (gameType) {
      case GameType.BAN_CA:
        turns.banCaLastBet = newLastBet;
        break;
      case GameType.SLOT:
        turns.slotLastBet = newLastBet;
        break;
      case GameType.CASINO:
        turns.casinoLastBet = newLastBet;
        break;
      case GameType.GAME_VIET:
        turns.gameVietLastBet = newLastBet;
        break;
      case GameType.THE_THAO:
        turns.theThaoLastBet = newLastBet;
        break;
    }
  }

  private getLastBetField(turns: TurnsEntity, gameType: GameType): number {
    switch (gameType) {
      case GameType.BAN_CA:
        return turns.banCaLastBet || 0;
      case GameType.SLOT:
        return turns.slotLastBet || 0;
      case GameType.CASINO:
        return turns.casinoLastBet || 0;
      case GameType.GAME_VIET:
        return turns.gameVietLastBet || 0;
      case GameType.THE_THAO:
        return turns.theThaoLastBet || 0;
      default:
        return 0;
    }
  }

  private accumulateTurnsForGames(
    turns: TurnsEntity,
    totalValidBetAmounts: Record<GameType, number>,
    config: IMiniGameConfig,
  ): number {
    const turnsLeft = config.maxTurns - turns.totalTurns;
    let addTurns = 0;
    const gameTypes = Object.values(GameType).filter(
      (v) => typeof v === "number",
    ) as GameType[];

    for (const gameType of gameTypes) {
      const currentBet = totalValidBetAmounts[gameType] || 0;
      const lastBet = this.getLastBetField(turns, gameType);
      const requirement = config.dtcRequirements[gameType];
      const { newTurns } = this.calculateNewTurnsForGame(
        currentBet,
        lastBet,
        requirement,
      );
      if (newTurns > 0) {
        let updatedLastBet: number;
        if (config.eventType === TYPE_EVENT.DAILY_TURN) {
          const turnsToAdd = Math.min(newTurns, turnsLeft - addTurns);
          addTurns += turnsToAdd;
          updatedLastBet =
            Number(lastBet) + Number(turnsToAdd) * Number(requirement);
        } else {
          addTurns += newTurns;
          updatedLastBet =
            Number(lastBet) + Number(newTurns) * Number(requirement);
        }
        this.updateLastBetField(turns, gameType, updatedLastBet);
      }

      if (config.eventType === TYPE_EVENT.DAILY_TURN && newTurns >= turnsLeft)
        break;
    }
    return addTurns;
  }

  private assignDtcFields(
    turns: TurnsEntity,
    totals: Record<GameType, number>,
  ): void {
    turns.dtcBanCa = totals[GameType.BAN_CA] || 0;
    turns.dtcSlots = totals[GameType.SLOT] || 0;
    turns.dtcCasino = totals[GameType.CASINO] || 0;
    turns.dtcGameViet = totals[GameType.GAME_VIET] || 0;
    turns.dtcTheThao = totals[GameType.THE_THAO] || 0;
  }
}
