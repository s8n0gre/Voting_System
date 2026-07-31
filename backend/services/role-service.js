import { supabase } from '../database/supabase.js';

export async function getAllExecutiveCandidates() {
  const { data, error } = await supabase.from('ExecutiveCandidates').select('*');
  if (error) throw error;
  return data;
}

export async function getSupportingRolesByExecutive(executiveCandidateId) {
  const { data, error } = await supabase
    .from('SupportingRoles')
    .select('*')
    .eq('executiveCandidateId', executiveCandidateId);
  if (error) throw error;
  return data;
}

export async function getSupportingRoleById(roleId) {
  const { data, error } = await supabase
    .from('SupportingRoles')
    .select('*')
    .eq('id', roleId)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getExecutiveCandidateById(id) {
  const { data, error } = await supabase
    .from('ExecutiveCandidates')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getSupportingCandidateById(id) {
  const { data, error } = await supabase
    .from('SupportingCandidates')
    .select('*')
    .eq('id', id)
    .single();
  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

export async function getCandidatesBySupportingRole(supportingRoleId) {
  const { data, error } = await supabase
    .from('SupportingCandidates')
    .select('*')
    .eq('supportingRoleId', supportingRoleId);
  if (error) throw error;
  return data;
}

export async function getStudentByEmail(email) {
  const { data, error } = await supabase
    .from('Students')
    .select('*')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return data || null;
}

export async function getStudents(search) {
  let query = supabase.from('Students').select('*').order('name');
  if (search) {
    const pattern = `%${search.toLowerCase()}%`;
    query = query.or(`name.ilike.${pattern},email.ilike.${pattern}`);
  }
  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function getVoterStatus(email) {
  const { data, error } = await supabase
    .from('Users')
    .select('hasVoted')
    .eq('email', email.toLowerCase())
    .maybeSingle();
  if (error) throw error;
  return { hasVoted: data ? !!data.hasVoted : false };
}
