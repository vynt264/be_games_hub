import { Injectable, Logger } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NoelFakeUserNotificationEntity } from "../admin/admin-info/entities/noel-fake-user-notification.entity";
import { SocketService } from "../socket/socket.service";
import { NoelConfigService } from "../admin/mini-game-config/noel/noel-config.service";

@Injectable()
export class PopupBroadcastService {
  private readonly logger = new Logger(PopupBroadcastService.name);

  constructor(
    @InjectRepository(NoelFakeUserNotificationEntity)
    private readonly popupRepo: Repository<NoelFakeUserNotificationEntity>,
    private readonly cfg: NoelConfigService,
    private readonly socketService: SocketService,
  ) {
  }


  @Cron("*/15 * * * * *", { name: "popup_broadcast_cron" })
  async maybeBroadcastPopup() {
    try {
      const config = await this.cfg.getNoelConfig();
      if (!config || !config.eventEnd) return;

      const now = new Date();
      if (config.eventStart && new Date(config.eventStart) > now) return;
      if (config.eventEnd && new Date(config.eventEnd) < now) return;

      if (Math.random() > 0.7) return;

      const list = await this.popupRepo.find({});
      if (!list.length) return;

      const pick = list[Math.floor(Math.random() * list.length)];

      const payload: any = { username: pick.username };

      const min = config.vipLevels.VIP_6_11.MAX_SCORE;
      const max = config.vipLevels.VIP_16_20.MAX_SCORE;
      payload.score = Number((Math.random() * (max - min) + min).toFixed(1));

      this.socketService.broadcastPopup(payload);
      this.logger.debug(
        `Broadcast popup for fake user: ${pick.username} at ${new Date().toISOString()}`,
      );
    } catch (err) {
      this.logger.error("maybeBroadcastPopup error", err as any);
    }
  }
}
