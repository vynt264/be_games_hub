import { ApiProperty } from "@nestjs/swagger";
import {
  IsNumber,
  IsEnum,
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsDate,
  IsOptional,
  IsArray,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { NoelPositionDto } from "./position.dto";
import { NoelResult } from "../noel.constant";
import { MiniGameType } from "src/components/integrations/integrations.constant";

export class NoelStateDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: "player1" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({})
  @IsNotEmpty()
  miniGameType: MiniGameType;

  @ApiProperty({ example: 15.5 })
  @IsNumber()
  @IsNotEmpty()
  score: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  dailyTurns: number;

  @ApiProperty({ example: 20 })
  @IsNumber()
  @IsNotEmpty()
  timeLeft: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  isCompleted: boolean;

  @ApiProperty({ type: [NoelPositionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoelPositionDto)
  noelPositions: NoelPositionDto[];

  @ApiProperty({ example: "2024-03-10T12:00:00Z" })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  startTime?: Date;

  @ApiProperty({ example: "2024-03-10T12:00:20Z" })
  @IsDate()
  @IsOptional()
  @Type(() => Date)
  endTime?: Date;

  @ApiProperty({
    enum: NoelResult,
    example: NoelResult.CHRISTMAS_TREE,
    required: false,
  })
  @IsEnum(NoelResult)
  @IsOptional()
  result?: NoelResult;

  @ApiProperty({ example: "2024-03-10T12:00:00Z" })
  @IsDate()
  @IsNotEmpty()
  @Type(() => Date)
  createdAt: Date;
}
