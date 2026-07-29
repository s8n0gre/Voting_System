import * as exportService from '../services/export-service.js';

export async function exportResults(_req, res) {
  const buffer = await exportService.generateExcelReport();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=voting-results.xlsx');
  res.send(buffer);
}

export async function downloadNominations(_req, res) {
  const buffer = await exportService.getNominationsReportBuffer();
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=nomination-results.xlsx');
  res.send(buffer);
}
