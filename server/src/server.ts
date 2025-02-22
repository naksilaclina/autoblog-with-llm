import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppError } from './utils/AppError';
import pool from './config/database';
import redisClient from './config/redis';
import v1Routes from './routes/v1';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1', v1Routes);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      code: err.errorCode,
      message: err.message,
    });
  }

  console.error(err);
  return res.status(500).json({
    status: 'error',
    code: 'INTERNAL_ERROR',
    message: 'Internal server error',
  });
});

// Veritabanı ve Redis bağlantılarını başlat
const startServer = async () => {
  try {
    await redisClient.connect();
    await pool.connect();
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer(); 