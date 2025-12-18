
import { pool } from '../db';
import bcrypt from 'bcrypt';

const realProfiles = [
    {
        name: "Sanya Malhotra",
        email: "sanya.real@example.com",
        phone: "+91 9876500001",
        gender: "Female",
        password: "password123",
        age: 24,
        location: { city: "Mumbai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1621784563330-caee1b23f8c8?q=80&w=2934&auto=format&fit=crop",
        reels: [],
        metadata: {
            religion: { faith: "Hindu", caste: "Punjabi" },
            career: { profession: "Fashion Designer", income: "18 LPA", company: "Myntra" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Socially" },
            height: "5'5",
            aboutMe: "Fashion enthusiast.",
            dob: "1999-05-15",
            photos: []
        }
    }
];

async function seedFinal() {
    console.log("🚀 STARTING SEED FINAL (ULTRA MINIMAL)...");
    const client = await pool.connect();

    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        for (const user of realProfiles) {
            console.log(`Processing ${user.name}...`);
            await client.query("DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM public.users WHERE email = $1)", [user.email]);
            await client.query("DELETE FROM public.users WHERE email = $1", [user.email]);

            // 2. Ultra Minimal Insert (Email Only)
            console.log("Attempting INSERT (email)...");
            const res = await client.query(`
                INSERT INTO public.users (email)
                VALUES ($1)
                RETURNING id
            `, [user.email]);

            const userId = res.rows[0].id;
            console.log(`✅ Insert Success. ID: ${userId}`);

            // 3. Update Basic Info
            console.log("Updating Basic Info (password, name, age)...");
            try {
                await client.query(`UPDATE public.users SET password_hash=$1, full_name=$2, age=$3 WHERE id=$4`,
                    [hashedPassword, user.name, user.age, userId]);
                console.log("✅ Basic Info Updated");
            } catch (e) {
                console.error("❌ Failed Basic Info:", e);
            }

            // 4. Update Phone
            console.log("Updating Phone...");
            try {
                await client.query(`UPDATE public.users SET phone = $1 WHERE id = $2`, [user.phone, userId]);
                console.log("✅ Phone Updated");
            } catch (e) {
                console.error("❌ Failed Phone:", e);
            }

            // 5. Update Gender
            console.log("Updating Gender...");
            try {
                await client.query(`UPDATE public.users SET gender = $1 WHERE id = $2`, [user.gender, userId]);
                console.log("✅ Gender Updated");
            } catch (e) {
                console.error("❌ Failed Gender:", e);
            }

            // 6. Update Location
            console.log("Updating Location...");
            try {
                await client.query(`UPDATE public.users SET location_name = $1 WHERE id = $2`, [user.location.city, userId]);
                console.log("✅ Location Updated");
            } catch (e) {
                console.error("❌ Failed Location:", e);
            }

            // 7. Update Avatar
            console.log("Updating Avatar...");
            try {
                await client.query(`UPDATE public.users SET avatar_url = $1 WHERE id = $2`, [user.avatar, userId]);
                console.log("✅ Avatar Updated");
            } catch (e) {
                console.error("❌ Failed Avatar:", e);
            }

            // Insert Profile
            await client.query(`
                INSERT INTO public.profiles (user_id, raw_prompt, metadata, updated_at, photos)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                userId,
                user.metadata.aboutMe,
                JSON.stringify(user.metadata),
                JSON.stringify(user.metadata.photos)
            ]);
            console.log("✅ Profile Created");
        }

    } catch (e) {
        console.error("🚨 FATAL ERROR in SEED FINAL:", e);
    } finally {
        client.release();
        process.exit();
    }
}

seedFinal();
