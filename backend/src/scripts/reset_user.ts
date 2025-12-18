
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function resetSpecificUser() {
    const email = 'saitejavijayagiri@gmail.com';
    const password = 'Saitejauday@0102';

    console.log(`Resetting User: ${email}`);
    const client = await pool.connect();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        // Check if user exists
        const userRes = await client.query("SELECT * FROM public.users WHERE email = $1", [email]);

        if (userRes.rows.length > 0) {
            // Update Password
            await client.query("UPDATE public.users SET password_hash = $1 WHERE email = $2", [hashedPassword, email]);
            console.log("✅ Password Updated Successfully!");
        } else {
            console.log("⚠️ User not found. Creating new user...");
            const res = await client.query(`
                INSERT INTO public.users (email, password_hash, full_name, gender, age, is_verified)
                VALUES ($1, $2, 'Saiteja Vijayagiri', 'Male', 24, TRUE)
                RETURNING id
            `, [email, hashedPassword]);
            console.log(`✅ User Created with ID: ${res.rows[0].id}`);
        }

    } catch (e) {
        console.error("Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

resetSpecificUser();
