import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { IntegrationsService } from "./integrations.service";
import { ErrorLogModule } from "../../common/services/error-log.module";

@Module({
  imports: [HttpModule, ErrorLogModule],
  providers: [IntegrationsService],
  exports: [IntegrationsService],
})
export class IntegrationsModule {}
