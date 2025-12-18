
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function seedCopy() {
    console.log("🚀 STARTING SEED COPY (AUTH MATCH)...");
    const client = await pool.connect();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);
        const email = "test_auth_copy@example.com";
        const phone = "9999999999";

        await client.query("DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM public.users WHERE email = $1)", [email]);
        await client.query("DELETE FROM public.users WHERE email = $1", [email]);

        // EXACT QUERY FROM AUTH.TS
        console.log("Attempting AUTH INSERT...");
        const userRes = await client.query(
            `INSERT INTO public.users (
                email, phone, password_hash, full_name, age, gender, location_name, 
                otp_code, otp_expires_at, is_verified
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE) 
            RETURNING id, full_name`,
            [email, phone, hashedPassword, "Test Auth Copy", 25, "Female", "Mumbai", "123456", new Date()]
        );
        console.log("✅ AUTH INSERT SUCCESS:", userRes.rows[0]);

        // NOW try to update AVATAR_URL (suspect)
        const userId = userRes.rows[0].id;
        console.log("Updating Avatar URL...");
        await client.query(`UPDATE public.users SET avatar_url = $1 WHERE id = $2`, ["http://test.com/img.jpg", userId]);
        console.log("✅ Avatar URL Updated");

    } catch (e) {
        console.error("🚨 FAIL:", e);
    } finally {
        client.release();
        process.exit();
    }
}

seedCopy();
