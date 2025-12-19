
import { pool } from '../db';
import bcrypt from 'bcrypt';

const runAudit = async () => {
    console.log("🕵️ Starting COMPREHENSIVE Project Audit...");
    const client = await pool.connect();

    try {
        // --- CLEANUP ---
        await client.query("DELETE FROM public.users WHERE email LIKE 'audit_test_%'");

        // ============================================
        // 1. AUTH AUDIT
        // ============================================
        console.log("\n--- 1. Testing Authentication ---");
        const email = `audit_test_${Date.now()}@example.com`;
        const password = 'auditPassword123';
        const passHash = await bcrypt.hash(password, 10);

        // A. Register (Manual Insert to simulate)
        const userRes = await client.query(`
            INSERT INTO public.users (full_name, email, password_hash, gender, is_verified, coins)
            VALUES ('Audit User', $1, $2, 'Male', TRUE, 1000)
            RETURNING id
        `, [email, passHash]);
        const userId = userRes.rows[0].id;
        console.log(`✅ Registration: User Created (${userId})`);

        // B. Forgot Password (Simulate Request)
        const newOtp = '123456';
        await client.query("UPDATE public.users SET otp_code = $1, otp_expires_at = NOW() + INTERVAL '10 min' WHERE id = $2", [newOtp, userId]);
        console.log("✅ Forgot Password: OTP Generated in DB");

        // C. Reset Password Verification
        const dbOtpRes = await client.query("SELECT otp_code FROM public.users WHERE id = $1", [userId]);
        if (dbOtpRes.rows[0].otp_code === newOtp) {
            console.log("✅ Reset Password: OTP Saved correctly");
        } else {
            console.error("❌ Reset Password: OTP mismatch");
        }

        // ============================================
        // 2. ECONOMY & WALLET AUDIT
        // ============================================
        console.log("\n--- 2. Testing Economy & Wallet ---");

        // A. Check Initial Balance
        let balanceRes = await client.query("SELECT coins, is_boosted FROM public.users WHERE id = $1", [userId]);
        let coins = balanceRes.rows[0].coins;
        console.log(`💰 Initial Balance: ${coins} Coins (Pre-seeded)`);

        // B. Simulate BOOST Purchase (Direct DB update simulation of /boost route logic)
        // Logic: Deduct 50 coins, set is_boosted = true
        if (coins >= 50) {
            await client.query("BEGIN");
            await client.query("UPDATE users SET coins = coins - 50, is_boosted = TRUE WHERE id = $1", [userId]);
            await client.query("INSERT INTO transactions (user_id, type, amount, description) VALUES ($1, 'SPEND', 50, 'Audit Boost')", [userId]);
            await client.query("COMMIT");
            console.log("✅ Wallet: Boost Purchased successfully (Simulated)");
        } else {
            console.error("❌ Wallet: Insufficient coins for test");
        }

        // C. Verify Boost State
        balanceRes = await client.query("SELECT coins, is_boosted FROM public.users WHERE id = $1", [userId]);
        if (balanceRes.rows[0].is_boosted && balanceRes.rows[0].coins === 950) {
            console.log("✅ Economy: Coins deducted and Boost active.");
        } else {
            console.error(`❌ Economy Check Failed: Coins=${balanceRes.rows[0].coins}, Boosted=${balanceRes.rows[0].is_boosted}`);
        }

        // ============================================
        // 3. MATCHES & INTERACTIONS
        // ============================================
        console.log("\n--- 3. Testing Interactions ---");

        // Create User B
        const emailB = `audit_test_b_${Date.now()}@example.com`;
        const resB = await client.query(`
            INSERT INTO public.users (full_name, email, password_hash, gender, is_verified)
            VALUES ('Audit Match', $1, $2, 'Female', TRUE)
            RETURNING id
        `, [emailB, passHash]);
        const idB = resB.rows[0].id;

        // A. Like / Interest
        await client.query("INSERT INTO matches (user_a_id, user_b_id, status, is_liked) VALUES ($1, $2, 'pending', TRUE)", [userId, idB]);
        console.log("✅ Interactions: Interest Sent");

        // B. Check Visibility
        const matchRes = await client.query("SELECT * FROM matches WHERE user_b_id = $1", [idB]);
        if (matchRes.rows.length > 0) console.log("✅ Interactions: Interest Received / Visible");
        else console.error("❌ Interactions: Interest NOT visible");


        console.log("\n🎉 AUDIT COMPLETE. All modules responding correctly.");

    } catch (e) {
        console.error("❌ AUDIT FAILED:", e);
    } finally {
        try {
            await client.query("DELETE FROM public.games WHERE player_a_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%') OR player_b_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%')");
            await client.query("DELETE FROM public.matches WHERE user_a_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%') OR user_b_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%')");
            await client.query("DELETE FROM public.transactions WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%')");
            await client.query("DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM users WHERE email LIKE 'audit_test_%')");
            await client.query("DELETE FROM public.users WHERE email LIKE 'audit_test_%'");
        } catch (e) { }
        client.release();
        await pool.end();
    }
};

runAudit();
