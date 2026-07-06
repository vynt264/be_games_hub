import { Injectable } from "@nestjs/common";
import { Repository, MoreThan, Not } from "typeorm";
import { BlacklistEntity } from "./blacklist.entity";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";

@Injectable()
export class BlacklistRepository {
  constructor(
    @InjectRepository(BlacklistEntity)
    private readonly repository: Repository<BlacklistEntity>,
    private readonly configService: ConfigService,
  ) {}

  async isTokenValid(token: string): Promise<any> {
    const now = new Date();
    const blacklistedToken = await this.repository.findOne({
      where: {
        acToken: token,
      },
    });
    if (!blacklistedToken) {
      return {
        notExists: true,
      };
    }

    return {
      expired: blacklistedToken.expiresAt.getTime() <= now.getTime(),
    };
  }

  async hasActiveSession(username: string, deviceId: string): Promise<boolean> {
    const now = new Date();
    const activeSession = await this.repository.findOne({
      where: {
        username,
        deviceId: Not(deviceId),
        expiresAt: MoreThan(now),
      },
    });
    return !!activeSession;
  }

  async blacklistToken(
    username: string,
    token: string,
    deviceId: string,
  ): Promise<void> {
    const now = new Date();
    const expiresAt = new Date();
    expiresAt.setMinutes(
      expiresAt.getMinutes() +
        Number(this.configService.get("BLACKLIST_EXPIRATION") || 30),
    );

    const existingRecord = await this.repository.findOne({
      where: {
        username,
        deviceId,
        expiresAt: MoreThan(now),
      },
    });

    if (existingRecord) {
      await this.repository.update(existingRecord.id, {
        acToken: token,
        expiresAt,
      });
    } else {
      await this.repository.save({
        username,
        acToken: token,
        deviceId,
        expiresAt,
      });
    }
  }

  async deleteUserTokens(username: string): Promise<number | undefined> {
    const result = await this.repository.delete({
      username,
    });
    return result.affected;
  }

  async findToken(token: string) {
    return this.repository.findOne({
      where: {
        acToken: token,
      },
    });
  }
}
