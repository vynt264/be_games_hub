import { ApiProperty } from "@nestjs/swagger";
import { IsObject, IsNotEmpty, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class ConfigUpdateDto {
  @ApiProperty({
    description: "Giá trị mới cho trường cấu hình",
    example: 15,
  })
  value: string | number | boolean;
}

export class UpdateTreasureHuntConfigDto {
  @ApiProperty({
    description: "Object chứa các cặp key-value cần cập nhật",
    example: {
      maxDailyTurns: 15,
      turnDuration: 20,
      isGameEnabled: true,
    },
  })
  @IsObject()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => ConfigUpdateDto)
  config: Record<string, string | number | boolean>;
}
