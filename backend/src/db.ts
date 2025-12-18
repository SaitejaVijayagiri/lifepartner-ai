import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false } // Required for Render/Supabase
});

export const checkDbConnection = async () => {
    try {
        const client = await pool.connect();
        client.release();
        console.log("✅ Database Connected Successfully");
        return true;
    } catch (error) {
        console.error("❌ Database Connection Failed:", error);
        return false;
    }
};
