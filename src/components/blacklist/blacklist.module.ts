import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BlacklistEntity } from "./blacklist.entity";
import { BlacklistService } from "./blacklist.service";
import { BlacklistRepository } from "./blacklist.repository";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [TypeOrmModule.forFeature([BlacklistEntity]), ConfigModule],
  providers: [BlacklistService, BlacklistRepository],
  exports: [BlacklistService],
})
export class BlacklistModule {}
