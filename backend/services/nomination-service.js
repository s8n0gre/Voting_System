import { supabase } from '../database/supabase.js';

async function isExecutiveForRole(email, execId) {
  const { data, error } = await supabase
    .from('ExecutiveCandidates')
    .select('email')
    .eq('id', execId)
    .single();
  if (error || !data?.email) return false;
  return data.email.toLowerCase() === email.toLowerCase();
}

export async function getNominations(execId, roleTitle) {
  const { data, error } = await supabase
    .from('Nominations')
    .select('id, executiveCandidateId, roleTitle, studentEmail, studentName, voteCount')
    .eq('executiveCandidateId', execId)
    .eq('roleTitle', roleTitle)
    .order('voteCount', { ascending: false });
  if (error) throw error;
  return data;
}

export async function getNominationById(id) {
  const { data, error } = await supabase
    .from('Nominations')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function nominateSelf(execId, roleTitle, email, name) {
  if (await isExecutiveForRole(email, execId)) {
    return { error: 'Executive leaders cannot nominate themselves for coordinator roles' };
  }

  const { data: existing } = await supabase
    .from('Nominations')
    .select('id')
    .eq('studentEmail', email)
    .maybeSingle();
  if (existing) return { alreadyNominated: true, nomination: existing };

  const { error: insertErr } = await supabase
    .from('Nominations')
    .insert({ executiveCandidateId: execId, roleTitle, studentEmail: email, studentName: name });
  if (insertErr) throw insertErr;

  return { alreadyNominated: false };
}

export async function withdrawNomination(nominationId, email) {
  const { data: nomination, error: findErr } = await supabase
    .from('Nominations')
    .select('id, studentEmail')
    .eq('id', nominationId)
    .single();
  if (findErr || !nomination) return { error: 'Nomination not found' };
  if (nomination.studentEmail.toLowerCase() !== email.toLowerCase()) {
    return { error: 'You can only withdraw your own nomination' };
  }

  await supabase.from('NomineeVotes').delete().eq('nominationId', nominationId);
  await supabase.from('Nominations').delete().eq('id', nominationId);
  return { success: true };
}

export async function getMyNominationsByExec(email, execId) {
  const { data, error } = await supabase
    .from('Nominations')
    .select('*')
    .eq('studentEmail', email)
    .eq('executiveCandidateId', execId);
  if (error) throw error;
  return data;
}

export async function voteForNominee(voterEmail, nominationId) {
  const { data: nomination, error: nomErr } = await supabase
    .from('Nominations')
    .select('id, executiveCandidateId, roleTitle, studentEmail')
    .eq('id', nominationId)
    .single();
  if (nomErr || !nomination) return { error: 'Nomination not found' };

  if (await isExecutiveForRole(voterEmail, nomination.executiveCandidateId)) {
    return { error: 'Executive leaders cannot vote for their own coordinator roles' };
  }

  if (nomination.studentEmail === voterEmail) return { error: 'You cannot vote for yourself' };

  const { data: existingVote } = await supabase
    .from('NomineeVotes')
    .select('id')
    .eq('voterEmail', voterEmail)
    .eq('nominationId', nominationId)
    .maybeSingle();
  if (existingVote) return { error: 'You already voted for this candidate' };

  const { data: priorVotes } = await supabase
    .from('NomineeVotes')
    .select('id, nomination:Nominations(executiveCandidateId, roleTitle)')
    .eq('voterEmail', voterEmail);
  const votedSameRole = (priorVotes || []).some(
    v => v.nomination?.executiveCandidateId === nomination.executiveCandidateId
      && v.nomination?.roleTitle === nomination.roleTitle
  );
  if (votedSameRole) {
    return { error: 'You can only vote for one nominee in this coordinator role' };
  }

  await supabase.from('NomineeVotes').insert({ voterEmail, nominationId });
  const { data: current } = await supabase
    .from('Nominations')
    .select('voteCount')
    .eq('id', nominationId)
    .single();
  await supabase
    .from('Nominations')
    .update({ voteCount: (current?.voteCount || 0) + 1 })
    .eq('id', nominationId);

  return { success: true };
}

export async function getVoterNominationStatus(email) {
  const { data, error } = await supabase
    .from('Nominations')
    .select('id, executiveCandidateId, roleTitle')
    .eq('studentEmail', email);
  if (error) throw error;
  return data;
}
