
import { pool } from '../db';

async function checkSchema() {
    console.log("Checking User Schema...");
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        console.log("Columns:", res.rows.map(r => r.column_name));
    } catch (e) {
        console.error("Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

checkSchema();
