
// import { api } from '../routes/chat'; 
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://localhost:4000';
// Helper to measure time
const time = async (label: string, fn: () => Promise<any>) => {
    const start = Date.now();
    try {
        const res = await fn();
        const duration = Date.now() - start;
        console.log(`✅ ${label}: ${duration}ms [${res.status} ${res.statusText}]`);
        return res;
    } catch (e: any) {
        console.error(`❌ ${label} Failed:`, e.message);
        return null;
    }
}

async function runHealthCheck() {
    console.log("🏥 Starting System Health Check...");

    // 1. Login to get Token
    console.log("--- Authentication ---");
    let token = '';
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'test_auth_copy@example.com', password: 'password123' })
    });

    if (loginRes.ok) {
        const data = await loginRes.json();
        token = data.token;
        console.log(`✅ Login Success: ${Date.now()}ms`);
    } else {
        console.error("❌ Login Failed. Creating Test User...");
        // Register if login fails
        const regRes = await fetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'test_auth_copy@example.com',
                password: 'password123',
                name: 'Test Agent',
                age: 25,
                gender: 'Male'
            })
        });
        if (regRes.ok) {
            const data = await regRes.json();
            token = data.token;
            console.log("✅ Registration Success");
        } else {
            console.error("❌ Registration Failed. Aborting.");
            return;
        }
    }

    const headers = { 'Authorization': `Bearer ${token}` };

    // 2. Latency Tests
    console.log("\n--- Latency Tests (Target < 200ms) ---");
    await time('GET /profile/me', () => fetch(`${BASE_URL}/profile/me`, { headers }));
    await time('GET /matches', () => fetch(`${BASE_URL}/matches/recommendations`, { headers }));
    await time('GET /requests', () => fetch(`${BASE_URL}/interactions/requests`, { headers }));
    await time('GET /connections', () => fetch(`${BASE_URL}/interactions/connections`, { headers }));

    console.log("\n--- Done ---");
}

runHealthCheck();
