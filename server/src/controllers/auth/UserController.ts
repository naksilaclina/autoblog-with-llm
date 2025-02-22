import { Request, Response, NextFunction } from 'express';
import { UserService } from '../../services/auth/UserService';
import { AppError, ErrorCodes } from '../../utils/AppError';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, full_name, role } = req.body;

      if (!email || !password || !full_name) {
        throw new AppError('Missing required fields', 400, ErrorCodes.VALIDATION_ERROR);
      }

      const result = await this.userService.register({
        email,
        password,
        full_name,
        role,
      });

      res.status(201).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError('Missing required fields', 400, ErrorCodes.VALIDATION_ERROR);
      }

      const result = await this.userService.login(email, password);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  updateProfile = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED);
      }

      const result = await this.userService.updateProfile(req.user.id, req.body);

      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  };

  generateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?.id) {
        throw new AppError('Unauthorized', 401, ErrorCodes.UNAUTHORIZED);
      }

      const apiKey = await this.userService.generateApiKey(req.user.id);

      res.status(200).json({
        status: 'success',
        data: { apiKey },
      });
    } catch (error) {
      next(error);
    }
  };
} 