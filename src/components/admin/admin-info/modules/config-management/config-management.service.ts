import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MiniGameConfigEntity } from "../../../mini-game-config/mini-game-config.entity";
import { MiniGameType } from "../../../../integrations/integrations.constant";
import { ERROR_MESSAGE } from "../../../../../common/constants/message.constant";

@Injectable()
export class ConfigManagementService {
  constructor(
    @InjectRepository(MiniGameConfigEntity)
    private readonly miniGameConfigRepo: Repository<MiniGameConfigEntity>,
  ) {}

  async adminGetNoelConfig() {
    const config = await this.miniGameConfigRepo
      .createQueryBuilder("config")
      .where("config.typeGame = :typeGame", {
        typeGame: MiniGameType.NOEL,
      })
      .getOne();
    if (!config) return null;
    return config;
  }

  async adminUpdateNoelConfig(configUpdates: Record<string, unknown>) {
    const config = await this.miniGameConfigRepo
      .createQueryBuilder("config")
      .where("config.typeGame = :typeGame", {
        typeGame: MiniGameType.NOEL,
      })
      .getOne();
    if (!config) throw new NotFoundException(ERROR_MESSAGE.CONFIG_NOT_FOUND);

    const invalidKeys = [];
    const validUpdates: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(configUpdates)) {
      if (!(key in config)) {
        invalidKeys.push(key);
      } else {
        validUpdates[key] = value;
      }
    }

    if (invalidKeys.length > 0) {
      throw new BadRequestException(
        `Các trường không hợp lệ: ${invalidKeys.join(", ")}`,
      );
    }

    await this.miniGameConfigRepo
      .createQueryBuilder()
      .update(MiniGameConfigEntity)
      .set(validUpdates)
      .where("id = :id", { id: config.id })
      .execute();

    return {
      success: true,
      message: "Cập nhật cấu hình thành công",
      updatedKeys: Object.keys(configUpdates),
    };
  }
}
