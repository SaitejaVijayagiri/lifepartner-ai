import { pool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        const client = await pool.connect();
        console.log("Checking for phone column...");
        await client.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='phone') THEN 
                    ALTER TABLE public.users ADD COLUMN phone VARCHAR(20); 
                    ALTER TABLE public.users ADD CONSTRAINT users_phone_key UNIQUE (phone);
                    RAISE NOTICE 'Added phone column';
                ELSE
                    RAISE NOTICE 'Phone column already exists';
                END IF;
            END $$;
        `);
        console.log("✅ Migration Done");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration Failed", e);
        process.exit(1);
    }
}
migrate();
