import { query } from '../database/connection.js';

export async function getAllExecutiveCandidates() {
  const result = await query('SELECT * FROM "ExecutiveCandidates"');
  return result.rows;
}

export async function getSupportingRolesByExecutive(executiveCandidateId) {
  const result = await query('SELECT * FROM "SupportingRoles" WHERE "executiveCandidateId" = $1', [executiveCandidateId]);
  return result.rows;
}

export async function getSupportingRoleById(roleId) {
  const result = await query('SELECT * FROM "SupportingRoles" WHERE "id" = $1', [roleId]);
  return result.rows[0];
}

export async function getSupportingCandidates(supportingRoleId) {
  const result = await query('SELECT * FROM "SupportingCandidates" WHERE "supportingRoleId" = $1', [supportingRoleId]);
  return result.rows;
}

export async function getExecutiveCandidateById(id) {
  const result = await query('SELECT * FROM "ExecutiveCandidates" WHERE "id" = $1', [id]);
  return result.rows[0];
}

export async function getSupportingCandidateById(id) {
  const result = await query('SELECT * FROM "SupportingCandidates" WHERE "id" = $1', [id]);
  return result.rows[0];
}

export async function getStudentByEmail(email) {
  const result = await query('SELECT * FROM "Students" WHERE LOWER("email") = $1', [email.toLowerCase()]);
  return result.rows[0];
}

export async function getStudents(search) {
  if (search) {
    const result = await query(
      'SELECT * FROM "Students" WHERE LOWER("name") LIKE $1 OR LOWER("email") LIKE $1 ORDER BY "name"',
      [`%${search.toLowerCase()}%`]
    );
    return result.rows;
  }
  const result = await query('SELECT * FROM "Students" ORDER BY "name"');
  return result.rows;
}

export async function getVoterStatus(email) {
  const result = await query('SELECT "hasVoted" FROM "Users" WHERE "email" = $1', [email]);
  const user = result.rows[0];
  return { hasVoted: user ? !!user.hasVoted : false };
}
