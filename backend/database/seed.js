import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { supabase } from './supabase.js';

const _seedDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(_seedDir, '..', '.env') });

async function seed() {
  const tables = ['NomineeVotes', 'Nominations', 'Votes', 'SupportingCandidates', 'SupportingRoles', 'ExecutiveCandidates', 'Users', 'Students'];
  for (const t of tables) {
    const { error } = await supabase.from(t).delete().neq(t === 'Students' ? 'rollNo' : 'id', 0);
    if (error) console.error(`  Failed to clear ${t}:`, error.message);
  }

  const insertExec = async (name, role, profileImage, email) => {
    const { data, error } = await supabase
      .from('ExecutiveCandidates')
      .insert({ name, role, profileImage, email })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  };

  const insertRole = async (execId, title, responsibilities) => {
    const { data, error } = await supabase
      .from('SupportingRoles')
      .insert({ executiveCandidateId: execId, title, responsibilities })
      .select('id')
      .single();
    if (error) throw error;
    return data.id;
  };

  const insertCandidate = async (roleId, name) => {
    const { error } = await supabase
      .from('SupportingCandidates')
      .insert({ supportingRoleId: roleId, name });
    if (error) console.error(`  Failed to insert candidate ${name}:`, error.message);
  };

  const presId = await insertExec('Nithish Kanna D', 'President', '/images/nithish_kanna.jpg', '717823s138@kce.ac.in');
  const vpId = await insertExec('Deborshi Kashyap', 'Vice President', '/images/deborshi_kashyap.jpg', '24lita01@karpagamtech.ac.in');
  const secId = await insertExec('Srikeerthi C B', 'Secretary', null, null);
  const tlId = await insertExec('Yuvaraj E', 'Technical Lead', '/images/yuvaraj.jpg', '23ecc62@karpagamtech.ac.in');
  const clId = await insertExec('Mohan K', 'Community Lead', null, '23eea33@karpagamtech.ac.in');
  const cmlId = await insertExec('Navaneetha Krishnan C', 'Creative & Media Lead', '/images/navaneetha_krishnan.jpg', '717823y132@kce.ac.in');

  const presRoleId = await insertRole(presId, "President's Supporting Member",
    'Serve the President\'s office through three core functions: (1) Strategy — develop the annual roadmap, monitor community goals, track performance, and ensure alignment with the community\'s vision and mission. (2) Industry Relations — build relationships with faculty, alumni, industry professionals, and external communities; coordinate guest lectures, partnerships, and networking opportunities. (3) Executive Coordination — support executive meetings, coordinate with all leadership teams, follow up on decisions, and ensure smooth execution of strategic initiatives.');

  const vpRoleId = await insertRole(vpId, "Vice President's Supporting Member",
    'Serve the Vice President\'s office through three core functions: (1) Operations — manage daily operations, coordinate inter-team activities, monitor task completion, and ensure events and projects are executed on time. (2) Project Coordination — oversee technical and community projects, assign responsibilities, monitor milestones, and maintain project documentation. (3) Resource Management — manage event logistics, lab resources, budgets, inventory, and operational requirements for community activities.');

  const secRoleId = await insertRole(secId, "Secretary's Supporting Member",
    'Serve the Secretary\'s office through three core functions: (1) Administration — manage official records, attendance, member registration, and administrative activities. (2) Documentation — prepare meeting minutes, reports, proposals, newsletters, and maintain the community knowledge repository. (3) Communication — handle official announcements, email communications, notices, and internal coordination between members and leadership.');

  const tlRoleId = await insertRole(tlId, "Technical Lead's Supporting Member",
    'Serve the Technical Lead\'s office through three core functions: (1) Learning — organize technical workshops, bootcamps, certification sessions, and mentoring programs. (2) Project Development — lead application development, hackathons, innovation challenges, and technical collaboration among members. (3) AI & Automation — drive AI initiatives, workflow automation, research on emerging technologies, and platform innovation.');

  const clRoleId = await insertRole(clId, "Community Lead's Supporting Member",
    'Serve the Community Lead\'s office through three core functions: (1) Events — plan and execute workshops, seminars, competitions, community meetups, and flagship events. (2) Engagement — increase member participation, manage social media, run campaigns, recruit volunteers, and strengthen community engagement. (3) Partnerships — coordinate collaborations with student clubs, alumni, faculty, and industry organizations while expanding the community network.');

  const cmlRoleId = await insertRole(cmlId, "Creative & Media Lead's Supporting Member",
    'Serve the Creative & Media Lead\'s office through three core functions: (1) Creative Design — design posters, banners, certificates, presentations, and all visual assets for community initiatives. (2) Media Production — capture and edit event photography, videography, promotional videos, and highlight reels. (3) Branding — maintain the community\'s brand identity, content standards, creative templates, and visual consistency across all platforms.');

  await insertCandidate(presRoleId, 'Aditya Ramesh');
  await insertCandidate(presRoleId, 'Bhavana Suresh');
  await insertCandidate(presRoleId, 'Charan Kumar');
  await insertCandidate(vpRoleId, 'Janani Sundaram');
  await insertCandidate(vpRoleId, 'Karan Bhatia');
  await insertCandidate(vpRoleId, 'Lavanya Krishnan');
  await insertCandidate(secRoleId, 'Tamil Selvan');
  await insertCandidate(secRoleId, 'Uma Maheswari');
  await insertCandidate(secRoleId, 'Vignesh Babu');
  await insertCandidate(tlRoleId, 'Deepika Raj');
  await insertCandidate(tlRoleId, 'Elango S');
  await insertCandidate(tlRoleId, 'Farida Banu');
  await insertCandidate(clRoleId, 'Manikandan S');
  await insertCandidate(clRoleId, 'Nandhini G');
  await insertCandidate(clRoleId, 'Prashanth T');
  await insertCandidate(cmlRoleId, 'Xavier Raj');
  await insertCandidate(cmlRoleId, 'Yazhini S');
  await insertCandidate(cmlRoleId, 'Zeenat Ara');

  const csvPath = path.join(_seedDir, '..', '..', 'List.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.trim().split('\n');
  let imported = 0;

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 2) {
      const name = parts[0].trim();
      const email = parts[1].trim().toLowerCase();
      const department = parts[2] ? parts[2].trim() : null;
      const rollNo = email.split('@')[0];
      const { error } = await supabase
        .from('Students')
        .upsert({ rollNo, name, department, email }, { onConflict: 'rollNo', ignoreDuplicates: true });
      if (!error) imported++;
    }
  }
  console.log(`  Imported ${imported} students from List.csv.`);
  console.log('Database seeded successfully with SNOW Campus Community data.');
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
