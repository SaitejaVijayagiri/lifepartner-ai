import dotenv from 'dotenv';
import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';

dotenv.config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const verifyUser = async () => {
    const email = 'saitejavijaygiri@gmail.com';
    const password = 'Saitejauday@0102';

    try {
        console.log(`Checking user: ${email}...`);
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

        if (res.rows.length === 0) {
            console.log('❌ User NOT FOUND in database.');
        } else {
            const user = res.rows[0];
            console.log('✅ User FOUND in database.');
            console.log('User ID:', user.id);
            // console.log('Hashed Password:', user.password_hash); // Log hash if debug needed, but kept silent for now

            // Note: DB column is password_hash based on auth.ts
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (isMatch) {
                console.log('✅ Password MATCHES! Login should work.');
            } else {
                console.log('❌ Password DOES NOT match.');
            }
        }
    } catch (err) {
        console.error('❌ Database Error:', err);
    } finally {
        await pool.end();
    }
};

verifyUser();
