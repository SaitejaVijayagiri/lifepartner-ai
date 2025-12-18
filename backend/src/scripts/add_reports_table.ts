
import { pool } from '../db';

async function createReportsTable() {
    const client = await pool.connect();
    try {
        console.log("🛡️ Creating Reports Schema...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS public.reports (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                reporter_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
                reported_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                reason TEXT NOT NULL,
                details TEXT,
                status VARCHAR(50) DEFAULT 'open', -- open, reviewed, dismissed, banned
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log("✅ Reports Table Created.");

    } catch (e) {
        console.error("❌ Failed to create reports table:", e);
    } finally {
        client.release();
        process.exit();
    }
}

createReportsTable();
