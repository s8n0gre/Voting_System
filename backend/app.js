import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '.env') });

import { createSchema } from './database/schema.js';
import roleRoutes from './routes/role-routes.js';
import voteRoutes from './routes/vote-routes.js';
import nominationRoutes from './routes/nomination-routes.js';
import exportRoutes from './routes/export-routes.js';
import { errorHandler } from './middleware/error-handler.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', roleRoutes);
app.use('/api', voteRoutes);
app.use('/api', nominationRoutes);
app.use('/api', exportRoutes);

app.use(errorHandler);

export default app;

export async function initDb() {
  await createSchema();
}
