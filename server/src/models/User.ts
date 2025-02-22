import { Pool } from 'pg';
import { User } from '../types/models';
import pool from '../config/database';

export class UserModel {
  private pool: Pool;

  constructor() {
    this.pool = pool;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT * FROM auth.users 
      WHERE id = $1 AND is_active = true
    `;
    const result = await this.pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT * FROM auth.users 
      WHERE email = $1 AND is_active = true
    `;
    const result = await this.pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async create(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const query = `
      INSERT INTO auth.users (
        email, password_hash, full_name, role, 
        api_key, api_usage_limit, api_usage_count, 
        is_active, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW()
      ) RETURNING *
    `;
    
    const values = [
      user.email,
      user.password_hash,
      user.full_name,
      user.role,
      user.api_key,
      user.api_usage_limit,
      user.api_usage_count,
      user.is_active
    ];

    const result = await this.pool.query(query, values);
    return result.rows[0];
  }

  async update(id: string, user: Partial<User>): Promise<User | null> {
    const setClause = Object.keys(user)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const query = `
      UPDATE auth.users 
      SET ${setClause}, updated_at = NOW()
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...Object.values(user)];
    const result = await this.pool.query(query, values);
    return result.rows[0] || null;
  }

  async delete(id: string): Promise<boolean> {
    const query = `
      UPDATE auth.users 
      SET is_active = false, updated_at = NOW()
      WHERE id = $1
    `;
    const result = await this.pool.query(query, [id]);
    return result.rowCount > 0;
  }
} 