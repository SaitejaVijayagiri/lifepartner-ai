
import { pool } from '../db';

async function listColumns() {
    console.log("🕵️ Dumping Schema for 'users' table...");
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
            ORDER BY ordinal_position
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        // Check Triggers too
        const triggers = await client.query(`
            SELECT trigger_name, event_manipulation 
            FROM information_schema.triggers 
            WHERE event_object_table = 'users'
        `);
        console.log("Triggers:", JSON.stringify(triggers.rows, null, 2));
    } catch (e) {
        console.error("❌ Schema Check Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

listColumns();
