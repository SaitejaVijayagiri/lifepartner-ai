
import { pool } from '../db';
import bcrypt from 'bcrypt';

async function check() {
    console.log("Starting DB Check...");
    try {
        const client = await pool.connect();
        console.log("✅ DB Connected");

        // 1. Check Table
        const res = await client.query("SELECT to_regclass('public.users')");
        if (!res.rows[0].to_regclass) {
            console.error("❌ 'users' table DOES NOT EXIST");
        } else {
            console.log("✅ 'users' table exists");

            // 2. Check Columns
            const cols = await client.query("SELECT * FROM information_schema.columns WHERE table_name = 'users'");
            const colNames = cols.rows.map(r => r.column_name);
            console.log("Columns:", colNames.join(', '));

            if (!colNames.includes('password_hash')) console.error("❌ Missing 'password_hash'");
            if (!colNames.includes('email')) console.error("❌ Missing 'email'");
        }

        // 3. Check for test user
        const users = await client.query("SELECT id, email, password_hash FROM public.users LIMIT 1");
        if (users.rows.length === 0) {
            console.log("⚠️ No users found in DB. You might need to seed or register.");
        } else {
            console.log("✅ Found users:", users.rows.length);
            const user = users.rows[0];
            console.log("Test User:", user.email);

            // 4. Test Password Hash (Diagnostic)
            console.log("Testing bcrypt compare...");
            const start = Date.now();
            const match = await bcrypt.compare('test', user.password_hash); // Just random check
            console.log(`Bcrypt took ${Date.now() - start}ms`);
        }

        client.release();
    } catch (e) {
        console.error("❌ DB Check Failed:", e);
    } finally {
        await pool.end();
    }
}

check();
