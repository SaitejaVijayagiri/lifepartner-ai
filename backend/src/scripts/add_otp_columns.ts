import { pool } from '../db';
import dotenv from 'dotenv';
dotenv.config();

const migrate = async () => {
    try {
        const client = await pool.connect();
        console.log("Adding OTP columns...");
        await client.query(`
            DO $$ 
            BEGIN 
                -- OTP Code
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='otp_code') THEN 
                    ALTER TABLE public.users ADD COLUMN otp_code VARCHAR(6); 
                END IF;

                -- OTP Expiry
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='otp_expires_at') THEN 
                    ALTER TABLE public.users ADD COLUMN otp_expires_at TIMESTAMP; 
                END IF;

                -- Is Verified
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='is_verified') THEN 
                    ALTER TABLE public.users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE; 
                END IF;
            END $$;
        `);
        console.log("✅ OTP Columns Added");
        client.release();
        process.exit(0);
    } catch (e) {
        console.error("❌ Migration Failed", e);
        process.exit(1);
    }
}
migrate();
