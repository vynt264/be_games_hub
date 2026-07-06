import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class LoginDto {
  @ApiProperty({
    description: "Tên đăng nhập",
    example: "username123",
  })
  @IsNotEmpty()
  @IsString()
  username: string;

  @ApiProperty({
    description: "ID của thiết bị đăng nhập",
    example: "device_123",
  })
  @IsNotEmpty()
  @IsString()
  deviceId: string;
}
