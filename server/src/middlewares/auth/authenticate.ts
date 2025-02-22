import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError, ErrorCodes } from '../../utils/AppError';

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authenticate = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new AppError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
      id: string;
      role: string;
    };

    req.user = decoded;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Invalid token', 401, ErrorCodes.UNAUTHORIZED));
    } else {
      next(error);
    }
  }
}; 