import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import { AdminAuthService } from "./admin-auth.service";
import { AuthGuard } from "../../../common/guards/auth.guard";
import { RolesGuard, Roles } from "../../../common/guards/roles.guard";
import {
  ROLE_ADMIN,
  ROLE_SUPER_ADMIN,
} from "../../../common/constants/admin.constant";
import { AuthUser } from "../../../components/auth/interfaces/login.interface";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Public } from "../../../common/decorators/public.decorator";
import { RegisterAdminDto } from "./dto/register-admin.dto";
import { LockAdminDto } from "./dto/lock-admin.dto";
import { LoginAdminDto } from "./dto/login-admin.dto";
import { RefreshTokenAdminDto } from "./dto/refresh-token-admin.dto";

@ApiTags("Admin Auth")
@ApiBearerAuth()
@Controller("api/v1/admin/auth")
@UseGuards(AuthGuard, RolesGuard)
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post("register")
  @Roles(ROLE_SUPER_ADMIN)
  async register(@Body() body: RegisterAdminDto, @Req() req: AuthUser) {
    const { username, password, isFullAdmin } = body;
    const updatedBy = req.user?.username;
    return this.adminAuthService.register(
      username,
      password,
      isFullAdmin,
      updatedBy,
    );
  }

  @Post("login")
  @Public()
  async login(@Body() body: LoginAdminDto) {
    return this.adminAuthService.login(body.username, body.password);
  }

  @Post("refresh-token")
  @Public()
  async refreshToken(@Body() body: RefreshTokenAdminDto) {
    return this.adminAuthService.refreshToken(body.refreshToken);
  }

  @Post("lock")
  @Roles(ROLE_SUPER_ADMIN)
  async lockAccount(@Body() body: LockAdminDto, @Req() req: AuthUser) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.adminAuthService.lockAccount(username, updatedBy);
  }

  @Post("lock-user")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async lockUser(@Body() body: LockAdminDto, @Req() req: AuthUser) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.adminAuthService.lockUserAccount(username, updatedBy);
  }

  @Post("unlock")
  @Roles(ROLE_SUPER_ADMIN)
  async unlockAccount(@Body() body: LockAdminDto, @Req() req: AuthUser) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.adminAuthService.unlockAccount(username, updatedBy);
  }

  @Post("unlock-user")
  @Roles(ROLE_SUPER_ADMIN, ROLE_ADMIN)
  async unlockUser(@Body() body: LockAdminDto, @Req() req: AuthUser) {
    const { username } = body;
    const updatedBy = req.user?.username;
    return this.adminAuthService.unlockUserAccount(username, updatedBy);
  }
}
