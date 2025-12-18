
import { pool } from '../db';

async function fixSchema() {
    console.log("🛠️ Fixing Users Schema...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Add is_verified
        console.log("Checking is_verified...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT FALSE;
        `);

        // 2. Add phone
        console.log("Checking phone...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS phone VARCHAR(20);
        `);

        // 3. Add Google ID (for social login)
        console.log("Checking google_id...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255);
        `);

        await client.query('COMMIT');
        console.log("✅ Schema Fixed Successfully");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Schema Fix Failed:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

fixSchema();
