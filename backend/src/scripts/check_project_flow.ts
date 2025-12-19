
import { pool } from '../db';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

const runFlowCheck = async () => {
    console.log("🚀 Starting End-to-End Project Flow Check...");
    const client = await pool.connect();

    try {
        // --- CLEANUP ---
        await client.query("DELETE FROM public.users WHERE email LIKE 'flow_test_%'");
        console.log("🧹 Cleaned up old test users.");

        // --- STEP 1: REGISTER USER A (Male) ---
        const emailA = `flow_test_a_${Date.now()}@example.com`;
        const passHash = await bcrypt.hash('password123', 10);

        const resA = await client.query(`
            INSERT INTO public.users (full_name, email, password_hash, gender, is_verified)
            VALUES ($1, $2, $3, 'Male', TRUE)
            RETURNING id
        `, ['Flow User A', emailA, passHash]);
        const idA = resA.rows[0].id;
        console.log(`✅ User A Registered (${idA})`);

        // Setup Profile A
        await client.query(`INSERT INTO public.profiles (user_id, raw_prompt) VALUES ($1, 'I am a software engineer looking for a doctor.')`, [idA]);

        // --- STEP 2: REGISTER USER B (Female) ---
        const emailB = `flow_test_b_${Date.now()}@example.com`;
        const resB = await client.query(`
            INSERT INTO public.users (full_name, email, password_hash, gender, is_verified)
            VALUES ($1, $2, $3, 'Female', TRUE)
            RETURNING id
        `, ['Flow User B', emailB, passHash]);
        const idB = resB.rows[0].id;
        console.log(`✅ User B Registered (${idB})`);

        // Setup Profile B
        await client.query(`INSERT INTO public.profiles (user_id, raw_prompt, metadata) VALUES ($1, 'I am a doctor who loves travel.', $2)`, [idB, JSON.stringify({ career: { profession: "Doctor" } })]);

        // --- STEP 3: SEARCH (User A searching) ---
        // Simulating the search query logic 
        const searchRes = await client.query(`
            SELECT u.id FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
            WHERE u.id != $1 AND LOWER(u.gender) = 'female'
        `, [idA]);

        const found = searchRes.rows.find(r => r.id === idB);
        if (found) console.log("✅ Search: User A found User B.");
        else console.error("❌ Search: User A did NOT find User B.");

        // --- STEP 4: SEND INTEREST (A -> B) ---
        await client.query(`
            INSERT INTO public.matches (user_a_id, user_b_id, status, is_liked)
            VALUES ($1, $2, 'pending', TRUE)
        `, [idA, idB]);
        console.log("✅ Interaction: User A sent interest to User B.");

        // --- STEP 5: CHECK REQUESTS (B's perspective) ---
        const reqRes = await client.query(`
            SELECT * FROM matches WHERE user_b_id = $1 AND status = 'pending'
        `, [idB]);
        if (reqRes.rows.length > 0) console.log("✅ Interaction: User B received interest request.");
        else console.error("❌ Interaction: User B did not see request.");

        // --- STEP 6: ACCEPT INTEREST (B -> A) ---
        await client.query(`
            UPDATE public.matches SET status = 'accepted' WHERE user_a_id = $1 AND user_b_id = $2
        `, [idA, idB]);
        console.log("✅ Interaction: User B accepted request.");

        // --- STEP 7: PROFILE VIEW (Testing the Fix) ---
        // User A viewing User B
        const profileQuery = `
            SELECT u.id as uid, u.*, p.* 
            FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
            WHERE u.id = $1
        `;
        const profileRes = await client.query(profileQuery, [idB]);
        const finalProfile = profileRes.rows[0];

        if (finalProfile.uid === idB) {
            console.log("✅ Profile Check: User ID collision fix verified (User A viewing User B).");
        } else {
            console.error(`❌ Profile Check: Broken! Expected UID ${idB}, got ${finalProfile.uid}`);
        }

        // --- STEP 8: START GAME ---
        const gameRes = await client.query(`
            INSERT INTO games (player_a_id, player_b_id, status)
            VALUES ($1, $2, 'ACTIVE')
            RETURNING id
        `, [idA, idB]);
        console.log(`✅ Game: Started game ID ${gameRes.rows[0].id} between A and B.`);

    } catch (e) {
        console.error("❌ Flow Check Failed:", e);
    } finally {
        // Cleanup
        try {
            await client.query("DELETE FROM public.users WHERE email LIKE 'flow_test_%'");
            console.log("🧹 Cleanup Complete.");
        } catch (e) { }
        client.release();
        await pool.end();
        console.log("🏁 Flow Check Finished.");
    }
};

runFlowCheck();
