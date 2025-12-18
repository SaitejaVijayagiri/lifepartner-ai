
import { pool } from '../db';

async function ensureIndexes() {
    console.log("🚀 Optimizing Database Performance (Indexing)...");
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Interactions (Stored in 'matches' table)
        // Used in: GET /requests, GET /connections, WHERE user_a_id OR user_b_id
        console.log("Checking User Indexes...");
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_matches_user_a ON public.matches(user_a_id);
            CREATE INDEX IF NOT EXISTS idx_matches_user_b ON public.matches(user_b_id);
            CREATE INDEX IF NOT EXISTS idx_matches_status ON public.matches(status);
        `);

        // 2. Messages (Chat currently in-memory, but indexing for future)
        // console.log("Checking Chat Indexes...");
        // await client.query(`
        //    CREATE INDEX IF NOT EXISTS idx_messages_connection ON public.messages(connection_id);
        //    CREATE INDEX IF NOT EXISTS idx_messages_created ON public.messages(created_at DESC);
        // `);

        // 3. Profiles (Recommendation Algo)
        // Used in: GET /recommendations (filtering by gender, age)
        console.log("Checking Profile Indexes...");
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_users_gender ON public.users(gender);
            CREATE INDEX IF NOT EXISTS idx_users_age ON public.users(age);
            CREATE INDEX IF NOT EXISTS idx_users_verified ON public.users(is_verified);
        `);

        await client.query('COMMIT');
        console.log("✅ Database Optimized with Indexes");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Indexing Failed:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

ensureIndexes();
