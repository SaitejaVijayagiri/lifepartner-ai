import { PROFILE_STORE, MatrimonyProfile, INTERACTION_STORE } from './store';

export const seedDatabase = () => {
    const seeds: MatrimonyProfile[] = [
        {
            userId: 'seed-1',
            email: 'ananya@example.com',
            name: 'Dr. Ananya Reddy',
            gender: 'Female',
            age: 29,
            height: '5ft 6in',
            maritalStatus: 'Never Married',
            motherTongue: 'Telugu',
            location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
            religion: {
                religion: 'Hindu',
                caste: 'Reddy',
                interCasteOpen: false
            },
            career: {
                education: 'MD (Cardiology)',
                profession: 'Doctor',
                income: '30-40 LPA'
            },
            family: {
                type: 'Nuclear',
                values: 'Moderate',
                fatherOccupation: 'Professor',
                motherOccupation: 'Homemaker'
            },
            lifestyle: {
                diet: 'Veg',
                smoke: 'No',
                drink: 'Socially'
            },
            prompt: "I am a dedicated cardiologist who loves saving lives. In my free time, I do yoga and read. I am looking for someone ambitious, kind, and health-conscious. No smoking please.",
            reels: [
                "https://cdn.coverr.co/videos/coverr-woman-doing-yoga-outdoors-4412/1080p.mp4", // Yoga URL
                "https://cdn.coverr.co/videos/coverr-doctor-checking-ipad-5838/1080p.mp4" // Doctor URL
            ],
            joinedAt: new Date()
        },
        {
            userId: 'seed-2',
            email: 'arjun@example.com',
            name: 'Arjun Mehta',
            gender: 'Male',
            age: 31,
            height: '5ft 11in',
            maritalStatus: 'Never Married',
            motherTongue: 'Hindi',
            location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
            religion: {
                religion: 'Hindu',
                caste: 'Brahmin',
                interCasteOpen: true
            },
            career: {
                education: 'M.Tech (CS)',
                profession: 'Software Architect',
                income: '40-50 LPA'
            },
            family: {
                type: 'Joint',
                values: 'Liberal',
                fatherOccupation: 'Business',
                motherOccupation: 'Teacher'
            },
            lifestyle: {
                diet: 'Non-Veg',
                smoke: 'No',
                drink: 'Socially'
            },
            prompt: "I build AI systems for a living. I love sci-fi, hiking, and coding late at night. Looking for a partner who is intellectual, geeky, and independent.",
            reels: [
                "https://cdn.coverr.co/videos/coverr-hiker-walking-in-mountains-5431/1080p.mp4", // Hiking
                "https://cdn.coverr.co/videos/coverr-typing-code-on-laptop-5527/1080p.mp4" // Coding
            ],
            joinedAt: new Date()
        }
    ];

    seeds.forEach(user => {
        PROFILE_STORE[user.userId] = {
            ...user,
            analysis: { summary: user.prompt }
        };
    });

    // Ensure mock-uuid exists if not already
    if (!PROFILE_STORE['mock-uuid']) {
        PROFILE_STORE['mock-uuid'] = {
            userId: 'mock-uuid',
            name: 'Demo User',
            email: 'demo@example.com',
            gender: 'Male',
            joinedAt: new Date(),
            prompt: "I am a demo user",
            // @ts-ignore
            religion: {}, location: { city: 'Mumbai', country: 'India' }, career: {}, family: {}, lifestyle: {}
        };
    }

    // Seed Interactions
    // 1. Connection (Chat Ready)

    // Reset
    INTERACTION_STORE.length = 0;

    INTERACTION_STORE.push({
        id: 'seed-conn-1',
        fromUserId: 'seed-1', // Dr. Ananya
        toUserId: 'mock-uuid', // Me
        status: 'accepted',
        timestamp: new Date()
    });

    // 2. Pending Request (Incoming)
    INTERACTION_STORE.push({
        id: 'seed-req-1',
        fromUserId: 'seed-2', // Arjun
        toUserId: 'mock-uuid', // Me
        status: 'pending',
        timestamp: new Date()
    });

    console.log(`✅ Seeded Database with ${seeds.length} Profiles and ${INTERACTION_STORE.length} Interactions.`);
};
