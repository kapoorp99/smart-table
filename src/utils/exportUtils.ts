import Papa from "papaparse";
import * as XLSX from "xlsx";

export function exportToCSV<T>(data: T[], columns: string[], fileName: string) {
  const csv = Papa.unparse(data.map(row => {
    const obj: any = {};
    columns.forEach(col => obj[col] = row[col]);
    return obj;
  }));
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", `${fileName}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToXLSX<T>(data: T[], columns: string[], fileName: string) {
  const worksheet = XLSX.utils.json_to_sheet(data.map(row => {
    const obj: any = {};
    columns.forEach(col => obj[col] = row[col]);
    return obj;
  }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
}
