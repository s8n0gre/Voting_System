import { query } from './connection.js';

export async function createSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS "Users" (
      "id" SERIAL PRIMARY KEY,
      "email" TEXT UNIQUE NOT NULL,
      "hasVoted" INTEGER DEFAULT 0,
      "votedAt" TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "ExecutiveCandidates" (
      "id" SERIAL PRIMARY KEY,
      "name" TEXT NOT NULL,
      "role" TEXT NOT NULL,
      "profileImage" TEXT,
      "email" TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "SupportingRoles" (
      "id" SERIAL PRIMARY KEY,
      "executiveCandidateId" INTEGER NOT NULL REFERENCES "ExecutiveCandidates"("id"),
      "title" TEXT NOT NULL,
      "responsibilities" TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "SupportingCandidates" (
      "id" SERIAL PRIMARY KEY,
      "supportingRoleId" INTEGER NOT NULL REFERENCES "SupportingRoles"("id"),
      "name" TEXT NOT NULL
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "Students" (
      "rollNo" TEXT PRIMARY KEY,
      "name" TEXT NOT NULL,
      "department" TEXT,
      "email" TEXT
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "Votes" (
      "id" SERIAL PRIMARY KEY,
      "voterEmail" TEXT UNIQUE NOT NULL,
      "executiveCandidateId" INTEGER NOT NULL REFERENCES "ExecutiveCandidates"("id"),
      "supportingCandidateId" INTEGER REFERENCES "SupportingCandidates"("id"),
      "supportingStudentRollNo" TEXT REFERENCES "Students"("rollNo"),
      "supportingStudentName" TEXT,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "Nominations" (
      "id" SERIAL PRIMARY KEY,
      "executiveCandidateId" INTEGER NOT NULL REFERENCES "ExecutiveCandidates"("id"),
      "roleTitle" TEXT NOT NULL,
      "studentEmail" TEXT NOT NULL,
      "studentName" TEXT NOT NULL,
      "voteCount" INTEGER DEFAULT 0,
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("executiveCandidateId", "roleTitle", "studentEmail")
    );
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS "NomineeVotes" (
      "id" SERIAL PRIMARY KEY,
      "voterEmail" TEXT NOT NULL,
      "nominationId" INTEGER NOT NULL REFERENCES "Nominations"("id"),
      "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
      UNIQUE("voterEmail", "nominationId")
    );
  `);
}
