import express, { Request, Response } from 'express';
import cors from 'cors';
import { Pool } from 'pg';
import Redis from 'redis';
import Bull from 'bull';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// CORS ayarları
app.use(cors());

// JSON gövde verilerini işlemek için middleware
app.use(express.json());

// Temel bir rota
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'OK' });
});

// Sunucuyu başlat
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
