
import axios from 'axios';

const API_URL = 'http://localhost:4000';
let token = '';
let userId = '';

async function runTests() {
    console.log("🚀 Starting System Verification...");

    try {
        // 1. Register a Test User
        const email = `test.audit.${Date.now()}@example.com`;
        console.log(`\n1. Testing Registration (${email})...`);
        const regRes = await axios.post(`${API_URL}/auth/register`, {
            fullName: "Audit Bot",
            email,
            password: "password123",
            gender: "Male"
        });
        console.log(regRes.status === 201 ? "✅ Passed" : "❌ Failed");

        // 2. Login
        console.log(`\n2. Testing Login...`);
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email,
            password: "password123"
        });
        token = loginRes.data.token;
        userId = loginRes.data.userId;
        console.log(token ? "✅ Passed" : "❌ Failed");

        const authHeaders = { headers: { Authorization: `Bearer ${token}` } };

        // 3. Test Revenue Protection (Profile)
        console.log(`\n3. Testing Profile Masking (Revenue Protection)...`);
        await axios.put(`${API_URL}/profile/me`, {
            prompt: "Call me at 9876543210 for fun",
            location: { city: "test@gmail.com" }
        }, authHeaders);

        const profileRes = await axios.get(`${API_URL}/profile/me`, authHeaders);
        const bio = profileRes.data.prompt;
        const city = profileRes.data.location.city;

        if (bio.includes("[Hidden Contact") && city.includes("[Hidden Contact")) {
            console.log("✅ Passed (Contact Info Masked)");
        } else {
            console.log("❌ Failed (Leakage Detected)", { bio, city });
        }

        // 4. Test Safety (Reporting)
        console.log(`\n4. Testing User Reporting...`);
        // Report self for demo
        const reportRes = await axios.post(`${API_URL}/interactions/report`, {
            reportedId: userId,
            reason: "spam",
            details: "Automated audit test"
        }, authHeaders);
        console.log(reportRes.data.success ? "✅ Passed" : "❌ Failed");

        // 5. Test Reels Feed
        console.log(`\n5. Testing Reels Feed...`);
        const feedRes = await axios.get(`${API_URL}/reels/feed`, authHeaders);
        console.log(Array.isArray(feedRes.data) ? "✅ Passed" : "❌ Failed");

        // 6. Test Forgot Password (Trigger)
        console.log(`\n6. Testing Forgot Password (Trigger)...`);
        const forgotRes = await axios.post(`${API_URL}/auth/forgot-password`, { email });
        console.log(forgotRes.data.message ? "✅ Passed" : "❌ Failed");

        console.log("\n🎉 ALL SYSTEMS GO! Verification Complete.");

    } catch (e: any) {
        console.error("\n❌ Verification Failed:", e.response?.data || e.message);
    }
}

runTests();
