import { pool } from '../db';

const ensureNotificationsTable = async () => {
    const client = await pool.connect();
    try {
        console.log("Checking 'notifications' table...");

        await client.query(`
            CREATE TABLE IF NOT EXISTS public.notifications (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
                type VARCHAR(50) NOT NULL,
                message TEXT NOT NULL,
                data JSONB DEFAULT '{}'::jsonb,
                is_read BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        // Index for faster queries provided we filter by user_id constantly
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
            CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
        `);

        console.log("✅ 'notifications' table verified.");
    } catch (e) {
        console.error("❌ Failed to ensure notifications table:", e);
    } finally {
        client.release();
        process.exit();
    }
};

ensureNotificationsTable();
