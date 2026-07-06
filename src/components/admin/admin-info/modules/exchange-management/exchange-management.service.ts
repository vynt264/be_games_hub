import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TurnsEntity } from "../../../../turns/entities/turns.entity";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";
import { formatDateToGMT7 } from "../../../../../common/helpers/date-time";
import { NoelConfigService } from "../../../mini-game-config/noel/noel-config.service";
import { ERROR_MESSAGE } from "../../../../../common/constants/message.constant";

@Injectable()
export class ExchangeManagementService {
  constructor(
    @InjectRepository(TurnsEntity)
    private readonly turnsRepo: Repository<TurnsEntity>,
    private readonly noelConfigService: NoelConfigService,
  ) {}

  async getExchangeHistory(filter: ListFilterDto = {}, exportExcel = false) {
    const config = await this.noelConfigService.getNoelConfig();
    if (!config) throw new NotFoundException(ERROR_MESSAGE.CONFIG_NOT_FOUND);

    const qb = this.turnsRepo.createQueryBuilder("t");
    QueryBuilderHelper.applyFilters(qb, "t", filter);
    qb.orderBy("t.createdAt", "DESC");

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
      totalTurns: item.totalTurns,
      dtcBanCa: Number(item.banCaLastBet),
      dtcSlots: Number(item.slotLastBet),
      dtcCasino: Number(item.casinoLastBet),
      dtcGameViet: Number(item.gameVietLastBet),
      dtcTheThao: Number(item.theThaoLastBet),
      dtcBanCaRemaining: Number(item.dtcBanCa) - Number(item.banCaLastBet),
      dtcSlotsRemaining: Number(item.dtcSlots) - Number(item.slotLastBet),
      dtcCasinoRemaining: Number(item.dtcCasino) - Number(item.casinoLastBet),
      dtcGameVietRemaining:
        Number(item.dtcGameViet) - Number(item.gameVietLastBet),
      dtcTheThaoRemaining:
        Number(item.dtcTheThao) - Number(item.theThaoLastBet),
      minDeposit: item.minDeposit,
      status: item.isCompleted,
    }));

    return {
      data: mappedData,
      total,
      page,
      pageSize,
    };
  }

  async exportExchangeHistoryExcel(filter: ListFilterDto) {
    const result = await this.getExchangeHistory(filter, true);
    const columns = [
      { header: "STT", key: "stt" },
      { header: "Tên người dùng", key: "username" },
      { header: "Giá trị nạp trong ngày", key: "minDeposit" },
      { header: "DTC BẮN CÁ", key: "dtcBanCa" },
      { header: "DTC SLOTS", key: "dtcSlots" },
      { header: "DTC CASINO", key: "dtcCasino" },
      { header: "DTC GAME VIỆT", key: "dtcGameViet" },
      { header: "DTC THỂ THAO", key: "dtcTheThao" },
      {
        header: "DTC còn lại sau khi cộng lượt (BẮN CÁ)",
        key: "dtcBanCaRemaining",
      },
      {
        header: "DTC còn lại sau khi cộng lượt (SLOTS)",
        key: "dtcSlotsRemaining",
      },
      {
        header: "DTC còn lại sau khi cộng lượt (CASINO)",
        key: "dtcCasinoRemaining",
      },
      {
        header: "DTC còn lại sau khi cộng lượt (GAME VIỆT)",
        key: "dtcGameVietRemaining",
      },
      {
        header: "DTC còn lại sau khi cộng lượt (THỂ THAO)",
        key: "dtcTheThaoRemaining",
      },
      { header: "Lượt chơi được cộng", key: "totalTurns" },
      { header: "Thời gian", key: "createdAt" },
    ];
    return {
      data: result.data,
      columns,
      fileName: "exchange_history",
      sheetName: "Lịch sử quy đổi DTC sang lượt chơi",
    };
  }
}
