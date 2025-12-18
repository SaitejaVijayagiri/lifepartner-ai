
import { pool } from '../db';

async function addStoriesColumn() {
    try {
        const client = await pool.connect();
        console.log("🛠️ Adding 'stories' column to profiles table...");

        await client.query(`
            ALTER TABLE public.profiles 
            ADD COLUMN IF NOT EXISTS stories JSONB DEFAULT '[]'::jsonb;
        `);

        console.log("✅ Column 'stories' added successfully.");
        client.release();
    } catch (e) {
        console.error("Migration Failed", e);
    }
}

addStoriesColumn();
