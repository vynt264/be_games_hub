import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { NoelEntity } from "../../../../noel/noel.entity";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";
import { formatDateToGMT7 } from "../../../../../common/helpers/date-time";

@Injectable()
export class NoelManagementService {
  constructor(
    @InjectRepository(NoelEntity)
    private readonly noelRepo: Repository<NoelEntity>,
  ) { }

  async getNoelHistory(filter: ListFilterDto = {}, exportExcel = false) {
    const qb = this.noelRepo.createQueryBuilder("g");
    QueryBuilderHelper.applyFilters(qb, "g", filter);

    const sortField = (filter as any).sortField as string | undefined;
    const sortOrder =
      ((filter as any).sortOrder || "DESC").toString().toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    switch (sortField) {
      case "vipLevel":
        qb.orderBy("g.vipLevel", sortOrder as any);
        break;
      case "score":
        qb.orderBy("g.score", sortOrder as any);
        break;
      default:
        qb.orderBy("g.createdAt", "DESC");
    }

    let data: any[];
    let total: number;
    let page: number;
    let pageSize: number;

    if (exportExcel) {
      data = await qb.getMany();
      total = data.length;
      page = 1;
      pageSize = data.length;
    } else {
      const pagination = QueryBuilderHelper.createPagination(
        filter.page,
        filter.pageSize,
      );
      page = pagination.page;
      pageSize = pagination.pageSize;
      [data, total] = await qb
        .skip(pagination.skip)
        .take(pagination.take)
        .getManyAndCount();
    }

    const mappedData = data.map((item, idx) => ({
      stt: exportExcel ? idx + 1 : (page - 1) * pageSize + idx + 1,
      username: item.username,
      createdAt: formatDateToGMT7(item.createdAt),
      status: item.isCompleted,
      vipLevel: item.vipLevel,
      score: item.score,
    }));

    const summaryQb = this.noelRepo.createQueryBuilder("g");
    QueryBuilderHelper.applyFilters(summaryQb, "g", filter);
    summaryQb
      .select("COUNT(g.id)", "totalPlays")
      .addSelect("COUNT(DISTINCT g.username)", "totalUsers")
      .addSelect("ROUND(SUM(g.score), 2)", "totalScore");

    const aggregates = await summaryQb.getRawOne();

    return {
      data: mappedData,
      total,
      page,
      pageSize,
      summary: {
        totalUsers: Number(aggregates.totalUsers) || 0,
        totalPlays: Number(aggregates.totalPlays) || 0,
        totalScore: Number(aggregates.totalScore) || 0,
      },
    };
  }

  async exportNoelHistoryExcel(filter: ListFilterDto) {
    const result = await this.getNoelHistory(filter, true);
    const columns = [
      { header: "STT", key: "stt" },
      { header: "Tên người dùng", key: "username" },
      { header: "Điểm", key: "score" },
      { header: "Trạng thái", key: "status" },
      { header: "Thời gian", key: "createdAt" },
      { header: "Cấp VIP", key: "vipLevel" },
    ];
    return {
      data: result.data,
      columns,
      fileName: "noel_history",
      sheetName: "Lịch sử chơi Noel",
    };
  }
}
