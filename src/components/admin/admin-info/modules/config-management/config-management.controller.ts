import { Body, Controller, Get, Patch, UseGuards } from "@nestjs/common";
import { ConfigManagementService } from "./config-management.service";
import { UpdateTreasureHuntConfigDto } from "../../dto/update-noel-config.dto";
import { AuthGuard } from "../../../../../common/guards/auth.guard";
import { Roles, RolesGuard } from "../../../../../common/guards/roles.guard";
import { ROLE_SUPER_ADMIN } from "../../../../../common/constants/admin.constant";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Config Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class ConfigManagementController {
  constructor(
    private readonly configManagementService: ConfigManagementService,
  ) {}

  @Roles(ROLE_SUPER_ADMIN)
  @Get("noel-config")
  async getNoelConfig() {
    return this.configManagementService.adminGetNoelConfig();
  }

  @Roles(ROLE_SUPER_ADMIN)
  @Patch("noel-config/bulk")
  async updateNoelConfigBulk(@Body() body: UpdateTreasureHuntConfigDto) {
    return this.configManagementService.adminUpdateNoelConfig(body.config);
  }
}
