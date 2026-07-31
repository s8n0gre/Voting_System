import pg from 'pg';

const { Pool } = pg;

let pool = null;

function getPoolConfig() {
  const url = process.env.DATABASE_URL || 'postgresql://localhost:5432/voting_system';
  const config = {
    connectionString: url,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
  };
  if (url.includes('supabase.co')) {
    config.ssl = { rejectUnauthorized: false };
  }
  return config;
}

export function getPool() {
  if (!pool) {
    pool = new Pool(getPoolConfig());
  }
  return pool;
}

export async function query(text, params) {
  const p = getPool();
  return p.query(text, params);
}

export async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}
