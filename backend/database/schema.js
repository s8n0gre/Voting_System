import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const _schemaDir = path.dirname(fileURLToPath(import.meta.url));

export async function createSchema() {
  console.log('Schema must be created via Supabase SQL Editor.');
  console.log(`Run the SQL from ${path.join(_schemaDir, 'setup.sql')} in your Supabase dashboard.`);
}
