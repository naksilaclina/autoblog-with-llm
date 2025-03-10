-- Şemaları oluştur
CREATE SCHEMA IF NOT EXISTS auth;
CREATE SCHEMA IF NOT EXISTS content;
CREATE SCHEMA IF NOT EXISTS settings;
CREATE SCHEMA IF NOT EXISTS analytics;

-- Uzantıları etkinleştir
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Rolleri oluştur
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_admin') THEN
        CREATE ROLE app_admin LOGIN PASSWORD 'admin_password_change_me';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_editor') THEN
        CREATE ROLE app_editor LOGIN PASSWORD 'editor_password_change_me';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_author') THEN
        CREATE ROLE app_author LOGIN PASSWORD 'author_password_change_me';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_readonly') THEN
        CREATE ROLE app_readonly LOGIN PASSWORD 'readonly_password_change_me';
    END IF;
    IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'app_analytics') THEN
        CREATE ROLE app_analytics LOGIN PASSWORD 'analytics_password_change_me';
    END IF;
END
$$;

-- Tabloları oluştur
-- Settings şeması
CREATE TABLE IF NOT EXISTS settings.configurations (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings.pages (
    key VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth şeması
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    api_key VARCHAR(255),
    api_usage_limit INTEGER DEFAULT 1000,
    api_usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content şeması
CREATE TABLE IF NOT EXISTS content.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES content.categories(id),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(50) NOT NULL,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(50),
    ai_prompt TEXT,
    author_id UUID REFERENCES auth.users(id),
    category_id UUID REFERENCES content.categories(id),
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image UUID,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.post_tags (
    post_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES content.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS content.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    path TEXT NOT NULL,
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    page_path VARCHAR(255) NOT NULL,
    visitor_id VARCHAR(255),
    user_agent TEXT,
    ip_address VARCHAR(45),
    referrer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.content_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_id UUID,
    content_type VARCHAR(50),
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_spent INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Şifreleme fonksiyonları
CREATE OR REPLACE FUNCTION auth.hash_password(password TEXT) RETURNS TEXT AS $$
BEGIN
    RETURN crypt(password, gen_salt('bf', 10));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auth.verify_password(password TEXT, hashed_password TEXT) RETURNS BOOLEAN AS $$
BEGIN
    RETURN hashed_password = crypt(password, hashed_password);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Kullanıcı ID alma fonksiyonu
CREATE OR REPLACE FUNCTION auth.get_user_id() RETURNS UUID AS $$
BEGIN
    RETURN (SELECT id FROM auth.users WHERE email = current_user);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Audit logging için trigger
CREATE TABLE IF NOT EXISTS auth.audit_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    table_name TEXT NOT NULL,
    action TEXT NOT NULL,
    old_data JSONB,
    new_data JSONB,
    changed_by TEXT NOT NULL,
    changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION auth.audit_trigger_func() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'DELETE' THEN
        INSERT INTO auth.audit_log (table_name, action, old_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), current_user);
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO auth.audit_log (table_name, action, old_data, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(OLD), row_to_json(NEW), current_user);
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO auth.audit_log (table_name, action, new_data, changed_by)
        VALUES (TG_TABLE_NAME, TG_OP, row_to_json(NEW), current_user);
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Row Level Security (RLS) etkinleştir
ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE content.media ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics.content_performance ENABLE ROW LEVEL SECURITY;

-- RLS Politikaları
-- Users tablosu için
CREATE POLICY users_isolation_policy ON auth.users
    USING (role = current_user OR current_user = 'app_admin');

-- Posts tablosu için
CREATE POLICY posts_view_policy ON content.posts
    FOR SELECT
    USING (status = 'published' OR author_id = auth.get_user_id() OR current_user = 'app_admin');

CREATE POLICY posts_modify_policy ON content.posts
    FOR ALL
    USING (author_id = auth.get_user_id() OR current_user = 'app_admin');

-- Media tablosu için
CREATE POLICY media_view_policy ON content.media
    FOR SELECT
    USING (true);

CREATE POLICY media_modify_policy ON content.media
    FOR ALL
    USING (uploaded_by = auth.get_user_id() OR current_user = 'app_admin');

-- Analytics için
CREATE POLICY analytics_view_policy ON analytics.content_performance
    FOR SELECT
    USING (current_user = 'app_admin' OR current_user = 'app_analytics');

-- Audit trigger'ları ekle
CREATE TRIGGER audit_users_trigger
    AFTER INSERT OR UPDATE OR DELETE ON auth.users
    FOR EACH ROW EXECUTE FUNCTION auth.audit_trigger_func();

CREATE TRIGGER audit_posts_trigger
    AFTER INSERT OR UPDATE OR DELETE ON content.posts
    FOR EACH ROW EXECUTE FUNCTION auth.audit_trigger_func();

-- Yetkileri ata
REVOKE ALL ON ALL TABLES IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM PUBLIC;

GRANT USAGE ON SCHEMA auth TO app_admin;
GRANT USAGE ON SCHEMA auth TO app_editor, app_author;
GRANT USAGE ON SCHEMA content TO app_admin, app_editor, app_author;
GRANT USAGE ON SCHEMA settings TO app_admin;
GRANT USAGE ON SCHEMA analytics TO app_admin, app_analytics;

-- Tablo yetkileri
GRANT ALL ON ALL TABLES IN SCHEMA auth TO app_admin;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA content TO app_editor;
GRANT SELECT, INSERT ON ALL TABLES IN SCHEMA content TO app_author;
GRANT SELECT ON ALL TABLES IN SCHEMA analytics TO app_analytics;

-- Sequence yetkileri
GRANT USAGE ON ALL SEQUENCES IN SCHEMA auth TO app_admin;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA content TO app_editor, app_author;

-- Materialized view yetkileri
GRANT SELECT ON content.category_stats TO app_admin, app_editor;
GRANT SELECT ON analytics.content_performance_summary TO app_admin, app_analytics;

-- Tabloları oluştur
-- Settings şeması
CREATE TABLE IF NOT EXISTS settings.configurations (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS settings.pages (
    key VARCHAR(100) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Auth şeması
CREATE TABLE IF NOT EXISTS auth.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    api_key VARCHAR(255),
    api_usage_limit INTEGER DEFAULT 1000,
    api_usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.refresh_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS auth.api_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    status_code INTEGER NOT NULL,
    response_time INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Content şeması
CREATE TABLE IF NOT EXISTS content.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    parent_id UUID REFERENCES content.categories(id),
    meta_title VARCHAR(255),
    meta_description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    status VARCHAR(50) NOT NULL,
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(50),
    ai_prompt TEXT,
    author_id UUID REFERENCES auth.users(id),
    category_id UUID REFERENCES content.categories(id),
    meta_title VARCHAR(255),
    meta_description TEXT,
    featured_image UUID,
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(50) NOT NULL,
    slug VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.post_tags (
    post_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES content.tags(id) ON DELETE CASCADE,
    PRIMARY KEY (post_id, tag_id)
);

CREATE TABLE IF NOT EXISTS content.media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    filename VARCHAR(255) NOT NULL,
    filepath VARCHAR(255) NOT NULL,
    cdn_url VARCHAR(255),
    mimetype VARCHAR(100) NOT NULL,
    size INTEGER NOT NULL,
    width INTEGER,
    height INTEGER,
    alt_text VARCHAR(255),
    uploaded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content.publish_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    scheduled_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMP,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Analytics şeması
CREATE TABLE IF NOT EXISTS analytics.page_views (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,
    session_id VARCHAR(255),
    ip_address VARCHAR(45),
    user_agent TEXT,
    referer TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS analytics.content_performance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID REFERENCES content.posts(id) ON DELETE CASCADE,
    views INTEGER DEFAULT 0,
    unique_views INTEGER DEFAULT 0,
    avg_time_on_page INTEGER DEFAULT 0,
    bounce_rate DECIMAL(5,2),
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- İndeksler
-- Kullanıcı aramaları için
CREATE INDEX IF NOT EXISTS idx_users_email ON auth.users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON auth.users(role);
CREATE INDEX IF NOT EXISTS idx_api_logs_user_id ON auth.api_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_created_at ON auth.api_logs(created_at);

-- İçerik aramaları için
CREATE INDEX IF NOT EXISTS idx_posts_slug ON content.posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON content.posts(status);
CREATE INDEX IF NOT EXISTS idx_posts_published_at ON content.posts(published_at);
CREATE INDEX IF NOT EXISTS idx_posts_scheduled_at ON content.posts(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_posts_author_id ON content.posts(author_id);
CREATE INDEX IF NOT EXISTS idx_categories_slug ON content.categories(slug);
CREATE INDEX IF NOT EXISTS idx_tags_slug ON content.tags(slug);

-- Analytics için
CREATE INDEX IF NOT EXISTS idx_page_views_post_id ON analytics.page_views(post_id);
CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON analytics.page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_content_performance_post_id_date ON analytics.content_performance(post_id, date);

-- Materialized Views
-- Kategori istatistikleri
CREATE MATERIALIZED VIEW IF NOT EXISTS content.category_stats AS
SELECT 
    c.id,
    c.name,
    COUNT(p.id) as post_count,
    COUNT(CASE WHEN p.status = 'published' THEN 1 END) as published_count,
    MAX(p.published_at) as last_published
FROM content.categories c
LEFT JOIN content.posts p ON p.category_id = c.id
GROUP BY c.id, c.name;

-- İçerik performans özeti
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics.content_performance_summary AS
SELECT 
    cp.post_id,
    p.title,
    SUM(cp.views) as total_views,
    AVG(cp.avg_time_on_page) as avg_time,
    AVG(cp.bounce_rate) as avg_bounce_rate
FROM analytics.content_performance cp
JOIN content.posts p ON p.id = cp.post_id
GROUP BY cp.post_id, p.title;

-- Varsayılan ayarları ekle
INSERT INTO settings.configurations (key, value, type, description, is_public)
VALUES 
    ('site.name', 'AI Content', 'string', 'Site adı', true),
    ('site.cache_timeout', '60', 'integer', 'Önbellek süresi (saniye)', false),
    ('site.publishing_cron', '*/10 * * * *', 'string', 'Yayınlama zamanlaması', false)
ON CONFLICT (key) DO NOTHING; 