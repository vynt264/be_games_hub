import { Controller, Post, UseGuards, Req, Get, Query, Body } from "@nestjs/common";
import { AuthGuard } from "../../common/guards/auth.guard";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from "@nestjs/swagger";
import { Public } from "src/common/decorators/public.decorator";
import { EndGameResponseDto, EndGameRequestDto, StartGameRequestDto, EncryptedResponseDto } from "./dto";
import { AuthUser } from "../auth/interfaces/login.interface";
import { Roles, RolesGuard } from "src/common/guards/roles.guard";
import { ROLE_USER } from "src/common/constants/admin.constant";
import { NoelService } from "./noel.service";
// import { encryptWithPublicKey, verifyWithPublicKey } from "src/common/helpers/data-encryption.helper";

@ApiTags("NOEL")
@ApiBearerAuth()
@Controller("api/v1/noel")
@UseGuards(AuthGuard, RolesGuard)
@Roles(ROLE_USER)
export class NoelController {
  constructor(private readonly noelService: NoelService) { }

  @Post("start")
  @ApiOperation({
    summary: "Bắt đầu game",
  })
  @ApiResponse({
    status: 201,
    description: "Bắt đầu game thành công",
    type: EncryptedResponseDto,
  })
  @ApiResponse({ status: 401, description: "Token không hợp lệ" })
  async startGame(@Req() req: AuthUser, @Body() startGameDto: StartGameRequestDto) {
    const { username } = req.user;
    // Tạm thời bỏ kiểm tra và lưu public key.
    // if (
    //   !startGameDto.encryptionPublicKey ||
    //   !startGameDto.verificationPublicKey
    // ) {
    //   throw new BadRequestException("Thiếu public key");
    // }
    // this.noelService.saveClientPublicKey(
    //   username,
    //   startGameDto.encryptionPublicKey,
    //   startGameDto.verificationPublicKey,
    // );
    const result = await this.noelService.startGame(username);
    // const encrypted = await encryptWithPublicKey(
    //   startGameDto.encryptionPublicKey,
    //   result.data.noelState,
    // );
    // return { ...result, data: encrypted };
    return result;
  }

  @Post("end")
  @ApiOperation({
    summary: "Kết thúc game Hòa Khí Việt Nam",
    description:
      "Kết thúc game và tính điểm dựa trên các vị trí người chơi đã chọn. Client cần gửi dữ liệu đã mã hóa bằng private key.",
  })
  @ApiResponse({
    status: 201,
    description: "Kết thúc game thành công",
    type: EndGameResponseDto,
  })
  @ApiResponse({ status: 401, description: "Token không hợp lệ" })
  @ApiResponse({
    status: 400,
    description:
      "Game không tồn tại, đã kết thúc, hoặc không tìm thấy public key cho session này",
  })
  async endGame(
    @Req() req: AuthUser,
    @Body() endGameDto: EndGameRequestDto,
  ): Promise<EndGameResponseDto> {
    const { username } = req.user;


    // Tạm thời bỏ kiểm tra public key và chữ ký của client.
    // const publicKeys = this.noelService.getClientPublicKey(username);
    // if (!publicKeys || !publicKeys.verifyKey) {
    //   throw new BadRequestException(
    //     "Không tìm thấy public key hoặc public key đã hết hạn cho session này. Vui lòng bắt đầu game mới.",
    //   );
    // }
    // const isValid = await verifyWithPublicKey(
    //   publicKeys.verifyKey,
    //   endGameDto.payload,
    //   endGameDto.signature,
    // );
    // if (!isValid) {
    //   throw new BadRequestException("Chữ ký không hợp lệ");
    // }
    // this.noelService.deleteClientPublicKey(username);
    return this.noelService.endGame(
      username,
      endGameDto.payload.gameId,
      endGameDto.payload.selectedPositions,
    );
  }

  @Get("history")
  @ApiQuery({ name: "fromDate", required: false })
  @ApiQuery({ name: "toDate", required: false })
  @ApiQuery({ name: "page", required: false })
  @ApiQuery({ name: "pageSize", required: false })
  async getHistory(
    @Req() req: AuthUser,
    @Query("fromDate") fromDate?: string,
    @Query("toDate") toDate?: string,
    @Query("page") page?: string,
    @Query("pageSize") pageSize?: string,
  ) {
    const { username } = req.user;

    return this.noelService.getHistory(
      username,
      fromDate,
      toDate,
      Number(page),
      Number(pageSize),
    );
  }

  @Get("config")
  @Public()
  async getConfig() {
    return this.noelService.getConfig();
  }

  @Get("turns-left")
  async getTurnsLeft(@Req() req: AuthUser) {
    const { username } = req.user;
    return this.noelService.getTurnsLeft(username);
  }
}
