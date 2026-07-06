import { Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
import { NoelManagementService } from "./noel-management.service";
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

@ApiTags("Noel Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class NoelManagementController {
  constructor(private readonly noelManagementService: NoelManagementService) {}

  @Get("noel-history")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async getNoelHistory(@Query() query: ListFilterDto) {
    return this.noelManagementService.getNoelHistory(query);
  }

  @Post("noel-history/export-excel")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async exportNoelHistoryExcel(
    @Query() query: ListFilterDto,
    @Res() res: Response,
  ) {
    const { data, columns, fileName, sheetName } =
      await this.noelManagementService.exportNoelHistoryExcel(query);
    await exportToExcel(res, data, columns, fileName, sheetName);
  }
}
