import { scrypt as _scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { supabase } from '../database/supabase.js';

const scrypt = promisify(_scrypt);
const KEYLEN = 64;

function isValidInstitutionEmail(email) {
  if (!email || typeof email !== 'string') return false;
  const normalized = email.trim().toLowerCase();
  return normalized.endsWith('@kce.ac.in') || normalized.endsWith('@karpagamtech.ac.in');
}

async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const hash = await scrypt(password, salt, KEYLEN);
  return `scrypt$${salt}$${hash.toString('hex')}`;
}

async function verifyPassword(password, stored) {
  if (!stored || !stored.startsWith('scrypt$')) return false;
  const parts = stored.split('$');
  if (parts.length !== 3) return false;
  const [, salt, hash] = parts;
  const computed = await scrypt(password, salt, KEYLEN);
  const a = Buffer.from(computed);
  const b = Buffer.from(hash, 'hex');
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function registerUser(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!isValidInstitutionEmail(normalizedEmail)) {
    return { success: false, status: 400, error: 'Only institutional emails are allowed' };
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    return { success: false, status: 400, error: 'Password must be at least 6 characters' };
  }

  const { data: student } = await supabase
    .from('Students')
    .select('name')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (!student) {
    return { success: false, status: 400, error: 'This email is not in the registered student list' };
  }

  const { data: existing } = await supabase
    .from('Users')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();
  if (existing) {
    return { success: false, status: 409, error: 'An account already exists for this email. Please sign in.' };
  }

  const passwordHash = await hashPassword(password);
  const { error } = await supabase
    .from('Users')
    .insert({ email: normalizedEmail, password: passwordHash, hasVoted: 0 });
  if (error) {
    if (error.code === '23505') {
      return { success: false, status: 409, error: 'An account already exists for this email. Please sign in.' };
    }
    return { success: false, status: 500, error: 'Failed to create account' };
  }

  return { success: true, status: 201, name: student.name };
}

export async function loginUser(email, password) {
  const normalizedEmail = (email || '').trim().toLowerCase();

  if (!isValidInstitutionEmail(normalizedEmail)) {
    return { success: false, status: 400, error: 'Only institutional emails are allowed' };
  }

  if (!password || typeof password !== 'string') {
    return { success: false, status: 401, error: 'Password is required' };
  }

  const { data: user } = await supabase
    .from('Users')
    .select('email, password')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (!user || !user.password) {
    return { success: false, status: 401, error: 'No account found for this email. Please register first.' };
  }

  const valid = await verifyPassword(password, user.password);
  if (!valid) {
    return { success: false, status: 401, error: 'Incorrect password' };
  }

  const { data: student } = await supabase
    .from('Students')
    .select('name')
    .eq('email', normalizedEmail)
    .maybeSingle();

  return {
    success: true,
    status: 200,
    name: student?.name || normalizedEmail.split('@')[0],
  };
}
