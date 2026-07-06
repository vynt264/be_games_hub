import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { BlacklistService } from "../blacklist/blacklist.service";
import { JwtPayload } from "./jwt.interface";
import { ROLE_USER } from "src/common/constants/admin.constant";

@Injectable()
export class TokenService {
  private readonly jwtSecret: string;
  private readonly tokenExpiry: string;
  private readonly refreshTokenExpiry: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly blacklistService: BlacklistService,
  ) {
    this.jwtSecret = this.configService.get<string>("JWT_SECRET");
    this.tokenExpiry =
      this.configService.get<string>("TOKEN_EXPIRATION") || "30m";
    this.refreshTokenExpiry =
      this.configService.get<string>("REFRESH_TOKEN_EXPIRATION") || "7d";
  }

  async generateTokens(
    username: string,
    role: string,
    deviceId?: string,
  ): Promise<{ token: string; refreshToken: string }> {
    const payload: JwtPayload = { username, role };
    if (deviceId) payload.deviceId = deviceId;
    const [token, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn: this.tokenExpiry }),
      this.jwtService.signAsync(payload, {
        expiresIn: this.refreshTokenExpiry,
      }),
    ]);

    return { token, refreshToken };
  }

  async verifyToken(
    token: string,
  ): Promise<JwtPayload | null | { notExists: true }> {
    const secret = this.configService.get<string>("JWT_SECRET");
    const jwtPayload = await this.jwtService.verifyAsync<JwtPayload>(token, {
      secret,
    });

    if (jwtPayload?.role === ROLE_USER) {
      const { notExists, expired } =
        await this.blacklistService.isTokenValid(token);
      if (notExists) return { notExists: true };
      if (expired) return null;
    }

    return jwtPayload;
  }

  async verifyRefreshToken(refreshToken: string): Promise<JwtPayload> {
    return this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
      secret: this.jwtSecret,
    });
  }

  async blacklistToken(
    username: string,
    token: string,
    deviceId?: string,
  ): Promise<void> {
    await this.blacklistService.blacklistToken(username, token, deviceId);
  }
}
