
import { pool } from '../db';
import { checkDbConnection } from '../db';

const runHealthCheck = async () => {
    console.log("🏥 Starting System Health Check...");

    // 1. Connection Check
    const isConnected = await checkDbConnection();
    if (!isConnected) {
        console.error("❌ CRITICAL: Database Connection Failed");
        process.exit(1);
    }

    const client = await pool.connect();
    try {
        // 2. Table Existence Check
        const requiredTables = ['users', 'profiles', 'interactions', 'matches', 'transactions', 'messages'];
        console.log(`\n🔍 Checking for required tables: ${requiredTables.join(', ')}`);

        const tablesRes = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
        `);
        const existingTables = tablesRes.rows.map(r => r.table_name);

        const missingTables = requiredTables.filter(t => !existingTables.includes(t));
        if (missingTables.length > 0) {
            console.error(`❌ MISSING TABLES: ${missingTables.join(', ')}`);
        } else {
            console.log("✅ All required tables present.");
        }

        // 3. Row Count Sanity Check
        console.log("\n📊 Row Counts:");
        for (const table of existingTables) {
            const countRes = await client.query(`SELECT COUNT(*) FROM public."${table}"`);
            console.log(` - ${table}: ${countRes.rows[0].count}`);
        }

        // 4. Critical Column Check (Users)
        console.log("\n🕵️ Checking Critical Columns (users)...");
        const userColsRes = await client.query(`
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'users'
        `);
        const userCols = userColsRes.rows.map(r => r.column_name);
        const requiredUserCols = ['id', 'email', 'password_hash', 'is_verified', 'is_premium', 'coins'];
        const missingUserCols = requiredUserCols.filter(c => !userCols.includes(c));

        if (missingUserCols.length > 0) {
            console.error(`❌ MISSING USER COLUMNS: ${missingUserCols.join(', ')}`);
        } else {
            console.log("✅ Critical user columns present.");
        }

        // 5. Test Query (Simulation)
        console.log("\n🧪 Running Test Select Query...");
        const testRes = await client.query('SELECT id, email FROM public.users LIMIT 1');
        if (testRes.rows.length > 0) {
            console.log("✅ Can select from users table.");
        } else {
            console.log("⚠️ Users table is empty (might be expected if fresh db).");
        }

    } catch (err) {
        console.error("❌ Health Check Failed:", err);
    } finally {
        client.release();
        await pool.end();
        console.log("\n🏁 Health Check Complete.");
    }
};

runHealthCheck();
