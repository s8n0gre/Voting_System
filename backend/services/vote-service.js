import { supabase } from '../database/supabase.js';
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
    const { data: role, error: roleErr } = await supabase
      .from('SupportingRoles')
      .select('executiveCandidateId')
      .eq('id', supportingCandidate.supportingRoleId)
      .single();
    if (roleErr || !role || role.executiveCandidateId !== executiveCandidateId) {
      return { success: false, status: 400, error: 'Supporting candidate does not belong to the selected executive' };
    }
  }

  if (supportingStudentRollNo) {
    const { data: student, error: studentErr } = await supabase
      .from('Students')
      .select('rollNo')
      .eq('rollNo', supportingStudentRollNo)
      .maybeSingle();
    if (!student) {
      return { success: false, status: 400, error: 'Student not found' };
    }
  }

  const { data: existingUser } = await supabase
    .from('Users')
    .select('hasVoted')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (existingUser?.hasVoted) {
    return { success: false, status: 409, error: 'You have already voted' };
  }

  const { error: upsertErr } = await supabase
    .from('Users')
    .upsert(
      { email: normalizedEmail, hasVoted: 1, votedAt: new Date().toISOString() },
      { onConflict: 'email', ignoreDuplicates: false }
    );
  if (upsertErr) {
    return { success: false, status: 500, error: 'Failed to record vote' };
  }

  const { error: voteErr } = await supabase
    .from('Votes')
    .insert({
      voterEmail: normalizedEmail,
      executiveCandidateId,
      supportingCandidateId: supportingCandidateId || null,
      supportingStudentRollNo: supportingStudentRollNo || null,
      supportingStudentName: supportingStudentName || null,
    });
  if (voteErr) {
    return { success: false, status: 500, error: 'Failed to record vote' };
  }

  return { success: true, status: 201, message: 'Vote recorded successfully' };
}

export async function getResults() {
  const [
    { data: execRows, error: execErr },
    { data: suppRows, error: suppErr },
    { data: studentRows, error: studentErr },
  ] = await Promise.all([
    supabase
      .from('ExecutiveCandidates')
      .select('id, name, role, votes:Votes(count)'),
    supabase
      .from('SupportingCandidates')
      .select('id, name, role:SupportingRoles(title), votes:Votes(count)'),
    supabase
      .from('Students')
      .select('rollNo, name, department, votes:Votes(count)')
      .not('Votes.id', 'is', null),
  ]);

  const mapRows = (rows) => (rows || []).map(r => ({
    ...r,
    votes: r.votes?.[0]?.count ?? 0,
  }));

  return {
    executiveResults: mapRows(execRows).sort((a, b) => b.votes - a.votes),
    supportingResults: mapRows(suppRows).sort((a, b) => b.votes - a.votes),
    studentResults: mapRows(studentRows || []).sort((a, b) => b.votes - a.votes),
  };
}
