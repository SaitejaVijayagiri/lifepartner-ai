
import { pool } from '../db';

async function addSocialColumns() {
    const client = await pool.connect();
    try {
        console.log("🛠️ Adding Social Columns...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS google_id VARCHAR(255) UNIQUE,
            ADD COLUMN IF NOT EXISTS apple_id VARCHAR(255) UNIQUE;
        `);
        console.log("✅ Social Columns Added.");
    } catch (e) {
        console.error("❌ Failed to add columns:", e);
    } finally {
        client.release();
        process.exit();
    }
}

addSocialColumns();
