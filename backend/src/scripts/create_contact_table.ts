import { pool } from '../db';

const createContactTable = async () => {
    const client = await pool.connect();
    try {
        console.log("Creating 'contact_inquiries' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.contact_inquiries (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                message TEXT NOT NULL,
                status VARCHAR(50) DEFAULT 'new', -- new, read, replied
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
        `);
        console.log("✅ 'contact_inquiries' table ready.");
    } catch (e) {
        console.error("❌ Failed to create table:", e);
    } finally {
        client.release();
        process.exit();
    }
};

createContactTable();
