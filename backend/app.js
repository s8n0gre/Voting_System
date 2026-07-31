import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const _appDir = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(_appDir, '.env') });

import { createSchema } from './database/schema.js';
import authRoutes from './routes/auth-routes.js';
import roleRoutes from './routes/role-routes.js';
import voteRoutes from './routes/vote-routes.js';
import nominationRoutes from './routes/nomination-routes.js';
import exportRoutes from './routes/export-routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', authRoutes);
app.use('/api', roleRoutes);
app.use('/api', voteRoutes);
app.use('/api', nominationRoutes);
app.use('/api', exportRoutes);

app.use(errorHandler);

export default app;

export async function initDb() {
  await createSchema();
}
