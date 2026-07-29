import { query } from '../database/connection.js';

async function isExecutiveForRole(email, execId) {
  const result = await query('SELECT * FROM "ExecutiveCandidates" WHERE "id" = $1', [execId]);
  const exec = result.rows[0];
  if (!exec || !exec.email) return false;
  return exec.email.toLowerCase() === email.toLowerCase();
}

export async function getNominations(execId, roleTitle) {
  const result = await query(
    'SELECT * FROM "Nominations" WHERE "executiveCandidateId" = $1 AND "roleTitle" = $2 ORDER BY "voteCount" DESC',
    [execId, roleTitle]
  );
  return result.rows;
}

export async function getNominationById(id) {
  const result = await query('SELECT * FROM "Nominations" WHERE "id" = $1', [id]);
  return result.rows[0];
}

export async function nominateSelf(execId, roleTitle, email, name) {
  if (await isExecutiveForRole(email, execId)) {
    return { error: 'Executive leaders cannot nominate themselves for coordinator roles' };
  }

  const existingUnderExec = await query(
    'SELECT * FROM "Nominations" WHERE "executiveCandidateId" = $1 AND "studentEmail" = $2',
    [execId, email]
  );
  if (existingUnderExec.rows[0]) {
    return { error: 'You can only nominate yourself for one role under this executive. Withdraw your existing nomination first.' };
  }

  const existing = await query(
    'SELECT * FROM "Nominations" WHERE "executiveCandidateId" = $1 AND "roleTitle" = $2 AND "studentEmail" = $3',
    [execId, roleTitle, email]
  );
  if (existing.rows[0]) return { alreadyNominated: true, nomination: existing.rows[0] };

  await query(
    'INSERT INTO "Nominations" ("executiveCandidateId", "roleTitle", "studentEmail", "studentName") VALUES ($1, $2, $3, $4)',
    [execId, roleTitle, email, name]
  );
  return { alreadyNominated: false };
}

export async function withdrawNomination(nominationId, email) {
  const nomResult = await query('SELECT * FROM "Nominations" WHERE "id" = $1', [nominationId]);
  const nomination = nomResult.rows[0];
  if (!nomination) return { error: 'Nomination not found' };
  if (nomination.studentEmail.toLowerCase() !== email.toLowerCase()) {
    return { error: 'You can only withdraw your own nomination' };
  }

  await query('DELETE FROM "NomineeVotes" WHERE "nominationId" = $1', [nominationId]);
  await query('DELETE FROM "Nominations" WHERE "id" = $1', [nominationId]);
  return { success: true };
}

export async function getMyNominationsByExec(email, execId) {
  const result = await query(
    'SELECT * FROM "Nominations" WHERE "studentEmail" = $1 AND "executiveCandidateId" = $2',
    [email, execId]
  );
  return result.rows;
}

export async function voteForNominee(voterEmail, nominationId) {
  const nomResult = await query('SELECT * FROM "Nominations" WHERE "id" = $1', [nominationId]);
  const nomination = nomResult.rows[0];
  if (!nomination) return { error: 'Nomination not found' };

  if (await isExecutiveForRole(voterEmail, nomination.executiveCandidateId)) {
    return { error: 'Executive leaders cannot vote for their own coordinator roles' };
  }

  const isSelf = nomination.studentEmail === voterEmail;
  if (isSelf) return { error: 'You cannot vote for yourself' };

  const existingVote = await query(
    'SELECT * FROM "NomineeVotes" WHERE "voterEmail" = $1 AND "nominationId" = $2',
    [voterEmail, nominationId]
  );
  if (existingVote.rows[0]) return { error: 'You already voted for this candidate' };

  await query('INSERT INTO "NomineeVotes" ("voterEmail", "nominationId") VALUES ($1, $2)', [voterEmail, nominationId]);
  await query('UPDATE "Nominations" SET "voteCount" = "voteCount" + 1 WHERE "id" = $1', [nominationId]);
  return { success: true };
}

export async function getVoterNominationStatus(email) {
  const result = await query(
    'SELECT "id", "executiveCandidateId", "roleTitle" FROM "Nominations" WHERE "studentEmail" = $1',
    [email]
  );
  return result.rows;
}
