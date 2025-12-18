
import { pool } from '../db';

async function addPhoneColumn() {
    const client = await pool.connect();
    try {
        console.log("Checking for phone column...");
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='phone') THEN 
                    ALTER TABLE users ADD COLUMN phone VARCHAR(50); 
                    RAISE NOTICE 'Added phone column';
                ELSE 
                    RAISE NOTICE 'Phone column already exists';
                END IF; 
            END $$;
        `);
        console.log("✅ Phone Column Verified/Added");
    } catch (e) {
        console.error("Error adding column:", e);
    } finally {
        client.release();
        process.exit();
    }
}

addPhoneColumn();
