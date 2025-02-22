import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User } from '../../types/models';
import { UserModel } from '../../models/User';
import { AppError, ErrorCodes } from '../../utils/AppError';

export class UserService {
  private userModel: UserModel;

  constructor() {
    this.userModel = new UserModel();
  }

  async register(userData: {
    email: string;
    password: string;
    full_name: string;
    role?: 'admin' | 'editor' | 'author';
  }): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const existingUser = await this.userModel.findByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already exists', 400, ErrorCodes.VALIDATION_ERROR);
    }

    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash(userData.password, salt);

    const user = await this.userModel.create({
      email: userData.email,
      password_hash,
      full_name: userData.full_name,
      role: userData.role || 'author',
      api_usage_limit: 1000,
      api_usage_count: 0,
      is_active: true,
    });

    const token = this.generateToken(user);
    const { password_hash: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>, token: string }> {
    const user = await this.userModel.findByEmail(email);
    if (!user) {
      throw new AppError('Invalid credentials', 401, ErrorCodes.UNAUTHORIZED);
    }

    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    if (!isValidPassword) {
      throw new AppError('Invalid credentials', 401, ErrorCodes.UNAUTHORIZED);
    }

    const token = this.generateToken(user);
    const { password_hash: _, ...userWithoutPassword } = user;

    await this.userModel.update(user.id, { last_login: new Date() });

    return { user: userWithoutPassword, token };
  }

  private generateToken(user: User): string {
    const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
    return jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn }
    );
  }

  async updateProfile(userId: string, data: Partial<User>): Promise<Omit<User, 'password_hash'> | null> {
    const user = await this.userModel.update(userId, data);
    if (!user) {
      throw new AppError('User not found', 404, ErrorCodes.NOT_FOUND);
    }

    const { password_hash: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateApiKey(userId: string): Promise<string> {
    const apiKey = jwt.sign(
      { id: userId, type: 'api' },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '1y' }
    );

    await this.userModel.update(userId, { api_key: apiKey });
    return apiKey;
  }
} 