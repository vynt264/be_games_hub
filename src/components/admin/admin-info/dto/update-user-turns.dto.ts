import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber } from "class-validator";

export class UpdateUserTurnsDto {
  @ApiProperty({ description: "Tên người dùng cần cập nhật lượt chơi" })
  @IsString()
  username: string;

  @ApiProperty({
    description: "Số lượt chơi cần thêm/bớt (có thể âm)",
    example: 5,
  })
  @IsNumber()
  turns: number;
}
