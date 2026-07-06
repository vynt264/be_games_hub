import { ApiPropertyOptional } from "@nestjs/swagger";
import { ADMIN_STATUS } from "../../../../common/constants/admin.constant";
import { PaginationDto } from "../../../../common/adapters/pagination/pagination.dto";

export class ListFilterDto extends PaginationDto {
  @ApiPropertyOptional({ description: "Tìm theo username" })
  username?: string;

  @ApiPropertyOptional({ description: "Trạng thái: active/inactive" })
  status?: ADMIN_STATUS;

  @ApiPropertyOptional({ description: "Từ ngày (YYYY-MM-DD)" })
  fromDate?: string;

  @ApiPropertyOptional({ description: "Đến ngày (YYYY-MM-DD)" })
  toDate?: string;

  @ApiPropertyOptional({ description: "Trạng thái: true/false" })
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: "Tìm theo vip level" })
  vipLevel?: number;

  @ApiPropertyOptional({ description: "Trạng thái: true/false" })
  isFake?: boolean;
}
