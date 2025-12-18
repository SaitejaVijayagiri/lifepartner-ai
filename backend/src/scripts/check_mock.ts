
import { pool } from '../db';

async function checkMockUser() {
    console.log("Checking Mock User...");
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT id, email, gender FROM public.users WHERE email = 'demo@example.com' OR id='mock-uuid'");
        console.log("Mock User:", res.rows);
    } catch (e) {
        console.error("Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

checkMockUser();
