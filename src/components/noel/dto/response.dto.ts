import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsNumber,
} from "class-validator";
import { Type } from "class-transformer";
export class EndGameDataDto {
  @ApiProperty({ example: 25.5 })
  @IsNumber()
  @IsNotEmpty()
  finalScore: number;

  @ApiProperty({ example: "WIN" })
  @IsNotEmpty()
  result: string;
}

export class EndGameResponseDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  success: boolean;

  @ApiProperty({ example: "Game ended successfully" })
  @IsString()
  message: string;

  @ApiProperty()
  @ValidateNested()
  @Type(() => EndGameDataDto)
  data: EndGameDataDto;
}
