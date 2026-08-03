import ExcelJS from 'exceljs';
import { getResults } from './vote-service.js';
import { supabase } from '../database/supabase.js';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const _srvDir = path.dirname(fileURLToPath(import.meta.url));

export async function generateExcelReport() {
  const { executiveResults, supportingResults } = await getResults();

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Voting System';

  const execSheet = workbook.addWorksheet('Executive Results');
  execSheet.columns = [
    { header: 'ID', key: 'id', width: 5 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Role', key: 'role', width: 20 },
    { header: 'Votes', key: 'votes', width: 10 },
  ];
  execSheet.addRows(executiveResults);

  const styleSheet = workbook.addWorksheet('Supporting Results');
  styleSheet.columns = [
    { header: 'ID', key: 'id', width: 5 },
    { header: 'Name', key: 'name', width: 25 },
    { header: 'Role', key: 'role', width: 20 },
    { header: 'Votes', key: 'votes', width: 10 },
  ];
  styleSheet.addRows(supportingResults);

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

export async function generateNominationsReport() {
  const buffer = await getNominationsReportBuffer();
  const resultsDir = path.join(_srvDir, '..', '..', 'results');
  await mkdir(resultsDir, { recursive: true });
  await writeFile(path.join(resultsDir, 'results.xlsx'), buffer);
}

const REPORT_EXECS = [
  {
    name: 'Mohan K',
    role: 'Community Lead',
    roles: ['Events Coordinator', 'Engagement Coordinator', 'Partnership Coordinator'],
  },
  {
    name: 'Srikeerthi C B',
    role: 'Secretary',
    roles: ['Administration Coordinator', 'Documentation Coordinator', 'Communication Coordinator'],
  },
];

export async function getNominationsReportBuffer() {
  const { data: noms, error } = await supabase
    .from('Nominations')
    .select('*, ExecutiveCandidates(name, role)')
    .order('executiveCandidateId')
    .order('roleTitle')
    .order('voteCount', { ascending: false });
  if (error) throw error;

  noms.forEach(n => {
    n.execName = n.ExecutiveCandidates?.name || '';
    n.execRole = n.ExecutiveCandidates?.role || '';
    delete n.ExecutiveCandidates;
  });

  const grouped = {};
  for (const n of noms) {
    if (!REPORT_EXECS.some(e => e.name === n.execName)) continue;
    const key = `${n.executiveCandidateId}|${n.execName}|${n.execRole}`;
    if (!grouped[key]) grouped[key] = { execName: n.execName, execRole: n.execRole, roles: {} };
    if (!grouped[key].roles[n.roleTitle]) grouped[key].roles[n.roleTitle] = [];
    grouped[key].roles[n.roleTitle].push(n);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Voting System';

  const COLUMNS = [
    { header: 'Role', key: 'roleTitle', width: 30 },
    { header: 'Name', key: 'studentName', width: 30 },
    { header: 'Email', key: 'studentEmail', width: 35 },
    { header: 'Votes', key: 'voteCount', width: 10 },
  ];

  for (const exec of REPORT_EXECS) {
    const sheetName = `${exec.name} - ${exec.role}`.slice(0, 31);
    const sheet = workbook.addWorksheet(sheetName);
    sheet.columns = COLUMNS;

    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1a1a2e' } };

    const group = Object.values(grouped).find(g => g.execName === exec.name);
    let rowIdx = 2;

    for (const roleTitle of exec.roles) {
      const sectionRow = sheet.getRow(rowIdx);
      sectionRow.getCell(1).value = roleTitle;
      sectionRow.font = { bold: true, size: 12, color: { argb: 'FF6d28d9' } };
      sectionRow.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3F0FF' } };
      rowIdx++;

      const nominees = group?.roles[roleTitle] || [];
      if (nominees.length === 0) {
        sheet.getRow(rowIdx).getCell(2).value = 'No nominations yet';
        rowIdx++;
        continue;
      }

      for (const n of nominees) {
        sheet.getRow(rowIdx).getCell(2).value = n.studentName;
        sheet.getRow(rowIdx).getCell(3).value = n.studentEmail;
        sheet.getCell(`D${rowIdx}`).value = n.voteCount;
        sheet.getCell(`D${rowIdx}`).font = { bold: true };
        rowIdx++;
      }
    }
  }

  return workbook.xlsx.writeBuffer();
}
