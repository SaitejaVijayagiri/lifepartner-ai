
import { pool } from '../db';
import bcrypt from 'bcrypt';

const checkUser = async () => {
    const email = 'saitejavijayagiri@gmail.com';
    const password = 'Saitejauday@0102';

    try {
        console.log(`Checking for user: ${email}`);
        const result = await pool.query("SELECT * FROM public.users WHERE email = $1", [email]);

        if (result.rows.length === 0) {
            console.log("❌ User NOT found in database.");
        } else {
            const user = result.rows[0];
            console.log("✅ User FOUND in database.");
            console.log(`User ID: ${user.id}`);
            console.log(`Verified: ${user.is_verified}`);
            console.log(`OTP Code: ${user.otp_code}`);

            const match = await bcrypt.compare(password, user.password_hash);
            if (match) {
                console.log("✅ Password MATCHES.");
            } else {
                console.log("❌ Password does NOT match.");
            }
        }
    } catch (err) {
        console.error("Error checking user:", err);
    } finally {
        await pool.end();
    }
};

checkUser();
