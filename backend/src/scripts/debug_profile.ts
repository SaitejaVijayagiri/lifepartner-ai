
import { pool } from '../db';

async function checkProfiles() {
    try {
        const client = await pool.connect();

        console.log("--- Users & Profiles ---");
        const res = await client.query(`
            SELECT u.id, u.email, u.full_name, p.metadata 
            FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
        `);

        res.rows.forEach(r => {
            console.log(`User: ${r.email} (${r.full_name})`);
            console.log(`Metadata:`, JSON.stringify(r.metadata, null, 2));
            console.log("--------------------------");
        });

        client.release();
    } catch (e) {
        console.error(e);
    }
}

checkProfiles();
