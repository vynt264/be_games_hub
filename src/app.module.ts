import "dotenv-flow/config";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { HttpModule } from "@nestjs/axios";
import { AuthModule } from "./components/auth/auth.module";
import { BlacklistModule } from "./components/blacklist/blacklist.module";
import { APP_GUARD } from "@nestjs/core";
import { AuthGuard } from "./common/guards/auth.guard";
import { IntegrationsModule } from "./components/integrations/integrations.module";
import { AdminInfoModule } from "./components/admin/admin-info/admin-info.module";
import { AdminAuthModule } from "./components/admin/admin-auth/admin-auth.module";
import { CustomJwtModule } from "./components/jwt/jwt.module";
import { DatabaseModule } from "./common/database/database.module";
import { SocketModule } from "./components/socket/socket.module";
import { SchedulerModule } from "./components/scheduler/scheduler.module";
import { NoelModule } from "./components/noel/noel.module";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    HttpModule,
    CustomJwtModule,
    AuthModule,
    BlacklistModule,
    NoelModule,
    IntegrationsModule,
    AdminAuthModule,
    AdminInfoModule,
    SocketModule,
    SchedulerModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
