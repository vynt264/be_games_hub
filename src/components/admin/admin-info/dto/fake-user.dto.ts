import { ApiPropertyOptional, ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";

export class CreateFakeUserDto {
  @ApiProperty({ example: "userfake01" })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 123 })
  @IsInt()
  @Min(0)
  playCount: number;
}

export class UpdateFakeUserDto {
  @ApiPropertyOptional({ example: 321 })
  @IsOptional()
  @IsInt()
  @Min(0)
  playCount?: number;
}
