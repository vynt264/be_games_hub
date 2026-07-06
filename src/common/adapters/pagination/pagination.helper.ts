import { IPagination } from "./pagination.interface";

export const createPagination = (
  page?: number,
  pageSize?: number,
): IPagination => {
  page = +page || 1;
  pageSize = +pageSize || 20;

  const startIndex = (page - 1) * pageSize;
  const endIndex = page * pageSize;

  return {
    page,
    pageSize,
    startIndex,
    endIndex,
  };
};
