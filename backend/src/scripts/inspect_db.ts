import { pool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const inspect = async () => {
    try {
        console.log("Connecting to:", process.env.DATABASE_URL?.split('@')[1]); // Log Host
        const client = await pool.connect();

        console.log("--- Users Table Columns ---");
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' AND table_schema = 'public'
        `);
        console.log(JSON.stringify(res.rows, null, 2));

        client.release();
        process.exit(0);
    } catch (e) {
        console.error("Inspect Failed", e);
        process.exit(1);
    }
}
inspect();
