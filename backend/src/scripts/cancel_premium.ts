
import { pool } from '../db';

async function cancelPremium() {
    const email = 'saitejavijayagiri@gmail.com';
    console.log(`Cancelling Premium for: ${email}`);

    const client = await pool.connect();
    try {
        await client.query(`
            UPDATE public.users 
            SET is_premium = FALSE, premium_expiry = NULL, razorpay_customer_id = NULL
            WHERE email = $1
        `, [email]);

        console.log("✅ User reset to FREE plan.");

    } catch (e) {
        console.error("Error", e);
    } finally {
        client.release();
        process.exit();
    }
}

cancelPremium();
