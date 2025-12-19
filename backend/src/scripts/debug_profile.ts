
import { pool } from '../db';

const debugProfile = async () => {
    const email = 'saitejavijayagiri@gmail.com';

    try {
        console.log(`🔍 Debugging Profile for: ${email}`);

        // 1. Get User ID
        const userRes = await pool.query("SELECT id, email, is_premium, full_name FROM public.users WHERE email = $1", [email]);

        if (userRes.rows.length === 0) {
            console.log("❌ User not found in users table.");
            return;
        }

        const userBasic = userRes.rows[0];
        console.log("✅ User Found:", userBasic);
        const userId = userBasic.id;

        // 2. Simulate the JOIN query from the route
        console.log("--------------- Executing Route Query ----------------");
        const joinedRes = await pool.query(`
            SELECT u.id as uid, u.*, p.* 
            FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
            WHERE u.id = $1
        `, [userId]);

        if (joinedRes.rows.length === 0) {
            console.log("❌ Route query returned NO rows.");
        } else {
            const row = joinedRes.rows[0];
            console.log("✅ Route query returned row.");

            // Check for ID collision
            console.log("Keys in returned row:", Object.keys(row));
            console.log("row.id:", row.id);
            console.log("row.user_id:", row.user_id);
            console.log("row.full_name:", row.full_name);
            console.log("row.is_premium:", row.is_premium);

            // Validate the constructed profile object
            const meta = row.metadata || {};
            const profile = {
                userId: row.id || row.user_id,
                name: row.full_name,
                email: row.email,
                is_premium: row.is_premium,
            };
            console.log("Constructed Partial Profile:", profile);

            if (!profile.userId) {
                console.error("🚨 CRITICAL: userId is NULL in constructed profile! This confirms ID collision/overwrite issue.");
            }
        }

        // 3. Check specific Profile table row
        const profileRes = await pool.query("SELECT * FROM public.profiles WHERE user_id = $1", [userId]);
        console.log("--------------- Profile Table Direct Check ----------------");
        if (profileRes.rows.length === 0) {
            console.log("⚠️ No row in public.profiles for this user_id.");
        } else {
            console.log("✅ Profile row exists.", profileRes.rows[0]);
        }

    } catch (err) {
        console.error("Debug Error:", err);
    } finally {
        await pool.end();
    }
};

debugProfile();
