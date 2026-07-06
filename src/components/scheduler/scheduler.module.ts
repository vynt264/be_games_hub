import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { TypeOrmModule } from "@nestjs/typeorm";
import { PopupBroadcastService } from "./popup-broadcast.service";
import { NoelFakeUserNotificationEntity } from "../admin/admin-info/entities/noel-fake-user-notification.entity";
import { NoelConfigModule } from "../admin/mini-game-config/noel/noel-config.module";
import { SocketModule } from "../socket/socket.module";

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([NoelFakeUserNotificationEntity]),
    NoelConfigModule,
    SocketModule,
  ],
  providers: [PopupBroadcastService],
})
export class SchedulerModule {}
