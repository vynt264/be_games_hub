import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import { TurnsManagementService } from "./turns-management.service";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { UpdateUserTurnsDto } from "../../dto/update-user-turns.dto";
import { AuthGuard } from "../../../../../common/guards/auth.guard";
import { Roles, RolesGuard } from "../../../../../common/guards/roles.guard";
import {
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
} from "../../../../../common/constants/admin.constant";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { exportToExcel } from "../../../../../common/helpers/excel.helper";
import { AuthUser } from "../../../../auth/interfaces/login.interface";

@ApiTags("Turns Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class TurnsManagementController {
  constructor(
    private readonly turnsManagementService: TurnsManagementService,
  ) {}

  @Get("current-turns")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async getCurrentTurnsHistory(@Query() query: ListFilterDto) {
    return this.turnsManagementService.getCurrentTurnsHistory(query);
  }

  @Get("play-history")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async getPlayHistory(@Query() query: ListFilterDto) {
    return this.turnsManagementService.getPlayHistory(query);
  }

  @Post("update-user-turns")
  @Roles(ROLE_SUPER_ADMIN)
  async updateUserTurns(
    @Body() body: UpdateUserTurnsDto,
    @Req() req: AuthUser,
  ) {
    const { username, turns } = body;
    const updatedBy = req.user?.username;
    return this.turnsManagementService.updateUserTurns(
      username,
      turns,
      updatedBy,
    );
  }

  @Post("current-turns/export-excel")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async exportCurrentTurnsExcel(
    @Query() query: ListFilterDto,
    @Res() res: Response,
  ) {
    const { data, columns, fileName, sheetName } =
      await this.turnsManagementService.exportCurrentTurnsExcel(query);
    await exportToExcel(res, data, columns, fileName, sheetName);
  }

  @Post("play-history/export-excel")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async exportPlayHistoryExcel(
    @Query() query: ListFilterDto,
    @Res() res: Response,
  ) {
    const { data, columns, fileName, sheetName } =
      await this.turnsManagementService.exportPlayHistoryExcel(query);
    await exportToExcel(res, data, columns, fileName, sheetName);
  }
}
