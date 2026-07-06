import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FakeUserNotificationManagementService } from "./fake-user-notification-management.service";
import { UpdateUserTurnsDto } from "../../dto/update-user-turns.dto";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { AuthGuard } from "../../../../../common/guards/auth.guard";
import { Roles, RolesGuard } from "../../../../../common/guards/roles.guard";
import { ROLE_SUPER_ADMIN } from "../../../../../common/constants/admin.constant";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { AuthUser } from "../../../../auth/interfaces/login.interface";

@ApiTags("Fake Notification Management")
@ApiBearerAuth()
@Controller("api/v1/admin/info")
@UseGuards(AuthGuard, RolesGuard)
export class FakeUserPopupManagementController {
  constructor(
    private readonly fakeUserNotificationManagementService: FakeUserNotificationManagementService,
  ) {}

  @Roles(ROLE_SUPER_ADMIN)
  @Post("user-fake-notifications")
  async createUserFakeNotification(
    @Body() body: UpdateUserTurnsDto,
    @Req() req: AuthUser,
  ) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.fakeUserNotificationManagementService.createUserFakeNotification(
      username,
      updatedBy,
    );
  }

  @Roles(ROLE_SUPER_ADMIN)
  @Get("user-fake-notifications")
  async listFakeNotifications(@Query() query: ListFilterDto) {
    return this.fakeUserNotificationManagementService.listUserFakeNotifications(
      query,
    );
  }

  @Roles(ROLE_SUPER_ADMIN)
  @Patch("user-fake-notifications/:id")
  async updateFakeNotification(
    @Param("id") id: number,
    @Body() body: UpdateUserTurnsDto,
    @Req() req: AuthUser,
  ) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.fakeUserNotificationManagementService.updateUserFakeNotification(
      +id,
      username,
      updatedBy,
    );
  }

  @Roles(ROLE_SUPER_ADMIN)
  @Delete("user-fake-notifications/:id")
  async deleteFakeNotification(@Param("id") id: number) {
    return this.fakeUserNotificationManagementService.deleteUserFakeNotification(
      +id,
    );
  }
}
