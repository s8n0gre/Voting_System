import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createSchema } from './schema.js';
import { query, closePool } from './connection.js';

const _dbDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(_dbDir, '.env') });

async function seed() {
  await createSchema();

  await query('TRUNCATE TABLE "NomineeVotes", "Nominations", "Votes", "SupportingCandidates", "SupportingRoles", "ExecutiveCandidates", "Users", "Students" RESTART IDENTITY CASCADE');

  const insertExec = async (name, role, profileImage, email) => {
    const r = await query(
      'INSERT INTO "ExecutiveCandidates" ("name", "role", "profileImage", "email") VALUES ($1, $2, $3, $4) RETURNING "id"',
      [name, role, profileImage, email]
    );
    return r.rows[0].id;
  };

  const insertRole = async (execId, title, responsibilities) => {
    const r = await query(
      'INSERT INTO "SupportingRoles" ("executiveCandidateId", "title", "responsibilities") VALUES ($1, $2, $3) RETURNING "id"',
      [execId, title, responsibilities]
    );
    return r.rows[0].id;
  };

  const insertCandidate = async (roleId, name) => {
    await query(
      'INSERT INTO "SupportingCandidates" ("supportingRoleId", "name") VALUES ($1, $2)',
      [roleId, name]
    );
  };

  // ══════════════════════════════════════════════════════════
  // EXECUTIVE CANDIDATES
  // ══════════════════════════════════════════════════════════

  const presId = await insertExec('Nithish Kanna D', 'President', '/images/nithish_kanna.jpg', '717823s138@kce.ac.in');
  const vpId = await insertExec('Deborshi Kashyap', 'Vice President', '/images/deborshi_kashyap.jpg', '24lita01@karpagamtech.ac.in');
  const secId = await insertExec('Srikeerthi C B', 'Secretary', null, null);
  const tlId = await insertExec('Yuvaraj E', 'Technical Lead', '/images/yuvaraj.jpg', '23ecc62@karpagamtech.ac.in');
  const clId = await insertExec('Mohan K', 'Community Lead', null, '23eea33@karpagamtech.ac.in');
  const cmlId = await insertExec('Navaneetha Krishnan C', 'Creative & Media Lead', '/images/navaneetha_krishnan.jpg', '717823y132@kce.ac.in');

  // ══════════════════════════════════════════════════════════
  // SUPPORTING ROLES
  // ══════════════════════════════════════════════════════════

  await insertRole(presId, "President's Supporting Member",
    'Serve the President\'s office through three core functions: (1) Strategy — develop the annual roadmap, monitor community goals, track performance, and ensure alignment with the community\'s vision and mission. (2) Industry Relations — build relationships with faculty, alumni, industry professionals, and external communities; coordinate guest lectures, partnerships, and networking opportunities. (3) Executive Coordination — support executive meetings, coordinate with all leadership teams, follow up on decisions, and ensure smooth execution of strategic initiatives.');

  await insertRole(vpId, "Vice President's Supporting Member",
    'Serve the Vice President\'s office through three core functions: (1) Operations — manage daily operations, coordinate inter-team activities, monitor task completion, and ensure events and projects are executed on time. (2) Project Coordination — oversee technical and community projects, assign responsibilities, monitor milestones, and maintain project documentation. (3) Resource Management — manage event logistics, lab resources, budgets, inventory, and operational requirements for community activities.');

  await insertRole(secId, "Secretary's Supporting Member",
    'Serve the Secretary\'s office through three core functions: (1) Administration — manage official records, attendance, member registration, and administrative activities. (2) Documentation — prepare meeting minutes, reports, proposals, newsletters, and maintain the community knowledge repository. (3) Communication — handle official announcements, email communications, notices, and internal coordination between members and leadership.');

  await insertRole(tlId, "Technical Lead's Supporting Member",
    'Serve the Technical Lead\'s office through three core functions: (1) Learning — organize technical workshops, bootcamps, certification sessions, and mentoring programs. (2) Project Development — lead application development, hackathons, innovation challenges, and technical collaboration among members. (3) AI & Automation — drive AI initiatives, workflow automation, research on emerging technologies, and platform innovation.');

  await insertRole(clId, "Community Lead's Supporting Member",
    'Serve the Community Lead\'s office through three core functions: (1) Events — plan and execute workshops, seminars, competitions, community meetups, and flagship events. (2) Engagement — increase member participation, manage social media, run campaigns, recruit volunteers, and strengthen community engagement. (3) Partnerships — coordinate collaborations with student clubs, alumni, faculty, and industry organizations while expanding the community network.');

  await insertRole(cmlId, "Creative & Media Lead's Supporting Member",
    'Serve the Creative & Media Lead\'s office through three core functions: (1) Creative Design — design posters, banners, certificates, presentations, and all visual assets for community initiatives. (2) Media Production — capture and edit event photography, videography, promotional videos, and highlight reels. (3) Branding — maintain the community\'s brand identity, content standards, creative templates, and visual consistency across all platforms.');

  // ══════════════════════════════════════════════════════════
  // SUPPORTING CANDIDATES — 3 per executive
  // ══════════════════════════════════════════════════════════

  await insertCandidate(1, 'Aditya Ramesh');
  await insertCandidate(1, 'Bhavana Suresh');
  await insertCandidate(1, 'Charan Kumar');
  await insertCandidate(2, 'Janani Sundaram');
  await insertCandidate(2, 'Karan Bhatia');
  await insertCandidate(2, 'Lavanya Krishnan');
  await insertCandidate(3, 'Tamil Selvan');
  await insertCandidate(3, 'Uma Maheswari');
  await insertCandidate(3, 'Vignesh Babu');
  await insertCandidate(4, 'Deepika Raj');
  await insertCandidate(4, 'Elango S');
  await insertCandidate(4, 'Farida Banu');
  await insertCandidate(5, 'Manikandan S');
  await insertCandidate(5, 'Nandhini G');
  await insertCandidate(5, 'Prashanth T');
  await insertCandidate(6, 'Xavier Raj');
  await insertCandidate(6, 'Yazhini S');
  await insertCandidate(6, 'Zeenat Ara');

  // ══════════════════════════════════════════════════════════
  // STUDENTS — imported from List.csv
  // ══════════════════════════════════════════════════════════
  const csvPath = path.join(_dbDir, '..', '..', 'List.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const email = parts[1].trim().toLowerCase();
      const rollNo = email.split('@')[0];
      await query(
        'INSERT INTO "Students" ("rollNo", "name", "department", "email") VALUES ($1, $2, $3, $4) ON CONFLICT ("rollNo") DO NOTHING',
        [rollNo, name, null, email]
      );
    }
  }
  console.log(`  Imported ${lines.length - 1} students from List.csv.`);
  console.log('Database seeded successfully with SNOW Campus Community data.');
  await closePool();
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
