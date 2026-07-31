import express from 'express';
import app from '../backend/app.js';

const handler = express();

handler.use((req, _res, next) => {
  if (!req.url.startsWith('/api')) {
    req.url = `/api${req.url}`;
  }
  next();
});

handler.use(app);

export default handler;
