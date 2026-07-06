import { Controller, Get, Query, UseGuards } from "@nestjs/common";
import { AdminManagementService } from "./admin-management.service";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { AuthGuard } from "../../../../../common/guards/auth.guard";
import { Roles, RolesGuard } from "../../../../../common/guards/roles.guard";
import { ROLE_SUPER_ADMIN } from "../../../../../common/constants/admin.constant";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";

@ApiTags("Admin Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class AdminManagementController {
  constructor(
    private readonly adminManagementService: AdminManagementService,
  ) {}

  @Roles(ROLE_SUPER_ADMIN)
  @Get("list")
  async getAdminList(@Query() query: ListFilterDto) {
    return this.adminManagementService.getAdminList(query);
  }
}
