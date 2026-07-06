import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { TurnsEntity } from "../../../../turns/entities/turns.entity";
import { TurnsHistoryEntity } from "../../../../turns/entities/turns-history.entity";
import { UserInfoEntity } from "../../../../auth/entities/user-info.entity";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";
import { formatDateToGMT7 } from "../../../../../common/helpers/date-time";
import { NoelConfigService } from "../../../mini-game-config/noel/noel-config.service";
import { ADMIN_ERROR_MESSAGE } from "../../../../../common/constants/message.constant";
import { TYPE_EVENT } from "../../../mini-game-config/constants/terms.constant";

@Injectable()
export class TurnsManagementService {
  constructor(
    @InjectRepository(TurnsEntity)
    private readonly turnsRepo: Repository<TurnsEntity>,
    @InjectRepository(TurnsHistoryEntity)
    private readonly turnsHistoryRepo: Repository<TurnsHistoryEntity>,
    @InjectRepository(UserInfoEntity)
    private readonly userRepo: Repository<UserInfoEntity>,
    private readonly noelConfigService: NoelConfigService,
  ) {}

  async getCurrentTurnsHistory(
    filter: ListFilterDto = {},
    exportExcel = false,
  ) {
    const qb = this.turnsRepo.createQueryBuilder("t");
    QueryBuilderHelper.applyFilters(qb, "t", filter);

    const sortField = (filter as any).sortField as string | undefined;
    const sortOrder =
      ((filter as any).sortOrder || "DESC").toString().toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    switch (sortField) {
      case "createdAt":
        qb.orderBy("t.createdAt", sortOrder as any);
        break;
      case "totalTurns":
        qb.orderBy("t.totalTurns", sortOrder as any);
        break;
      case "usedTurns":
        qb.orderBy("t.usedTurns", sortOrder as any);
        break;
      default:
        qb.orderBy("t.createdAt", "DESC");
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
      totalTurns: item.totalTurns,
      usedTurns: item.usedTurns,
      remainTurns: item.totalTurns - item.usedTurns,
    }));

    const summaryQb = this.turnsRepo.createQueryBuilder("t");
    QueryBuilderHelper.applyFilters(summaryQb, "t", filter);
    summaryQb
      .select("SUM(t.totalTurns)", "sumTotalTurns")
      .addSelect("SUM(t.usedTurns)", "sumUsedTurns")
      .addSelect("SUM(t.totalTurns - t.usedTurns)", "sumRemainTurns");

    const aggregates = await summaryQb.getRawOne();

    return {
      data: mappedData,
      total,
      page,
      pageSize,
      summary: {
        totalTurns: Number(aggregates?.sumTotalTurns) || 0,
        totalUsedTurns: Number(aggregates?.sumUsedTurns) || 0,
        totalRemainTurns: Number(aggregates?.sumRemainTurns) || 0,
      },
    };
  }

  async getPlayHistory(filter: ListFilterDto = {}, exportExcel = false) {
    const qb = this.turnsHistoryRepo.createQueryBuilder("th");
    QueryBuilderHelper.applyFilters(qb, "th", filter);
    qb.orderBy("th.createdAt", "DESC");

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
      updatedTurns: item.updatedTurns,
      createdAt: formatDateToGMT7(item.createdAt),
      updatedBy: item.updatedBy,
    }));

    return {
      data: mappedData,
      total,
      page,
      pageSize,
    };
  }

  async updateUserTurns(username: string, turns: number, updatedBy: string) {
    const user = await this.userRepo
      .createQueryBuilder("user")
      .where("user.username = :username", { username })
      .getOne();
    if (!user) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.USER_NOT_FOUND);
    }

    const config = await this.noelConfigService.getNoelConfig();
    if (!config) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.GAME_CONFIG_NOT_FOUND);
    }
    const turnsEntity = await this.turnsRepo
      .createQueryBuilder("turns")
      .where("turns.username = :username", { username })
      .orderBy("turns.createdAt", "DESC")
      .getOne();

    if (!turnsEntity) {
      throw new BadRequestException(ADMIN_ERROR_MESSAGE.DAILY_TURNS_NOT_FOUND);
    }

    if (turnsEntity.totalTurns === turnsEntity.usedTurns && turns < 0) {
      throw new BadRequestException(
        ADMIN_ERROR_MESSAGE.CANNOT_SUBTRACT_WHEN_NO_TURNS,
      );
    }

    const newTotalTurns = turnsEntity.totalTurns + turns;

    if (
      config.eventType === TYPE_EVENT.DAILY_TURN &&
      newTotalTurns > config.maxTurns
    ) {
      throw new BadRequestException(
        ADMIN_ERROR_MESSAGE.TURNS_EXCEED_MAX.replace(
          "{maxTurns}",
          config.maxTurns.toString(),
        ),
      );
    }

    if (newTotalTurns < 0) {
      throw new BadRequestException(
        ADMIN_ERROR_MESSAGE.TURNS_CANNOT_BE_NEGATIVE,
      );
    }

    if (turnsEntity.usedTurns > newTotalTurns) {
      throw new BadRequestException(
        ADMIN_ERROR_MESSAGE.USED_TURNS_EXCEED_TOTAL,
      );
    }

    await this.turnsRepo
      .createQueryBuilder()
      .update(TurnsEntity)
      .set({ totalTurns: newTotalTurns })
      .where("id = :id", { id: turnsEntity.id })
      .execute();

    await this.turnsHistoryRepo
      .createQueryBuilder()
      .insert()
      .into(TurnsHistoryEntity)
      .values({
        username,
        updatedTurns: newTotalTurns,
        updatedBy,
      })
      .execute();

    return {
      success: true,
      message: "Cập nhật lượt chơi thành công",
      data: {
        username,
        oldTotalTurns: turnsEntity.totalTurns,
        newTotalTurns: newTotalTurns,
        usedTurns: turnsEntity.usedTurns,
        remainTurns: newTotalTurns - turnsEntity.usedTurns,
      },
    };
  }

  async exportCurrentTurnsExcel(filter: ListFilterDto) {
    const result = await this.getCurrentTurnsHistory(filter, true);
    const columns = [
      { header: "STT", key: "stt" },
      { header: "Tên người dùng", key: "username" },
      { header: "Thời gian", key: "createdAt" },
      { header: "Số lượt đã nhận", key: "totalTurns" },
      { header: "Số lượt đã chơi", key: "usedTurns" },
      { header: "Số lượt còn lại", key: "remainTurns" },
    ];
    return {
      data: result.data,
      columns,
      fileName: "current_turns",
      sheetName: "Lịch sử lượt chơi hiện tại",
    };
  }

  async exportPlayHistoryExcel(filter: ListFilterDto) {
    const result = await this.getPlayHistory(filter, true);
    const columns = [
      { header: "STT", key: "stt" },
      { header: "Tên người dùng", key: "username" },
      { header: "Số lượt chơi update", key: "updatedTurns" },
      { header: "Thời gian", key: "createdAt" },
      { header: "Cập nhật bởi", key: "updatedBy" },
    ];
    return {
      data: result.data,
      columns,
      fileName: "lich_su_cap_nhat_so_luot_choi",
      sheetName: "Lịch sử cập nhật số lượt chơi",
    };
  }
}
