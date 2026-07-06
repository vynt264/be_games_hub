import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsBoolean, IsOptional } from "class-validator";

export class NoelPositionDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: false })
  @IsBoolean()
  @IsNotEmpty()
  isBomb: boolean;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;

  @ApiProperty({ example: 15.5, required: false })
  @IsNumber()
  @IsOptional()
  score?: number;
}

export class SelectedNoelDto {
  @ApiProperty({ example: 1 })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({ example: true, required: false })
  @IsBoolean()
  @IsOptional()
  isSelected?: boolean;
}
