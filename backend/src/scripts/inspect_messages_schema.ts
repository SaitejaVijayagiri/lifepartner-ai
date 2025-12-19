
import { pool } from '../db';

const inspectSchema = async () => {
    const client = await pool.connect();
    try {
        console.log("🕵️ Inspecting 'messages' table schema...");
        const res = await client.query(`
            SELECT column_name
            FROM information_schema.columns 
            WHERE table_name = 'messages';
        `);
        console.log("Columns:", res.rows.map(r => r.column_name));
    } catch (e) {
        console.error("Error inspecting schema:", e);
    } finally {
        client.release();
        await pool.end();
    }
};

inspectSchema();
