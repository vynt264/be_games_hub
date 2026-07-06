import { Controller, Post, Body, Req, UseGuards } from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import {
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
} from "./interfaces/login.interface";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { AuthRequired, Public } from "../../common/decorators/public.decorator";
import { AuthUser } from "./interfaces/login.interface";
import { AuthGuard } from "src/common/guards/auth.guard";

@ApiTags("Auth")
@Controller("api/v1/auth")
@Public()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  @ApiOperation({ summary: "Đăng nhập vào minigame" })
  @ApiResponse({
    status: 200,
    description: "Đăng nhập thành công",
  })
  @ApiResponse({
    status: 400,
    description: "Username không hợp lệ",
  })
  @ApiResponse({
    status: 401,
    description: "Đã có phiên đăng nhập hoặc level không hợp lệ",
  })
  login(@Body() loginDto: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }

  @Post("refresh-token")
  @ApiOperation({ summary: "Làm mới access token" })
  @ApiResponse({
    status: 200,
    description: "Làm mới token thành công",
  })
  @ApiResponse({
    status: 401,
    description: "Refresh token không hợp lệ",
  })
  refreshToken(
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<RefreshTokenResponse> {
    return this.authService.refreshToken(
      refreshTokenDto.refreshToken,
      refreshTokenDto.deviceId,
    );
  }

  @Post("logout")
  @AuthRequired()
  @ApiBearerAuth()
  @UseGuards(AuthGuard)
  async logout(@Req() req: AuthUser): Promise<LogoutResponse> {
    const { username } = req.user;
    return this.authService.logout(username);
  }
}
