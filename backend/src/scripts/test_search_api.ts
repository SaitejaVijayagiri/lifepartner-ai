
import axios from 'axios';
import { pool } from '../db';
import bcrypt from 'bcrypt';

const API_URL = 'http://localhost:4000';

async function testSearchFlow() {
    console.log("🕵️ TESTING SEARCH API FLOW...");

    // 1. Create/Get a Premium User
    const client = await pool.connect();
    const email = "premium_tester@example.com";
    const password = "password123";
    let userId;

    try {
        // Ensure user exists and is PREMIUM
        const res = await client.query("SELECT * FROM public.users WHERE email = $1", [email]);
        if (res.rows.length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hash = await bcrypt.hash(password, salt);
            const newRes = await client.query(`
                INSERT INTO public.users (email, password_hash, full_name, gender, is_verified, is_premium)
                VALUES ($1, $2, 'Premium Tester', 'Male', TRUE, TRUE)
                RETURNING id
             `, [email, hash]);
            userId = newRes.rows[0].id;
            console.log("✅ Created New Premium User");
        } else {
            userId = res.rows[0].id;
            await client.query("UPDATE public.users SET is_premium = TRUE WHERE id = $1", [userId]);
            console.log("✅ Verified Existing User is Premium");
        }
    } finally {
        client.release();
    }

    // 2. Login to get Token
    try {
        const loginRes = await axios.post(`${API_URL}/auth/login`, { email, password });
        const token = loginRes.data.token;
        console.log("✅ Login Successful. Token obtained.");

        // 3. Search API
        const searchRes = await axios.post(
            `${API_URL}/matches/search`,
            { query: "Dentist" },
            { headers: { Authorization: `Bearer ${token}` } }
        );

        const matches = searchRes.data.matches;
        console.log(`\n🔎 Found ${matches.length} matches.`);

        if (matches.length > 0) {
            console.log("------------------------------------------");
            const topMatches = matches.slice(0, 3);
            topMatches.forEach((m: any, i: number) => {
                // Note: debug fields removed from backend, so these will be undefined
                console.log(`[${i}] Name: ${m.name}, Phone: ${m.phone}, Email: ${m.email}`);
            });
            console.log("------------------------------------------");

            const hasPhone = topMatches.some((m: any) => m.phone);
            if (hasPhone) {
                console.log("✅ TEST PASSED: At least one match has visible phone.");
            } else {
                console.log("❌ TEST FAILED: No phone numbers visible.");
            }
        }

    } catch (e: any) {
        console.error("❌ API Test Failed:", e.response?.data || e.message);
    } finally {
        process.exit();
    }
}

testSearchFlow();
