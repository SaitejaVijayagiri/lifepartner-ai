
import { pool } from '../db';

async function fixPublicSchema() {
    console.log("🛠️ FIXING public.users SCHEMA (Final)...");
    const client = await pool.connect();
    try {
        // Explicitly target public.users and add ALL missing columns found in seed script
        await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
        await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS avatar_url TEXT`);
        await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location_name VARCHAR(100)`);
        await client.query(`ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender VARCHAR(20)`);

        console.log("✅ Columns 'phone', 'avatar_url', 'location_name', 'gender' added/verified in public.users");

        // Verify strictly
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND table_schema = 'public' 
            AND column_name IN ('phone', 'avatar_url', 'location_name', 'gender')
        `);

        console.log("Found Columns:", res.rows.map(r => r.column_name));

        if (res.rows.length === 4) {
            console.log("✅ VERIFIED: All required columns exist.");
        } else {
            console.error(`❌ ERROR: Only found ${res.rows.length}/4 columns.`);
        }

    } catch (e) {
        console.error("❌ Schema Fix Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

fixPublicSchema();
