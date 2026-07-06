import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsOptional, Min, Max } from "class-validator";
import { Type } from "class-transformer";

export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: "Page must be greater than 0" })
  @ApiPropertyOptional({
    type: "integer",
    description: "Page number (starts from 1)",
    minimum: 1,
    default: 1,
  })
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1, { message: "pageSize must be greater than 0" })
  @Max(100, { message: "pageSize cannot exceed 100" })
  @ApiPropertyOptional({
    type: "integer",
    description: "Number of items page size (max 100)",
    minimum: 1,
    maximum: 100,
    default: 20,
  })
  pageSize?: number = 20;

  @IsOptional()
  @ApiPropertyOptional({
    name: "sortField",
    required: false,
    description: "Trường sắp xếp",
    enum: [
      "createdAt",
      "vipLevel",
      "total",
      "used",
      "remaining",
      "totalTurns",
      "usedTurns",
      "remainTurns",
    ],
    example: "total",
  })
  sortField?: string;

  @IsOptional()
  @ApiPropertyOptional({
    name: "sortOrder",
    required: false,
    description: "Thứ tự sắp xếp",
    enum: ["ASC", "DESC"],
    example: "DESC",
  })
  sortOrder?: "ASC" | "DESC";
}
