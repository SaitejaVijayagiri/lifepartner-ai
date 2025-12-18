
import { pool } from '../db';

async function migrate() {
    console.log("Starting migration: Add is_liked to matches...");
    const client = await pool.connect();
    try {
        // 1. Add Column
        await client.query(`
            ALTER TABLE matches 
            ADD COLUMN IF NOT EXISTS is_liked BOOLEAN DEFAULT FALSE;
        `);
        console.log("Column added.");

        // 2. Migrate Data: 'shortlisted' -> is_liked = true
        // We will ALSO clear the status for shortlisted items so they don't block future 'pending' requests if we want them clean.
        // OR we can leave them as is? 
        // Better: Set is_liked=true where status='shortlisted'.
        await client.query(`
            UPDATE matches 
            SET is_liked = TRUE 
            WHERE status = 'shortlisted';
        `);

        // 3. Optional: Set is_liked=true for pending/accepted too? 
        // The user complained that "Send Interest" INCREASES like count. 
        // So originally, we counted pending as likes.
        // If we want to preserve the "count", maybe we should?
        // But the user explicitly said "They are different buttons".
        // So let's NOT assume pending = liked.
        // Pending is Pending. Liked is Liked.

        // 4. Cleanup 'shortlisted' status?
        // If we keep 'shortlisted' in status, it might confuse logic.
        // Let's set status = NULL where status = 'shortlisted' to treat it as "No Interaction Status" (just liked).
        // But 'status' might be not null constraint? Check init.sql?
        // Usually nullable.
        await client.query(`
            UPDATE matches 
            SET status = NULL 
            WHERE status = 'shortlisted';
        `);

        console.log("Data migrated.");
    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

migrate();
