import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { AdminAuthEntity } from "../../../admin-auth/admin-auth.entity";
import { ListFilterDto } from "../../dto/list-filter.dto";
import { QueryBuilderHelper } from "../../../../../common/helpers/query-builder.helper";
import { ROLE_SUPER_ADMIN } from "../../../../../common/constants/admin.constant";

@Injectable()
export class AdminManagementService {
  constructor(
    @InjectRepository(AdminAuthEntity)
    private readonly adminRepo: Repository<AdminAuthEntity>,
  ) {}

  async getAdminList(filter: ListFilterDto = {}) {
    const qb = this.adminRepo.createQueryBuilder("admin");
    QueryBuilderHelper.applyFilters(qb, "admin", filter);
    qb.andWhere("admin.role != :superAdminRole", {
      superAdminRole: ROLE_SUPER_ADMIN,
    });
    qb.select([
      "admin.username",
      "admin.role",
      "admin.status",
      "admin.createdAt",
      "admin.updatedAt",
      "admin.updatedBy",
    ]);
    qb.orderBy("admin.createdAt", "DESC");

    const { page, pageSize, skip, take } = QueryBuilderHelper.createPagination(
      filter.page,
      filter.pageSize,
    );
    const [data, total] = await qb.skip(skip).take(take).getManyAndCount();

    return { data, total, page, pageSize };
  }
}
