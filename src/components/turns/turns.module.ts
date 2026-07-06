import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { TurnsRepository } from "./turns.repository";
import { TurnsService } from "./turns.service";
import { TurnsHistoryEntity } from "./entities/turns-history.entity";
import { TurnsEntity } from "./entities/turns.entity";

@Module({
  imports: [TypeOrmModule.forFeature([TurnsEntity, TurnsHistoryEntity])],
  providers: [TurnsService, TurnsRepository],
  exports: [TurnsService, TurnsRepository],
})
export class TurnsModule {}
