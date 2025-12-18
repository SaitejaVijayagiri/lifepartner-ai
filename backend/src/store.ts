// Comprehensive Matrimony Types

export interface MatrimonyProfile {
    // Identity
    userId: string;
    email: string;
    password?: string; // Stored hash in real app

    // Personal
    name: string;
    photoUrl?: string; // Primary Thumbnail
    photos?: string[]; // Gallery (New)
    gender: 'Male' | 'Female' | 'Other';
    dob?: string;
    age?: number; // Derived usually
    height?: string; // "5ft 10in"
    maritalStatus?: 'Never Married' | 'Divorced' | 'Widowed' | 'Awaiting Divorce';
    motherTongue?: string;
    location: {
        city: string;
        state?: string;
        country: string;
    };

    // Religion & Community
    religion: {
        religion: string; // Hindu, Muslim, etc.
        caste?: string;
        subCaste?: string;
        gothra?: string;
        interCasteOpen: boolean;
    };

    // Career
    career: {
        education: string; // Masters, Bachelors
        college?: string;
        profession: string; // Software Engineer
        company?: string;
        industry?: string;
        income?: string; // "20-30 LPA"
        workLocation?: string;
    };

    // Family
    family: {
        type: 'Joint' | 'Nuclear';
        values: 'Orthodox' | 'Traditional' | 'Moderate' | 'Liberal';
        fatherOccupation?: string;
        motherOccupation?: string;
        siblings?: string;
    };

    // Lifestyle
    lifestyle: {
        diet: 'Veg' | 'Non-Veg' | 'Eggetarian' | 'Vegan';
        smoke: 'No' | 'Yes' | 'Occasionally';
        drink: 'No' | 'Yes' | 'Socially';
        fitness?: 'Active' | 'Moderate' | 'Sedentary';
        spiritual?: string;
    };

    // Interests
    interests?: string[];
    communicationStyle?: string;
    introvertScale?: number; // 1-10

    // Prompt & AI
    prompt: string;
    analysis?: any;
    reels?: string[]; // TikTok-style video URLs

    // Privacy
    isVerified?: boolean;
    tier?: 'Free' | 'Gold' | 'Platinum';

    // New Features
    aboutMe?: string;
    horoscope?: {
        zodiacSign?: string;
        nakshatra?: string;
        manglik?: 'Yes' | 'No' | 'Don\'t Know';
        birthTime?: string;
        birthPlace?: string;
    };
    partnerPreferences?: {
        ageRange?: string; // "24-29"
        heightRange?: string; // "5'2 - 5'8"
        religions?: string[];
        income?: string;
    };

    joinedAt: Date;
}

// Interactions
export interface Interaction {
    id: string;
    fromUserId: string;
    toUserId: string;
    status: 'pending' | 'accepted' | 'rejected' | 'declined';
    timestamp: Date;
}

export interface GameSession {
    id: string;
    players: [string, string]; // [userId1, userId2]
    questions: {
        id: number;
        text: string;
        options: [string, string];
        answers: Record<string, number>; // userId -> optionIndex (0 or 1)
    }[];
    status: 'waiting' | 'active' | 'finished';
    scores: Record<string, number>; // Compatibility Score
}

export const PROFILE_STORE: Record<string, MatrimonyProfile> = {};
export const INTERACTION_STORE: Interaction[] = [];
export const GAME_STORE: Record<string, GameSession> = {};
