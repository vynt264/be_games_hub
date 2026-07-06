import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, Between } from "typeorm";
import { TurnsEntity } from "./entities/turns.entity";
import { TYPE_EVENT } from "../admin/mini-game-config/constants/terms.constant";
import { getRevenueTime } from "src/common/helpers/get-revenue-time.helper";

@Injectable()
export class TurnsRepository {
  constructor(
    @InjectRepository(TurnsEntity)
    private readonly turnsRepository: Repository<TurnsEntity>,
  ) {}

  async getTurns(
    username: string,
    eventStart: string,
    eventEnd: string,
    typeEvent: TYPE_EVENT,
  ): Promise<TurnsEntity | null> {
    const { startOfDay, endOfDay } = getRevenueTime(
      eventStart,
      eventEnd,
      typeEvent,
    );
    return this.turnsRepository.findOne({
      where: {
        username,
        createdAt: Between(new Date(startOfDay), new Date(endOfDay)),
      },
    });
  }

  async saveTurns(
    username: string,
    turns: Partial<TurnsEntity>,
    eventStart: string,
    eventEnd: string,
    typeEvent: TYPE_EVENT,
  ): Promise<TurnsEntity> {
    const existingTurns = await this.getTurns(
      username,
      eventStart,
      eventEnd,
      typeEvent,
    );

    if (existingTurns) {
      Object.assign(existingTurns, turns);
      return this.turnsRepository.save(existingTurns);
    }

    const newTurns = this.turnsRepository.create({
      username,
      ...turns,
    });

    return this.turnsRepository.save(newTurns);
  }

  createEmptyTurns(username: string): TurnsEntity {
    const turns = this.turnsRepository.create({
      username,
      totalTurns: 0,
      usedTurns: 0,
      banCaLastBet: 0,
      slotLastBet: 0,
      casinoLastBet: 0,
      gameVietLastBet: 0,
      theThaoLastBet: 0,
    });
    return turns;
  }
}
