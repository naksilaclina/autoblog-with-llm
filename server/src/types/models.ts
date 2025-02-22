export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: 'admin' | 'editor' | 'author';
  api_key?: string;
  api_usage_limit: number;
  api_usage_count: number;
  is_active: boolean;
  last_login?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  status: 'draft' | 'published' | 'scheduled';
  is_ai_generated: boolean;
  ai_model?: string;
  ai_prompt?: string;
  author_id: string;
  category_id: string;
  meta_title?: string;
  meta_description?: string;
  featured_image?: string;
  scheduled_at?: Date;
  published_at?: Date;
  created_at: Date;
  updated_at: Date;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  parent_id?: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at: Date;
}

export interface Media {
  id: string;
  filename: string;
  filepath: string;
  cdn_url?: string;
  mimetype: string;
  size: number;
  width?: number;
  height?: number;
  alt_text?: string;
  uploaded_by: string;
  created_at: Date;
}

export interface Settings {
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  is_public: boolean;
  updated_at: Date;
}

export interface Page {
  key: string;
  title: string;
  content: string;
  meta_title?: string;
  meta_description?: string;
  is_active: boolean;
  updated_at: Date;
} 