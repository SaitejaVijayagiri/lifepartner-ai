import { pool } from '../db';

const addBoostColumns = async () => {
    const client = await pool.connect();
    try {
        console.log("Adding Boost columns...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS is_boosted BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS boost_expires_at TIMESTAMP;
        `);
        console.log("✅ Boost Columns Added");
    } catch (e) {
        console.error("Error adding columns", e);
    } finally {
        client.release();
        process.exit();
    }
};

addBoostColumns();
