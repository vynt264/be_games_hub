import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { BlacklistModule } from "../blacklist/blacklist.module";
import { UserInfoEntity } from "./entities/user-info.entity";
import { CustomJwtModule } from "../jwt/jwt.module";
import { NoelConfigModule } from "../admin/mini-game-config/noel/noel-config.module";
import { IntegrationsModule } from "../integrations/integrations.module";
import { TurnsModule } from "../turns/turns.module";

@Module({
  imports: [
    HttpModule,
    CustomJwtModule,
    BlacklistModule,
    TypeOrmModule.forFeature([UserInfoEntity]),
    NoelConfigModule,
    IntegrationsModule,
    TurnsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
