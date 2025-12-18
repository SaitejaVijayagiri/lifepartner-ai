
import { pool } from '../db';

async function addAvatarColumn() {
    const client = await pool.connect();
    try {
        console.log("🛠️ Adding Avatar Column...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS avatar_url TEXT;
        `);
        console.log("✅ Avatar Column Added.");
    } catch (e) {
        console.error("❌ Failed to add avatar column:", e);
    } finally {
        client.release();
        process.exit();
    }
}

addAvatarColumn();
