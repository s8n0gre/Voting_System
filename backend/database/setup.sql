-- ============================================================
-- SNOW Campus Community Voting System — Database Setup
-- Run this in your Supabase SQL Editor once before starting the app.
-- ============================================================

CREATE TABLE IF NOT EXISTS "Users" (
  "id" SERIAL PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "hasVoted" INTEGER DEFAULT 0,
  "votedAt" TEXT
);

CREATE TABLE IF NOT EXISTS "ExecutiveCandidates" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "profileImage" TEXT,
  "email" TEXT
);

CREATE TABLE IF NOT EXISTS "SupportingRoles" (
  "id" SERIAL PRIMARY KEY,
  "executiveCandidateId" INTEGER NOT NULL REFERENCES "ExecutiveCandidates"("id"),
  "title" TEXT NOT NULL,
  "responsibilities" TEXT
);

CREATE TABLE IF NOT EXISTS "SupportingCandidates" (
  "id" SERIAL PRIMARY KEY,
  "supportingRoleId" INTEGER NOT NULL REFERENCES "SupportingRoles"("id"),
  "name" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Students" (
  "rollNo" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "department" TEXT,
  "email" TEXT
);

CREATE TABLE IF NOT EXISTS "Votes" (
  "id" SERIAL PRIMARY KEY,
  "voterEmail" TEXT NOT NULL,
  "executiveCandidateId" INTEGER NOT NULL REFERENCES "ExecutiveCandidates"("id"),
  "supportingCandidateId" INTEGER REFERENCES "SupportingCandidates"("id"),
  "supportingStudentRollNo" TEXT REFERENCES "Students"("rollNo"),
  "supportingStudentName" TEXT,
  "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP
);

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

CREATE TABLE IF NOT EXISTS "NomineeVotes" (
  "id" SERIAL PRIMARY KEY,
  "voterEmail" TEXT NOT NULL,
  "nominationId" INTEGER NOT NULL REFERENCES "Nominations"("id"),
  "createdAt" TEXT DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("voterEmail", "nominationId")
);

-- Indexes for query performance
CREATE INDEX IF NOT EXISTS idx_votes_voteremail ON "Votes"("voterEmail");
CREATE INDEX IF NOT EXISTS idx_votes_executive ON "Votes"("executiveCandidateId");
CREATE INDEX IF NOT EXISTS idx_nominations_exec ON "Nominations"("executiveCandidateId");
CREATE INDEX IF NOT EXISTS idx_nominations_role ON "Nominations"("roleTitle");
CREATE INDEX IF NOT EXISTS idx_nominations_student_email ON "Nominations"("studentEmail");
CREATE INDEX IF NOT EXISTS idx_nomineevotes_voter ON "NomineeVotes"("voterEmail");
CREATE INDEX IF NOT EXISTS idx_supportingroles_exec ON "SupportingRoles"("executiveCandidateId");
CREATE INDEX IF NOT EXISTS idx_supportingcandidates_role ON "SupportingCandidates"("supportingRoleId");
CREATE INDEX IF NOT EXISTS idx_students_email ON "Students"("email");
