import { Injectable } from "@nestjs/common";
import { BlacklistRepository } from "./blacklist.repository";

@Injectable()
export class BlacklistService {
  constructor(private readonly blacklistRepository: BlacklistRepository) {}

  async isTokenValid(token: string): Promise<any> {
    return this.blacklistRepository.isTokenValid(token);
  }

  async blacklistToken(
    username: string,
    token: string,
    deviceId: string,
  ): Promise<void> {
    await this.blacklistRepository.blacklistToken(username, token, deviceId);
  }

  async findToken(token: string) {
    return this.blacklistRepository.findToken(token);
  }

  async hasActiveSession(username: string, deviceId: string): Promise<boolean> {
    return this.blacklistRepository.hasActiveSession(username, deviceId);
  }

  async deleteUserTokens(username: string): Promise<number | undefined> {
    return this.blacklistRepository.deleteUserTokens(username);
  }
}
