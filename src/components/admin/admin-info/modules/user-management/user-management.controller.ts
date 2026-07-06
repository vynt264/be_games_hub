import { Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
import { UserManagementService } from "./user-management.service";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { AuthGuard } from "../../../../../common/guards/auth.guard";
import { Roles, RolesGuard } from "../../../../../common/guards/roles.guard";
import {
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
} from "../../../../../common/constants/admin.constant";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { exportToExcel } from "../../../../../common/helpers/excel.helper";

@ApiTags("User Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class UserManagementController {
  constructor(private readonly userManagementService: UserManagementService) {}

  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  @Get("list-user")
  async getUserList(@Query() query: ListFilterDto) {
    return this.userManagementService.getUserList(query);
  }

  @Roles(ROLE_SUPER_ADMIN)
  @Post("list-user/export-excel")
  async exportUserListExcel(
    @Query() query: ListFilterDto,
    @Res() res: Response,
  ) {
    const { data, columns, fileName, sheetName } =
      await this.userManagementService.exportUserListExcel(query);
    await exportToExcel(res, data, columns, fileName, sheetName);
  }
}
