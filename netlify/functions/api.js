import serverless from 'serverless-http';
import app, { initDb } from '../../backend/app.js';

await initDb();

export const handler = serverless(app);
