import * as ExcelJS from "exceljs";
import { Response } from "express";

export async function exportToExcel(
  res: Response,
  data: unknown[],
  columns: { header: string; key: string }[],
  fileName: string,
  sheetName = "Sheet1",
) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  worksheet.columns = columns;
  worksheet.addRows(data);

  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
  res.setHeader("Content-Disposition", `attachment; filename=${fileName}.xlsx`);

  await workbook.xlsx.write(res);
  res.end();
}
