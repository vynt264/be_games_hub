import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminAuthEntity } from "../admin-auth/admin-auth.entity";
import { UserInfoEntity } from "../../auth/entities/user-info.entity";
import { MiniGameConfigEntity } from "../mini-game-config/mini-game-config.entity";
import { TurnsEntity } from "../../turns/entities/turns.entity";
import { TurnsHistoryEntity } from "../../turns/entities/turns-history.entity";
import { NoelEntity } from "../../noel/noel.entity";
import { NoelFakeUserNotificationEntity } from "./entities/noel-fake-user-notification.entity";
import { AdminManagementService } from "./modules/admin-management/admin-management.service";
import { UserManagementService } from "./modules/user-management/user-management.service";
import { ConfigManagementService } from "./modules/config-management/config-management.service";
import { TurnsManagementService } from "./modules/turns-management/turns-management.service";
import { NoelManagementService } from "./modules/noel-management/noel-management.service";
import { ExchangeManagementService } from "./modules/exchange-management/exchange-management.service";
import { FakeUserNotificationManagementService } from "./modules/fake-user-notification-management/fake-user-notification-management.service";
import { AdminManagementController } from "./modules/admin-management/admin-management.controller";
import { UserManagementController } from "./modules/user-management/user-management.controller";
import { ConfigManagementController } from "./modules/config-management/config-management.controller";
import { TurnsManagementController } from "./modules/turns-management/turns-management.controller";
import { NoelManagementController } from "./modules/noel-management/noel-management.controller";
import { ExchangeManagementController } from "./modules/exchange-management/exchange-management.controller";
import { FakeUserPopupManagementController } from "./modules/fake-user-notification-management/fake-user-notification-management.controller";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { CustomJwtModule } from "../../jwt/jwt.module";
import { NoelConfigModule } from "../mini-game-config/noel/noel-config.module";
import { BlacklistModule } from "../../blacklist/blacklist.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAuthEntity,
      UserInfoEntity,
      MiniGameConfigEntity,
      TurnsEntity,
      TurnsHistoryEntity,
      NoelEntity,
      NoelFakeUserNotificationEntity,
    ]),
    CustomJwtModule,
    NoelConfigModule,
    BlacklistModule,
  ],
  providers: [
    AdminManagementService,
    UserManagementService,
    ConfigManagementService,
    TurnsManagementService,
    NoelManagementService,
    ExchangeManagementService,
    FakeUserNotificationManagementService,
    RolesGuard,
  ],
  controllers: [
    AdminManagementController,
    UserManagementController,
    ConfigManagementController,
    TurnsManagementController,
    NoelManagementController,
    ExchangeManagementController,
    FakeUserPopupManagementController,
  ],
  exports: [
    AdminManagementService,
    UserManagementService,
    ConfigManagementService,
    TurnsManagementService,
    NoelManagementService,
    ExchangeManagementService,
    FakeUserNotificationManagementService,
  ],
})
export class AdminInfoModule {}
