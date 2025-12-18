
import { pool } from '../db';

async function fixNullMetadata() {
    try {
        const client = await pool.connect();
        console.log("🛠️ Fixing NULL metadata...");

        const res = await client.query(`
            UPDATE public.profiles 
            SET metadata = '{}'::jsonb 
            WHERE metadata IS NULL
        `);

        console.log(`✅ Fixed ${res.rowCount} profiles.`);
        client.release();
    } catch (e) {
        console.error("Migration Failed", e);
    }
}

fixNullMetadata();
