import { pool } from '../db';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const runMigration = async () => {
    console.log("🚀 Starting Database Migration...");
    console.log(`Target DB: ${process.env.DATABASE_URL?.split('@')[1]}`); // Log host only for safety

    try {
        const client = await pool.connect();

        // Read SQL file
        const sqlPath = path.join(__dirname, '../db/init.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log("📝 Running init.sql...");

        // Execute SQL
        await client.query(sql);

        console.log("✅ Migration Successful! Tables created.");
        client.release();
        process.exit(0);

    } catch (err) {
        console.error("❌ Migration Failed:", err);
        process.exit(1);
    }
};

runMigration();
