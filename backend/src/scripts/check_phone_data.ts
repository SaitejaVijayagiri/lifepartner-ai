
import { pool } from '../db';

async function checkPhone() {
    console.log("🕵️ CHECKING SOME USERS...");
    const client = await pool.connect();
    try {
        const res = await client.query("SELECT email, phone, full_name, gender FROM public.users WHERE phone IS NOT NULL LIMIT 5");
        console.table(res.rows);

        if (res.rows.length === 0) {
            console.log("❌ NO USERS WITH PHONE NUMBERS FOUND!");
        } else {
            console.log("✅ FOUND USERS WITH PHONE NUMBERS.");
        }
    } catch (e) {
        console.error("Query Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

checkPhone();
