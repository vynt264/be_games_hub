import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { UserInfoEntity } from "../../../../auth/entities/user-info.entity";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";
import { formatDateToGMT7 } from "../../../../../common/helpers/date-time";

@Injectable()
export class UserManagementService {
  constructor(
    @InjectRepository(UserInfoEntity)
    private readonly userRepo: Repository<UserInfoEntity>,
  ) {}

  async getUserList(filter: ListFilterDto = {}, exportExcel: boolean = false) {
    const qb = this.userRepo.createQueryBuilder("user");
    QueryBuilderHelper.applyFilters(qb, "user", filter);

    if (exportExcel) {
      const data = await qb.getMany();
      return {
        data: data.map((item, idx) => ({
          stt: idx + 1,
          username: item.username,
          status: item.status,
          createdAt: formatDateToGMT7(item.createdAt),
          updatedBy: item.updatedBy,
        })),
        total: data.length,
      };
    }

    const { page, pageSize, skip, take } = QueryBuilderHelper.createPagination(
      filter.page,
      filter.pageSize,
    );
    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();

    return {
      data,
      total,
      page,
      pageSize,
    };
  }

  async exportUserListExcel(filter: ListFilterDto) {
    const result = await this.getUserList(filter, true);
    const columns = [
      { header: "STT", key: "stt" },
      { header: "Tên người dùng", key: "username" },
      { header: "Trạng thái", key: "status" },
      { header: "Ngày tạo", key: "createdAt" },
      { header: "Cập nhật bởi", key: "updatedBy" },
    ];
    const data = result.data.map((item, idx) => ({
      stt: idx + 1,
      ...item,
      status: item.status === "active" ? "Hoạt động " : "Khóa",
    }));
    return {
      data,
      columns,
      fileName: "user_list",
      sheetName: "Danh sách người dùng",
    };
  }
}
