import { Injectable, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MiniGameConfigEntity } from "../mini-game-config.entity";
import {
  GameType,
  MiniGameType,
} from "src/components/integrations/integrations.constant";
import { addDays, format } from "date-fns";
import {
  DEFAULT_TERMS_1_NOEL,
  DEFAULT_TERMS_2_NOEL,
  DEFAULT_RULES_NOEL,
  TYPE_EVENT,
} from "../constants/terms.constant";

@Injectable()
export class NoelConfigService implements OnModuleInit {
  constructor(
    @InjectRepository(MiniGameConfigEntity)
    private readonly repo: Repository<MiniGameConfigEntity>,
  ) { }

  async onModuleInit() {
    await this.initDefaultConfig();
  }

  async initDefaultConfig() {
    let config = await this.repo.findOne({
      where: { typeGame: MiniGameType.NOEL },
    });
    const defaultConfig = {
      vipLevels: {
        VIP_0_5: {
          MAX_SCORE: 18,
          MIN_SCORE: 0.1,
          ITEM_WITH_POINTS: 0.4,
        },
        VIP_6_11: {
          MAX_SCORE: 28,
          MIN_SCORE: 0.1,
          ITEM_WITH_POINTS: 0.4,
        },
        VIP_12_15: {
          MAX_SCORE: 33,
          MIN_SCORE: 0.5,
          ITEM_WITH_POINTS: 0.4,
        },
        VIP_16_20: {
          MAX_SCORE: 38,
          MIN_SCORE: 1,
          ITEM_WITH_POINTS: 0.4,
        },
      },
      dtcRequirements: {
        [GameType.BAN_CA]: 6000,
        [GameType.SLOT]: 6000,
        [GameType.CASINO]: 6000,
        [GameType.GAME_VIET]: 10000,
        [GameType.THE_THAO]: 3000,
      },
      typeGame: MiniGameType.NOEL,
      multiple: 5,
      eventStart: format(new Date(), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      eventEnd: format(addDays(new Date(), 30), "yyyy-MM-dd'T'HH:mm:ss.SSSXXX"),
      isGameEnabled: false,
      term1: DEFAULT_TERMS_1_NOEL,
      term2: DEFAULT_TERMS_2_NOEL,
      rules: DEFAULT_RULES_NOEL,
      minDeposit: 500,
      eventType: TYPE_EVENT.EVENT_TURN,
      maxTurns: 10,
      turnDuration: 45,
      totalSymbols: 30,
      carSpeed: 5,
      roadSpeed: 3,
      fallSpeed: 2,
    };

    if (!config) {
      config = this.repo.create(defaultConfig);
      await this.repo.save(config);
    } else {
      let updated = false;
      for (const key of Object.keys(defaultConfig)) {
        if (config[key] === undefined || config[key] === null) {
          config[key] = defaultConfig[key];
          updated = true;
        }
      }
      if (updated) {
        await this.repo.save(config);
      }
    }
  }

  async getNoelConfig(): Promise<MiniGameConfigEntity> {
    return this.repo.findOne({
      where: { typeGame: MiniGameType.NOEL },
      select: {
        vipLevels: true,
        dtcRequirements: true,
        multiple: true,
        eventStart: true,
        eventEnd: true,
        isGameEnabled: true,
        minDeposit: true,
        eventType: true,
        maxTurns: true,
        turnDuration: true,
        totalSymbols: true,
        fallSpeed: true,
        term1: true,
        term2: true,
        rules: true,
        carSpeed: true,
        roadSpeed: true,
      },
    });
  }

  async getNoelConfigForUser(): Promise<MiniGameConfigEntity> {
    return this.repo.findOne({
      where: { typeGame: MiniGameType.NOEL },
      select: {
        multiple: true,
        eventStart: true,
        eventEnd: true,
        isGameEnabled: true,
        term1: true,
        term2: true,
        rules: true,
        dtcRequirements: true,
        maxTurns: true,
        minDeposit: true,
        turnDuration: true,
        totalSymbols: true,
        fallSpeed: true,
        carSpeed: true,
        roadSpeed: true,
      },
    });
  }
}
