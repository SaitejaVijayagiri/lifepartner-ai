
import { pool } from '../db';

async function forceAddGender() {
    console.log("💪 FORCE ADDING GENDER...");
    const client = await pool.connect();
    try {
        await client.query(`ALTER TABLE public.users ADD COLUMN gender VARCHAR(20)`);
        console.log("✅ SUCCESS: 'gender' column was missing and is now added.");
    } catch (e: any) {
        if (e.code === '42701') {
            console.log("⚠️ EXISTS: 'gender' column already exists (duplicate column error).");
        } else {
            console.error("❌ FAILED:", e);
        }
    } finally {
        client.release();
        process.exit();
    }
}

forceAddGender();
