
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function resetDemoUser() {
    console.log("Resetting Demo User...");
    const client = await pool.connect();
    try {
        const email = 'demo@example.com';
        const password = 'password123';
        const hashedPassword = await bcrypt.hash(password, 10);

        // Upsert User
        const res = await client.query(`
            INSERT INTO public.users (email, password_hash, full_name, gender, age, is_verified)
            VALUES ($1, $2, 'Demo User', 'Male', 28, TRUE)
            ON CONFLICT (email) DO UPDATE 
            SET password_hash = $2
            RETURNING id
        `, [email, hashedPassword]);

        console.log(`✅ Demo User Ready: ${email} / ${password} (ID: ${res.rows[0].id})`);

    } catch (e) {
        console.error("Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

resetDemoUser();
