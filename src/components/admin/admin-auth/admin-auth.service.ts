import { Injectable, BadRequestException, OnModuleInit } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, MoreThan } from "typeorm";
import { AdminAuthEntity } from "./admin-auth.entity";
import { TokenService } from "../../jwt/jwt.service";
import {
  ADMIN_STATUS,
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
} from "../../../common/constants/admin.constant";
import {
  ADMIN_ERROR_MESSAGE,
  ERROR_MESSAGE,
} from "../../../common/constants/message.constant";
import { UserInfoEntity } from "../../auth/entities/user-info.entity";
import { BlacklistEntity } from "../../../components/blacklist/blacklist.entity";
import {
  comparePassword,
  hashPassword,
} from "../../../common/helpers/password.helper";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AdminAuthService implements OnModuleInit {
  private readonly username: string;
  private readonly password: string;

  constructor(
    @InjectRepository(AdminAuthEntity)
    private readonly repo: Repository<AdminAuthEntity>,
    private readonly tokenService: TokenService,
    @InjectRepository(UserInfoEntity)
    private readonly userRepo: Repository<UserInfoEntity>,
    @InjectRepository(BlacklistEntity)
    private readonly blacklistRepo: Repository<BlacklistEntity>,
    private readonly configService: ConfigService,
  ) {
    this.username =
      this.configService.get<string>("SUPER_ADMIN_USERNAME") || "superadmin";
    this.password =
      this.configService.get<string>("SUPER_ADMIN_PASSWORD") || "Admin@123";
  }

  async onModuleInit() {
    const superAdmin = await this.repo.findOne({
      where: { username: this.username },
    });
    if (!superAdmin) {
      const rawPassword = this.password;
      const password = await hashPassword(rawPassword);
      await this.repo.save(
        this.repo.create({
          username: this.username,
          password,
          role: ROLE_SUPER_ADMIN,
        }),
      );
    }
  }

  async register(
    username: string,
    password: string,
    isAdminFull = false,
    updatedBy?: string,
  ) {
    const isExist = await this.repo.exists({ where: { username } });
    if (isExist) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.USERNAME_EXISTS);
    }

    const newUser = this.repo.create({
      username,
      password: await hashPassword(password),
      role: isAdminFull ? ROLE_SUPER_ADMIN : ROLE_ADMIN,
      updatedBy,
    });

    const { id, role, status, createdAt, updatedAt } =
      await this.repo.save(newUser);

    return { id, username, role, status, createdAt, updatedAt, updatedBy };
  }

  async login(username: string, password: string) {
    const user = await this.repo.findOne({ where: { username } });
    if (!user) throw new BadRequestException(ADMIN_ERROR_MESSAGE.LOGIN_FAILED);

    if (user.status === ADMIN_STATUS.INACTIVE) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.ACCOUNT_LOCKED);
    }

    const match = await comparePassword(password, user.password);
    if (!match) throw new BadRequestException(ADMIN_ERROR_MESSAGE.LOGIN_FAILED);

    const tokens = await this.tokenService.generateTokens(username, user.role);
    return {
      username: user.username,
      role: user.role,
      token: tokens.token,
      refreshToken: tokens.refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = await this.tokenService.verifyRefreshToken(refreshToken);
      const user = await this.findAdminOrThrow(payload.username);

      if (user.status === ADMIN_STATUS.INACTIVE) {
        throw new BadRequestException(ADMIN_ERROR_MESSAGE.ACCOUNT_LOCKED);
      }

      const tokens = await this.tokenService.generateTokens(
        user.username,
        user.role,
      );

      return {
        username: user.username,
        role: user.role,
        token: tokens.token,
        refreshToken: tokens.refreshToken,
      };
    } catch (error) {
      throw new BadRequestException(ERROR_MESSAGE.INVALID_REFRESH_TOKEN, error);
    }
  }

  async lockAccount(username: string, updatedBy: string) {
    const user = await this.findAdminOrThrow(username);
    return this.setStatus(this.repo, user, ADMIN_STATUS.INACTIVE, updatedBy);
  }

  async lockUserAccount(username: string, updatedBy: string) {
    const user = await this.findUserOrThrow(username);
    await this.setStatus(this.userRepo, user, ADMIN_STATUS.INACTIVE, updatedBy);
    await this.expireActiveBlacklistTokens(username);

    return { success: true };
  }

  async unlockAccount(username: string, updatedBy: string) {
    const user = await this.findAdminOrThrow(username);
    return this.setStatus(this.repo, user, ADMIN_STATUS.ACTIVE, updatedBy);
  }

  async unlockUserAccount(username: string, updatedBy: string) {
    const user = await this.findUserOrThrow(username);
    return this.setStatus(this.userRepo, user, ADMIN_STATUS.ACTIVE, updatedBy);
  }

  private async findAdminOrThrow(username: string): Promise<AdminAuthEntity> {
    const user = await this.repo.findOne({ where: { username } });
    if (!user)
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.ADMIN_NOT_FOUND);
    return user;
  }

  private async findUserOrThrow(username: string): Promise<UserInfoEntity> {
    const user = await this.userRepo.findOne({ where: { username } });
    if (!user)
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.USER_NOT_FOUND);
    return user;
  }

  private async setStatus<
    T extends { status: ADMIN_STATUS; updatedBy?: string },
  >(repo: Repository<T>, entity: T, status: ADMIN_STATUS, updatedBy: string) {
    if (entity.status === status) return { success: true } as const;
    entity.status = status;
    entity.updatedBy = updatedBy;
    await repo.save(entity);
    return { success: true } as const;
  }

  private async expireActiveBlacklistTokens(username: string): Promise<void> {
    const now = new Date();
    await this.blacklistRepo.update(
      { username, expiresAt: MoreThan(now) },
      { expiresAt: now },
    );
  }
}
