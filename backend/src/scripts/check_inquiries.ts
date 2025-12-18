import { pool } from '../db';

const checkInquiries = async () => {
    const client = await pool.connect();
    try {
        const res = await client.query(`
            SELECT * FROM public.contact_inquiries 
            ORDER BY created_at DESC 
            LIMIT 5
        `);
        console.log("Recent Inquiries:");
        console.table(res.rows);
    } catch (e) {
        console.error("Error fetching inquiries:", e);
    } finally {
        client.release();
        process.exit();
    }
};

checkInquiries();
