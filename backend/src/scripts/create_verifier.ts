
import { pool } from '../db';
import bcrypt from 'bcrypt'; // Using bcrypt as per package.json
import dotenv from 'dotenv';
import path from 'path';

// Load Env
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function createVerifier() {
    console.log("Connecting to DB...");
    const client = await pool.connect();
    try {
        const email = 'cashfree_verifier@example.com';
        const rawPassword = 'Password@123';
        const hashedPassword = await bcrypt.hash(rawPassword, 10);

        console.log(`Upserting user: ${email}`);

        const res = await client.query(`
            INSERT INTO users (email, password_hash, full_name, is_premium, coins)
            VALUES ($1, $2, 'Cashfree Reviewer', TRUE, 1000)
            ON CONFLICT (email) 
            DO UPDATE SET 
                password_hash = EXCLUDED.password_hash,
                is_premium = TRUE,
                coins = 1000
            RETURNING id;
        `, [email, hashedPassword]);

        console.log(`✅ User Ready! ID: ${res.rows[0].id}`);
        console.log(`📧 Email: ${email}`);
        console.log(`🔑 Password: ${rawPassword}`);

        process.exit(0);
    } catch (e) {
        console.error("❌ Failed:", e);
        process.exit(1);
    } finally {
        client.release();
    }
}

createVerifier();
