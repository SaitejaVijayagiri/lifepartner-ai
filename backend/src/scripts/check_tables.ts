
import { pool } from '../db';

async function checkTables() {
    console.log("🔍 Listing Tables...");
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        `);
        console.table(res.rows);
    } catch (e) {
        console.error("❌ Failed to list tables:", e);
    } finally {
        client.release();
        await pool.end();
    }
}

checkTables();
