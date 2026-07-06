import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NoelConfigService } from "./noel-config.service";
import { MiniGameConfigEntity } from "../mini-game-config.entity";

@Module({
  imports: [TypeOrmModule.forFeature([MiniGameConfigEntity])],
  providers: [NoelConfigService],
  exports: [NoelConfigService],
})
export class NoelConfigModule {}
