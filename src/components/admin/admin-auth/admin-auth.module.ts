import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminAuthEntity } from "./admin-auth.entity";
import { AdminAuthService } from "./admin-auth.service";
import { AdminAuthController } from "./admin-auth.controller";
import { RolesGuard } from "../../../common/guards/roles.guard";
import { UserInfoEntity } from "../../auth/entities/user-info.entity";
import { BlacklistEntity } from "../../blacklist/blacklist.entity";
import { CustomJwtModule } from "../../jwt/jwt.module";
import { BlacklistModule } from "src/components/blacklist/blacklist.module";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AdminAuthEntity,
      UserInfoEntity,
      BlacklistEntity,
    ]),
    CustomJwtModule,
    BlacklistModule,
  ],
  providers: [AdminAuthService, RolesGuard],
  controllers: [AdminAuthController],
  exports: [AdminAuthService],
})
export class AdminAuthModule {}
