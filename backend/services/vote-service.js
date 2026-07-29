import { query } from '../database/connection.js';
import { getExecutiveCandidateById, getSupportingCandidateById } from './role-service.js';

function isValidInstitutionEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@kce.ac.in') || normalized.endsWith('@karpagamtech.ac.in');
}

export async function castVote(email, executiveCandidateId, supportingCandidateId, supportingStudentRollNo, supportingStudentName) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!isValidInstitutionEmail(normalizedEmail)) {
    return { success: false, status: 400, error: 'Only institutional emails are allowed' };
  }

  if (!executiveCandidateId) {
    return { success: false, status: 400, error: 'Executive candidate is required' };
  }

  if (!supportingCandidateId && !supportingStudentRollNo) {
    return { success: false, status: 400, error: 'A supporting candidate or student is required' };
  }

  const executiveCandidate = await getExecutiveCandidateById(executiveCandidateId);
  if (!executiveCandidate) {
    return { success: false, status: 400, error: 'Executive candidate not found' };
  }

  if (supportingCandidateId) {
    const supportingCandidate = await getSupportingCandidateById(supportingCandidateId);
    if (!supportingCandidate) {
      return { success: false, status: 400, error: 'Supporting candidate not found' };
    }
    const roleResult = await query('SELECT * FROM "SupportingRoles" WHERE "id" = $1', [supportingCandidate.supportingRoleId]);
    const role = roleResult.rows[0];
    if (!role || role.executiveCandidateId !== executiveCandidateId) {
      return { success: false, status: 400, error: 'Supporting candidate does not belong to the selected executive' };
    }
  }

  if (supportingStudentRollNo) {
    const studentResult = await query('SELECT * FROM "Students" WHERE "rollNo" = $1', [supportingStudentRollNo]);
    const student = studentResult.rows[0];
    if (!student) {
      return { success: false, status: 400, error: 'Student not found' };
    }
  }

  const existingUser = await query('SELECT * FROM "Users" WHERE "email" = $1', [normalizedEmail]);
  if (existingUser.rows[0] && existingUser.rows[0].hasVoted) {
    return { success: false, status: 409, error: 'You have already voted' };
  }

  if (!existingUser.rows[0]) {
    await query('INSERT INTO "Users" ("email", "hasVoted", "votedAt") VALUES ($1, 1, CURRENT_TIMESTAMP)', [normalizedEmail]);
  } else {
    await query('UPDATE "Users" SET "hasVoted" = 1, "votedAt" = CURRENT_TIMESTAMP WHERE "email" = $1', [normalizedEmail]);
  }

  await query(
    'INSERT INTO "Votes" ("voterEmail", "executiveCandidateId", "supportingCandidateId", "supportingStudentRollNo", "supportingStudentName") VALUES ($1, $2, $3, $4, $5)',
    [normalizedEmail, executiveCandidateId, supportingCandidateId || null, supportingStudentRollNo || null, supportingStudentName || null]
  );

  return { success: true, status: 201, message: 'Vote recorded successfully' };
}

export async function getResults() {
  const executiveResult = await query(`
    SELECT ec."id", ec."name", ec."role", COUNT(v."id") AS votes
    FROM "ExecutiveCandidates" ec
    LEFT JOIN "Votes" v ON ec."id" = v."executiveCandidateId"
    GROUP BY ec."id"
    ORDER BY votes DESC
  `);

  const supportingResult = await query(`
    SELECT sc."id", sc."name", sr."title" AS role, COUNT(v."id") AS votes
    FROM "SupportingCandidates" sc
    JOIN "SupportingRoles" sr ON sc."supportingRoleId" = sr."id"
    LEFT JOIN "Votes" v ON sc."id" = v."supportingCandidateId"
    GROUP BY sc."id"
    ORDER BY votes DESC
  `);

  const studentResult = await query(`
    SELECT s."rollNo", s."name", s."department", COUNT(v."id") AS votes
    FROM "Students" s
    JOIN "Votes" v ON s."rollNo" = v."supportingStudentRollNo"
    GROUP BY s."rollNo"
    ORDER BY votes DESC
  `);

  return {
    executiveResults: executiveResult.rows,
    supportingResults: supportingResult.rows,
    studentResults: studentResult.rows,
  };
}
