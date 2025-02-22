import { Pool } from 'pg';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
    user: process.env.POSTGRES_USER || 'postgres',
    host: process.env.POSTGRES_HOST || 'localhost',
    database: process.env.POSTGRES_DB || 'autoblog',
    password: process.env.POSTGRES_PASSWORD || 'postgres',
    port: parseInt(process.env.POSTGRES_PORT || '5432'),
});

async function runMigrations() {
    const client = await pool.connect();
    try {
        // Migration tablosunu oluştur
        await client.query(`
            CREATE TABLE IF NOT EXISTS migrations (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                executed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
            );
        `);

        // Migration dosyalarını oku
        const migrationsDir = path.join(__dirname, 'migrations');
        const files = fs.readdirSync(migrationsDir)
            .filter(file => file.endsWith('.sql'))
            .sort();

        // Her migration dosyası için
        for (const file of files) {
            const migrationName = file;

            // Migration daha önce çalıştırılmış mı kontrol et
            const { rows } = await client.query(
                'SELECT id FROM migrations WHERE name = $1',
                [migrationName]
            );

            if (rows.length === 0) {
                // Migration'ı çalıştır
                const sql = fs.readFileSync(
                    path.join(migrationsDir, file),
                    'utf8'
                );

                await client.query(sql);

                // Migration'ı kaydet
                await client.query(
                    'INSERT INTO migrations (name) VALUES ($1)',
                    [migrationName]
                );

                console.log(`Migration başarıyla çalıştırıldı: ${migrationName}`);
            } else {
                console.log(`Migration zaten çalıştırılmış: ${migrationName}`);
            }
        }

        console.log('Tüm migration\'ler başarıyla tamamlandı.');
    } catch (error) {
        console.error('Migration hatası:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

runMigrations().catch(console.error); 