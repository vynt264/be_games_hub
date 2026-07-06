import { SelectQueryBuilder } from "typeorm";

export interface FilterOptions {
  username?: string;
  status?: string;
  vipLevel?: number;
  isCompleted?: boolean | string;
  fromDate?: string;
  toDate?: string;
}

export class QueryBuilderHelper {
  static applyFilters<T>(
    qb: SelectQueryBuilder<T>,
    alias: string,
    filter: FilterOptions,
  ): void {
    if (filter.username) {
      qb.andWhere(`${alias}.username LIKE :username`, {
        username: `%${filter.username}%`,
      });
    }

    if (filter.status !== undefined) {
      qb.andWhere(`${alias}.status = :status`, { status: filter.status });
    }

    if (filter.vipLevel) {
      qb.andWhere(`${alias}.vipLevel = :vipLevel`, {
        vipLevel: filter.vipLevel,
      });
    }

    if (filter.isCompleted !== undefined) {
      const isCompleted =
        typeof filter.isCompleted === "string"
          ? filter.isCompleted === "true" || filter.isCompleted === "1"
          : !!filter.isCompleted;
      qb.andWhere(`${alias}.isCompleted = :isCompleted`, { isCompleted });
    }

    if (filter.fromDate && filter.toDate) {
      qb.andWhere(`${alias}.createdAt BETWEEN :fromDate AND :toDate`, {
        fromDate: new Date(new Date(filter.fromDate).setHours(0, 0, 0, 0)),
        toDate: new Date(new Date(filter.toDate).setHours(23, 59, 59, 999)),
      });
    } else if (filter.fromDate) {
      qb.andWhere(`${alias}.createdAt >= :fromDate`, {
        fromDate: new Date(new Date(filter.fromDate).setHours(0, 0, 0, 0)),
      });
    } else if (filter.toDate) {
      const start = new Date(new Date(filter.toDate).setHours(0, 0, 0, 0));
      const end = new Date(new Date(filter.toDate).setHours(23, 59, 59, 999));
      qb.andWhere(`${alias}.createdAt BETWEEN :start AND :end`, {
        start,
        end,
      });
    }
  }

  static createPagination(page?: number, pageSize?: number) {
    const p = page && page > 0 ? page : 1;
    const ps = pageSize && pageSize > 0 ? pageSize : 10;
    return {
      page: p,
      pageSize: ps,
      skip: (p - 1) * ps,
      take: ps,
    };
  }
}
