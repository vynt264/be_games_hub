import { Controller, Get, Post, Query, Res, UseGuards } from "@nestjs/common";
import { ExchangeManagementService } from "./exchange-management.service";
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

@ApiTags("Exchange Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class ExchangeManagementController {
  constructor(
    private readonly exchangeManagementService: ExchangeManagementService,
  ) {}

  @Get("exchange-history")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async getExchangeHistory(@Query() query: ListFilterDto) {
    return this.exchangeManagementService.getExchangeHistory(query);
  }

  @Post("exchange-history/export-excel")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async exportExchangeHistoryExcel(
    @Query() query: ListFilterDto,
    @Res() res: Response,
  ) {
    const { data, columns, fileName, sheetName } =
      await this.exchangeManagementService.exportExchangeHistoryExcel(query);
    await exportToExcel(res, data, columns, fileName, sheetName);
  }
}
