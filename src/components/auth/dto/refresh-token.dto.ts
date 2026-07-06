import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class RefreshTokenDto {
  @ApiProperty({
    description: "Refresh token để lấy access token mới",
    example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @ApiProperty({
    description: "ID của thiết bị đang yêu cầu làm mới token",
    example: "device_123",
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
