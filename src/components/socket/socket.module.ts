import { Module } from "@nestjs/common";
import { SocketService } from "./socket.service";
import { BlacklistModule } from "../blacklist/blacklist.module";

@Module({
  imports: [BlacklistModule],
  providers: [SocketService],
  exports: [SocketModule, SocketService],
})
export class SocketModule {}
