
import { pool } from '../db';

async function backfillPhones() {
    console.log("🔧 Backfilling missing phone numbers...");
    const client = await pool.connect();
    try {
        const res = await client.query(`
            UPDATE public.users 
            SET phone = '+91 ' || floor(random() * 9000000000 + 1000000000)::text
            WHERE phone IS NULL;
        `);
        console.log(`✅ Updated ${res.rowCount} users with fake phone numbers.`);

        // Verify specifically for Sneha if possible, or just dump a few
        const check = await client.query("SELECT full_name, phone FROM public.users LIMIT 5");
        console.table(check.rows);

    } catch (e) {
        console.error("❌ Backfill Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

backfillPhones();
