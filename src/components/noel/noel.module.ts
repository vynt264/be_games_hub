import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoelController } from "./noel.controller";
import { NoelService } from "./noel.service";
import { NoelEntity } from "./noel.entity";
import { AuthModule } from "../auth/auth.module";
import { TurnsModule } from "../turns/turns.module";
import { NoelConfigModule } from "../admin/mini-game-config/noel/noel-config.module";
import { RolesGuard } from "src/common/guards/roles.guard";
import { CustomJwtModule } from "../jwt/jwt.module";
import { ConfigModule } from "@nestjs/config";
import { IntegrationsModule } from "../integrations/integrations.module";
import { BlacklistModule } from "../blacklist/blacklist.module";
import { SocketModule } from "../socket/socket.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([NoelEntity]),
    AuthModule,
    TurnsModule,
    NoelConfigModule,
    CustomJwtModule,
    ConfigModule,
    IntegrationsModule,
    BlacklistModule,
    SocketModule,
  ],
  controllers: [NoelController],
  providers: [NoelService, RolesGuard],
  exports: [NoelService],
})
export class NoelModule {}
