
import { pool } from '../db';
import bcrypt from 'bcrypt';

const profiles = [
    {
        name: "Priya Sharma",
        email: "priya.sharma@example.com",
        gender: "Female",
        password: "password123",
        age: 26,
        location: { city: "Mumbai", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Brahmin" },
            career: { profession: "Software Engineer", income: "25 LPA", company: "Google" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'6",
            aboutMe: "I am a fair, beautiful girl looking for a compatible partner. I love reading and traveling. Spiritual and family-oriented.",
            dob: "1998-05-15"
        }
    },
    {
        name: "Aisha Khan",
        email: "aisha.khan@example.com",
        gender: "Female",
        password: "password123",
        age: 27,
        location: { city: "Delhi", country: "India" },
        metadata: {
            religion: { faith: "Muslim", caste: "Sunni" },
            career: { profession: "Doctor", income: "18 LPA", company: "Apollo Hospital" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Occasionally" },
            height: "5'4",
            aboutMe: "Medical professional with a passion for service. I am wheatish, athletic, and love hiking.",
            dob: "1997-08-20"
        }
    },
    {
        name: "Rohan Das",
        email: "rohan.das@example.com",
        gender: "Male",
        password: "password123",
        age: 29,
        location: { city: "Bangalore", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Kayastha" },
            career: { profession: "Product Manager", income: "35 LPA", company: "Microsoft" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Yes" },
            height: "5'11",
            aboutMe: "Ambitions product leader. I am tall, handsome, and love tech. Looking for an educated partner.",
            dob: "1995-12-10"
        }
    },
    {
        name: "Sneha Patel",
        email: "sneha.patel@example.com",
        gender: "Female",
        password: "password123",
        age: 25,
        location: { city: "Ahmedabad", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Patel" },
            career: { profession: "Architect", income: "12 LPA", company: "Design Studio" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'7",
            aboutMe: "Creative soul. I am fair and slim. Love painting and classical music.",
            dob: "1999-03-25"
        }
    },
    {
        name: "Arjun Reddy",
        email: "arjun.reddy@example.com",
        gender: "Male",
        password: "password123",
        age: 30,
        location: { city: "Hyderabad", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Reddy" },
            career: { profession: "Civil Engineer", income: "22 LPA", company: "L&T" },
            lifestyle: { diet: "Non-Veg", smoking: "Yes", drinking: "Yes" },
            height: "6'0",
            aboutMe: "Adventure lover. Tall and fair. Looking for someone open-minded.",
            dob: "1994-07-30"
        }
    },
    {
        name: "Meera Iyer",
        email: "meera.iyer@example.com",
        gender: "Female",
        password: "password123",
        age: 28,
        location: { city: "Chennai", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Brahmin" },
            career: { profession: "Chartered Accountant", income: "30 LPA", company: "Deloitte" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'2",
            aboutMe: "Traditional yet modern. I am beautiful and love cooking. Looking for a vegetarian partner.",
            dob: "1996-01-15"
        }
    },
    {
        name: "Zainab Fatima",
        email: "zainab.fatima@example.com",
        gender: "Female",
        password: "password123",
        age: 24,
        location: { city: "Lucknow", country: "India" },
        metadata: {
            religion: { faith: "Muslim", caste: "Shia" },
            career: { profession: "Teacher", income: "8 LPA", company: "Public School" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "No" },
            height: "5'5",
            aboutMe: "Kind-hearted and soft-spoken. I am fair with a pleasant personality. Love reading Quran.",
            dob: "2000-05-05"
        }
    },
    {
        name: "Vikram Singh",
        email: "vikram.singh@example.com",
        gender: "Male",
        password: "password123",
        age: 32,
        location: { city: "Jaipur", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Rajput" },
            career: { profession: "Hotelier", income: "50 LPA", company: "Heritage Hotels" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Yes" },
            height: "5'10",
            aboutMe: "Business oriented. I am fit and handsome. Love horse riding and polo.",
            dob: "1992-11-12"
        }
    },
    {
        name: "Sarah Thomas",
        email: "sarah.thomas@example.com",
        gender: "Female",
        password: "password123",
        age: 26,
        location: { city: "Kochi", country: "India" },
        metadata: {
            religion: { faith: "Christian", caste: "RC" },
            career: { profession: "Nurse", income: "15 LPA", company: "Medical Trust" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "No" },
            height: "5'3",
            aboutMe: "Caring and compassionate. I am pretty and honest. Looking for a God-fearing partner.",
            dob: "1998-09-09"
        }
    },
    {
        name: "Rahul Verma",
        email: "rahul.verma@example.com",
        gender: "Male",
        password: "password123",
        age: 28,
        location: { city: "Pune", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Maratha" },
            career: { profession: "Data Scientist", income: "28 LPA", company: "Infosys" },
            lifestyle: { diet: "Veg", smoking: "No", drinking: "No" },
            height: "5'9",
            aboutMe: "Tech savvy and calm. I am fair and good looking. Love trekking.",
            dob: "1996-06-20"
        }
    },
    {
        name: "Kavya Menon",
        email: "kavya.menon@example.com",
        gender: "Female",
        password: "password123",
        age: 27,
        location: { city: "Bangalore", country: "India" },
        metadata: {
            religion: { faith: "Hindu", caste: "Nair" },
            career: { profession: "UX Designer", income: "20 LPA", company: "Flipkart" },
            lifestyle: { diet: "Non-Veg", smoking: "No", drinking: "Occasionally" },
            height: "5'6",
            aboutMe: "Artistic and independent. I am wheatish, beautiful, and love photography.",
            dob: "1997-02-14"
        }
    }
];

async function seed() {
    console.log("🌱 STARTING SEED...");
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash("password123", salt);

        for (const user of profiles) {
            // 1. Check if user email exists to avoid duplicates
            const check = await client.query("SELECT id FROM public.users WHERE email = $1", [user.email]);
            if (check.rows.length > 0) {
                console.log(`Skipping ${user.email}, already exists.`);
                continue;
            }

            // 2. Insert User
            const res = await client.query(`
                INSERT INTO public.users (email, password_hash, full_name, gender, age, location_name)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id
            `, [user.email, hashedPassword, user.name, user.gender, user.age, user.location.city]);

            const userId = res.rows[0].id;

            // 3. Insert Profile
            await client.query(`
                INSERT INTO public.profiles (user_id, raw_prompt, metadata, updated_at)
                VALUES ($1, $2, $3, NOW())
            `, [userId, user.metadata.aboutMe, JSON.stringify(user.metadata)]);

            console.log(`✅ Created: ${user.name} (${user.gender})`);
        }

        await client.query('COMMIT');
        console.log("🎉 SEEDING COMPLETE!");
    } catch (e) {
        await client.query('ROLLBACK');
        console.error("❌ Seed Failed:", e);
    } finally {
        client.release();
        process.exit();
    }
}

seed();
