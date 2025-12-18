import { Pool } from 'pg';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

// 1. PostgreSQL Connection (For Core Data & Vector Search)
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    max: 20, // Scalability: limit pool size
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// 2. Supabase Client (For Storage mainly, can also be used for DB)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Helper to check connection
export const checkDbConnection = async () => {
    try {
        const client = await pool.connect();
        const res = await client.query('SELECT NOW()');
        client.release();
        console.log('✅ Database connected:', res.rows[0].now);
        return true;
    } catch (err) {
        console.error('❌ Database connection failed', err);
        return false;
    }
};
