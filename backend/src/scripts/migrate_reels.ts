
import { pool } from '../db';
import { v4 as uuidv4 } from 'uuid';

async function migrateReels() {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        console.log("🛠️ Creating Reels Schema...");

        // 1. Create Tables
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.reels (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                url TEXT NOT NULL,
                caption TEXT,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );

            CREATE TABLE IF NOT EXISTS public.reel_likes (
                reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                PRIMARY KEY (reel_id, user_id)
            );

            CREATE TABLE IF NOT EXISTS public.reel_comments (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
                user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                text TEXT NOT NULL,
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);

        console.log("✅ Tables Created.");

        // 2. Migrate Data
        console.log("🔄 Migrating existing reels from profiles...");

        const res = await client.query(`
            SELECT user_id, reels FROM public.profiles 
            WHERE reels IS NOT NULL AND jsonb_array_length(reels) > 0
        `);

        let migratedCount = 0;

        for (const row of res.rows) {
            const userId = row.user_id;
            const reelsArray = row.reels; // JSON array of strings (URLs)

            for (const url of reelsArray) {
                // Check if already exists to avoid dupes on re-run
                const exists = await client.query('SELECT 1 FROM public.reels WHERE user_id = $1 AND url = $2', [userId, url]);

                if (exists.rowCount === 0) {
                    await client.query(`
                        INSERT INTO public.reels (user_id, url)
                        VALUES ($1, $2)
                    `, [userId, url]);
                    migratedCount++;
                }
            }
        }

        console.log(`✅ Migrated ${migratedCount} reels.`);

        await client.query('COMMIT');
        console.log("🚀 Migration Complete!");

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Migration Failed:", e);
    } finally {
        client.release();
        process.exit(); // Ensure script exits
    }
}

migrateReels();
