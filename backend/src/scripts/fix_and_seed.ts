
import { pool } from '../db';
import bcrypt from 'bcrypt';

// Added PHONE numbers
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
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-young-woman-drinking-coffee-in-the-city-43403-large.mp4",
            "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Punjabi" },
            career: { profession: "Fashion Designer", income: "18 LPA", company: "Myntra" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Socially" },
            height: "5'5",
            aboutMe: "Fashion enthusiast living in Mumbai. I love traveling, exploring new cafes, and designing clothes.",
            dob: "1999-05-15",
            photos: [
                "https://images.unsplash.com/photo-1621784563330-caee1b23f8c8?q=80&w=2934&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1596245195341-b33a7f275fdb?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Ritika Singh",
        email: "ritika.real@example.com",
        phone: "+91 9876500002",
        gender: "Female",
        password: "password123",
        age: 26,
        location: { city: "Bangalore", country: "India" },
        avatar: "https://images.unsplash.com/photo-1583336137348-82bc11c031ee?q=80&w=2834&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Rajput" },
            career: { profession: "Software Engineer", income: "24 LPA", company: "Google" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'7",
            aboutMe: "Techie by profession, artist by heart. I love coding, painting, and classical dance.",
            dob: "1997-08-20",
            photos: [
                "https://images.unsplash.com/photo-1583336137348-82bc11c031ee?q=80&w=2834&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517841905240-472988babdf9?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Aditi Rao",
        email: "aditi.real@example.com",
        phone: "+91 9876500003",
        gender: "Female",
        password: "password123",
        age: 28,
        location: { city: "Delhi", country: "India" },
        avatar: "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=3087&auto=format&fit=crop",
        reels: [],
        metadata: {
            religion: { faith: "Hindu", caste: "Brahmin" },
            career: { profession: "Architect", income: "30 LPA", company: "DLF" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "Yes" },
            height: "5'4",
            aboutMe: "Architect and urban planner. I am passionate about sustainable living and heritage conservation.",
            dob: "1995-12-10",
            photos: [
                "https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?q=80&w=3087&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?q=80&w=2550&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Zara Khan",
        email: "zara.real@example.com",
        phone: "+91 9876500004",
        gender: "Female",
        password: "password123",
        age: 25,
        location: { city: "Hyderabad", country: "India" },
        avatar: "https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?q=80&w=3280&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-young-mother-playing-with-her-daughter-1208-large.mp4"
        ],
        metadata: {
            religion: { faith: "Muslim", caste: "Sunni" },
            career: { profession: "Dentist", income: "15 LPA", company: "Private Clinic" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "No" },
            height: "5'6",
            aboutMe: "Dentist with a sweet tooth. I love baking and trying new cuisines.",
            dob: "1998-03-25",
            photos: [
                "https://images.unsplash.com/photo-1610216705422-caa3fcb6d158?q=80&w=3280&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1554151228-14d9def656ec?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Kiara Advani",
        email: "kiara.real@example.com",
        phone: "+91 9876500005",
        gender: "Female",
        password: "password123",
        age: 27,
        location: { city: "Mumbai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=2787&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-woman-running-on-the-beach-at-sunset-1002-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Sindhi" },
            career: { profession: "Marketing Manager", income: "20 LPA", company: "Unilever" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "Socially" },
            height: "5'4",
            aboutMe: "Marketing professional who loves the beach and sunsets. Looking for someone adventurous.",
            dob: "1996-07-31",
            photos: [
                "https://images.unsplash.com/photo-1594744803329-e58b31de8bf5?q=80&w=2787&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1512310604669-443f26c35f52?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Meera Joshi",
        email: "meera.real@example.com",
        phone: "+91 9876500006",
        gender: "Female",
        password: "password123",
        age: 26,
        location: { city: "Pune", country: "India" },
        avatar: "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=1887&auto=format&fit=crop",
        reels: [],
        metadata: {
            religion: { faith: "Hindu", caste: "Brahmin" },
            career: { profession: "Yoga Instructor", income: "12 LPA", company: "Self Employed" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'5",
            aboutMe: "Yoga instructor and wellness enthusiast. I believe in a holistic lifestyle.",
            dob: "1997-01-15",
            photos: [
                "https://images.unsplash.com/photo-1601288496920-b6154fe3626a?q=80&w=1887&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544367563-12195537555d?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Ananya Pandey",
        email: "ananya.real@example.com",
        phone: "+91 9876500007",
        gender: "Female",
        password: "password123",
        age: 23,
        location: { city: "Mumbai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1588953936179-d2a4734c5490?q=80&w=2000&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-girl-dancing-happy-in-a-room-4197-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Chunky" },
            career: { profession: "Content Creator", income: "25 LPA", company: "Instagram" },
            lifestyle: { diet: "Eggetarian", smoking: "No", drinking: "Yes" },
            height: "5'7",
            aboutMe: "Digital content creator. I love making reels and trying new trends.",
            dob: "2000-10-30",
            photos: [
                "https://images.unsplash.com/photo-1588953936179-d2a4734c5490?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1600600423621-70bddeb71027?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Shruti Haasan",
        email: "shruti.real@example.com",
        phone: "+91 9876500008",
        gender: "Female",
        password: "password123",
        age: 29,
        location: { city: "Chennai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1534008779051-b85fa0d09c6b?q=80&w=2000&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-woman-playing-acoustic-guitar-at-home-4389-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Iyengar" },
            career: { profession: "Musician", income: "30 LPA", company: "Sony Music" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Yes" },
            height: "5'6",
            aboutMe: "Musician and singer. Music is my life. Looking for someone who appreciates art.",
            dob: "1994-01-28",
            photos: [
                "https://images.unsplash.com/photo-1534008779051-b85fa0d09c6b?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1502446976664-5dd0c5878d2b?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Pooja Hegde",
        email: "pooja.real@example.com",
        phone: "+91 9876500009",
        gender: "Female",
        password: "password123",
        age: 27,
        location: { city: "Mangalore", country: "India" },
        avatar: "https://images.unsplash.com/photo-1616084403156-9de11a25bd81?q=80&w=2000&auto=format&fit=crop",
        reels: [],
        metadata: {
            religion: { faith: "Hindu", caste: "Bunt" },
            career: { profession: "Model", income: "40 LPA", company: "Freelance" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "No" },
            height: "5'8",
            aboutMe: "Model and actress. I am a fitness freak and love pilates.",
            dob: "1996-10-13",
            photos: [
                "https://images.unsplash.com/photo-1616084403156-9de11a25bd81?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Rashmika Mandanna",
        email: "rashmika.real@example.com",
        phone: "+91 9876500010",
        gender: "Female",
        password: "password123",
        age: 26,
        location: { city: "Coorg", country: "India" },
        avatar: "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=2000&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-young-woman-waking-up-in-the-morning-4202-large.mp4"
        ],
        metadata: {
            religion: { faith: "Hindu", caste: "Gowda" },
            career: { profession: "Actress", income: "50 LPA", company: "Tollywood" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "No" },
            height: "5'4",
            aboutMe: "National crush (just kidding!). I am bubbly, energetic, and love animals.",
            dob: "1997-04-05",
            photos: [
                "https://images.unsplash.com/photo-1628157588553-5eeea00af15c?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Samantha Ruth",
        email: "samantha.real@example.com",
        phone: "+91 9876500011",
        gender: "Female",
        password: "password123",
        age: 30,
        location: { city: "Chennai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1545912452-8ea1325d4871?q=80&w=2000&auto=format&fit=crop",
        reels: [
            "https://assets.mixkit.co/videos/preview/mixkit-woman-doing-fitness-exercises-at-home-4347-large.mp4"
        ],
        metadata: {
            religion: { faith: "Christian", caste: "Roman Catholic" },
            career: { profession: "Fitness Trainer", income: "22 LPA", company: "Cult.fit" },
            lifestyle: { diet: "Vegan", smoking: "No", drinking: "No" },
            height: "5'3",
            aboutMe: "Fitness trainer who loves pushing limits. Looking for a workout buddy for life.",
            dob: "1993-04-28",
            photos: [
                "https://images.unsplash.com/photo-1545912452-8ea1325d4871?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    },
    {
        name: "Tamannaah Bhatia",
        email: "tamannaah.real@example.com",
        phone: "+91 9876500012",
        gender: "Female",
        password: "password123",
        age: 28,
        location: { city: "Mumbai", country: "India" },
        avatar: "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=2000&auto=format&fit=crop",
        reels: [],
        metadata: {
            religion: { faith: "Hindu", caste: "Sindhi" },
            career: { profession: "Jewellery Designer", income: "35 LPA", company: "Tanishq" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'5",
            aboutMe: "Jewellery designer with an eye for detail. I am milky white and graceful.",
            dob: "1989-12-21",
            photos: [
                "https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?q=80&w=2000&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=2000&auto=format&fit=crop"
            ]
        }
    }
];

async function fixAndSeed() {
    console.log("🛠️ FIXING SCHEMA & SEEDING...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 1. ADD COLUMN IF NOT EXISTS
        try {
            await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(50)`);
            console.log("✅ Column 'phone' verified/added.");
        } catch (e) {
            console.log("⚠️ Could not add column (might exist?):", e);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        for (const user of realProfiles) {
            // Check if user exists, if so update phone, else full insert?
            // Safer to delete and re-insert to ensure clean state
            await client.query("DELETE FROM public.profiles WHERE user_id IN (SELECT id FROM public.users WHERE email = $1)", [user.email]);
            await client.query("DELETE FROM public.users WHERE email = $1", [user.email]);

            // Insert User with Avatar AND PHONE
            const res = await client.query(`
                INSERT INTO public.users (email, password_hash, full_name, gender, age, location_name, avatar_url, phone)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING id
            `, [user.email, hashedPassword, user.name, user.gender, user.age, user.location.city, user.avatar, user.phone]);

            const userId = res.rows[0].id;

            // Prepare Metadata (include reels here)
            const finalMetadata = {
                ...user.metadata,
                reels: user.reels,
                phone: user.phone // redundancy for safety
            };

            // Insert Profile
            await client.query(`
                INSERT INTO public.profiles (user_id, raw_prompt, metadata, updated_at, photos)
                VALUES ($1, $2, $3, NOW(), $4)
            `, [
                userId,
                user.metadata.aboutMe,
                JSON.stringify(finalMetadata),
                JSON.stringify(user.metadata.photos)
            ]);

            console.log(`✅ Updated Real Profile: ${user.name}`);
        }

        await client.query('COMMIT');
        console.log("🎉 REAL PROFILES FIXED & SEEDED!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Fix Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

fixAndSeed();
