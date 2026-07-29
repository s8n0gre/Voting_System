import serverless from 'serverless-http';
import app, { initDb } from '../../backend/app.js';

const serverlessHandler = serverless(app);

let dbInitPromise = null;

export const handler = async (event, context) => {
  if (!dbInitPromise) {
    dbInitPromise = initDb();
  }
  await dbInitPromise;
  return serverlessHandler(event, context);
};
