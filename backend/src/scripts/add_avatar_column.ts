import { pool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        const client = await pool.connect();
        console.log("Adding avatar_url...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        `);
        console.log("✅ Avatar URL added");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration Failed", e);
        process.exit(1);
    }
}
migrate();
