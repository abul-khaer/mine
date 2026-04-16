import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import type { CompanySettings, Mine } from '../types';

interface ExportConfig {
  filename: string;
  sheetName: string;
  reportTitle: string;
  filterInfo?: string;
  columns: { header: string; key: string; width?: number }[];
  data: Record<string, unknown>[];
  company: CompanySettings | null;
  mine?: Mine | null;
}

export async function exportToExcel(config: ExportConfig) {
  const { filename, sheetName, reportTitle, filterInfo, columns, data, company, mine } = config;

  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet(sheetName);

  // ── KOP LAPORAN ──────────────────────────────────────────────────────────────
  const colCount = columns.length;
  let currentRow = 1;

  // Logo (jika ada)
  if (company?.logo_url) {
    try {
      const res = await fetch(company.logo_url);
      const buf = await res.arrayBuffer();
      const ext = company.logo_url.split('.').pop()?.toLowerCase() as 'png' | 'jpeg' | 'gif';
      const imageId = wb.addImage({ buffer: buf, extension: ext ?? 'png' });
      ws.addImage(imageId, {
        tl: { col: 0, row: 0 },
        ext: { width: 80, height: 60 },
      });
    } catch {
      // logo gagal diload, skip
    }
    currentRow = 4;
  }

  // Nama perusahaan
  ws.mergeCells(currentRow, 1, currentRow, colCount);
  const nameCell = ws.getCell(currentRow, 1);
  nameCell.value = company?.company_name ?? 'PERUSAHAAN TAMBANG';
  nameCell.font = { bold: true, size: 14 };
  nameCell.alignment = { horizontal: 'center' };
  currentRow++;

  // Alamat
  if (mine?.address || company?.address) {
    ws.mergeCells(currentRow, 1, currentRow, colCount);
    const addrCell = ws.getCell(currentRow, 1);
    addrCell.value = mine?.address || company?.address || '';
    addrCell.alignment = { horizontal: 'center' };
    addrCell.font = { size: 10 };
    currentRow++;
  }

  // Telepon
  const phone = mine?.phone || company?.phone;
  if (phone) {
    ws.mergeCells(currentRow, 1, currentRow, colCount);
    const phoneCell = ws.getCell(currentRow, 1);
    phoneCell.value = `Telp: ${phone}`;
    phoneCell.alignment = { horizontal: 'center' };
    phoneCell.font = { size: 10 };
    currentRow++;
  }

  // Garis pemisah
  ws.mergeCells(currentRow, 1, currentRow, colCount);
  const sepCell = ws.getCell(currentRow, 1);
  sepCell.border = { bottom: { style: 'medium', color: { argb: 'FF000000' } } };
  currentRow++;

  // Judul laporan
  ws.mergeCells(currentRow, 1, currentRow, colCount);
  const titleCell = ws.getCell(currentRow, 1);
  titleCell.value = reportTitle.toUpperCase();
  titleCell.font = { bold: true, size: 12 };
  titleCell.alignment = { horizontal: 'center' };
  currentRow++;

  // Info filter
  if (filterInfo) {
    ws.mergeCells(currentRow, 1, currentRow, colCount);
    const filterCell = ws.getCell(currentRow, 1);
    filterCell.value = filterInfo;
    filterCell.font = { italic: true, size: 10, color: { argb: 'FF666666' } };
    filterCell.alignment = { horizontal: 'center' };
    currentRow++;
  }

  // Tanggal cetak
  ws.mergeCells(currentRow, 1, currentRow, colCount);
  const dateCell = ws.getCell(currentRow, 1);
  dateCell.value = `Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'long' })} ${new Date().toLocaleTimeString('id-ID')}`;
  dateCell.font = { size: 9, color: { argb: 'FF888888' } };
  dateCell.alignment = { horizontal: 'right' };
  currentRow++;

  // Baris kosong
  currentRow++;

  // ── HEADER TABEL ─────────────────────────────────────────────────────────────
  const headerRow = ws.getRow(currentRow);
  columns.forEach((col, i) => {
    const cell = headerRow.getCell(i + 1);
    cell.value = col.header;
    cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0369A1' } };
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = {
      top: { style: 'thin' }, bottom: { style: 'thin' },
      left: { style: 'thin' }, right: { style: 'thin' },
    };
    ws.getColumn(i + 1).width = col.width ?? 18;
  });
  headerRow.height = 22;
  currentRow++;

  // ── DATA ─────────────────────────────────────────────────────────────────────
  data.forEach((row, rowIdx) => {
    const dataRow = ws.getRow(currentRow);
    columns.forEach((col, colIdx) => {
      const cell = dataRow.getCell(colIdx + 1);
      cell.value = row[col.key] as ExcelJS.CellValue;
      cell.alignment = { vertical: 'middle', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        bottom: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        left: { style: 'thin', color: { argb: 'FFDDDDDD' } },
        right: { style: 'thin', color: { argb: 'FFDDDDDD' } },
      };
      if (rowIdx % 2 === 1) {
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
      }
    });
    currentRow++;
  });

  // ── SAVE ─────────────────────────────────────────────────────────────────────
  const buf = await wb.xlsx.writeBuffer();
  saveAs(new Blob([buf], { type: 'application/octet-stream' }), `${filename}.xlsx`);
}
