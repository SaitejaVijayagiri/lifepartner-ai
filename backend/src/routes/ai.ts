import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Curated Icebreaker Library (Simulating AI for Reliability/Speed)
const ICEBREAKERS = {
    travel: [
        "I see you like traveling! What's the one place you'd love to go back to?",
        "If you could teleport anywhere right now, where would you go?",
        "Beach vacation or Mountain trek? The debate ends today."
    ],
    food: [
        "I noticed you're a foodie. What's the best dish you've ever had?",
        "If you had to eat one cuisine for the rest of your life, what would it be?",
        "Pineapple on pizza: Yes or Illegal?"
    ],
    movies: [
        "What's a movie you can watch a hundred times without getting bored?",
        "If they made a movie about your life, who would play you?",
        "Netflix and chill or Cinema popcorn?"
    ],
    music: [
        "What's the last song you listened to on repeat?",
        "If they made a movie about your life, who would play you?",
        "Concerts or Headphones?"
    ],
    default: [
        "Hi! Your profile vibe is awesome. How's your week going?",
        "I'm bad at starting conversations, but I really wanted to say hi.",
        "Quick question: What's the highlight of your day so far?",
        "I bet you have a great story behind that profile picture."
    ]
};

// POST /ai/icebreaker
router.post('/icebreaker', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const { targetUserId } = req.body;

        if (!targetUserId) {
            return res.status(400).json({ error: "Missing targetUserId" });
        }

        // 1. Fetch Target User's Profile
        const targetUserQuery = await pool.query(
            `SELECT name, interests, bio FROM users WHERE id = $1`,
            [targetUserId]
        );

        if (targetUserQuery.rows.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const target = targetUserQuery.rows[0];
        const interests = target.interests || []; // e.g. ["travel", "photography"]

        // 2. MONETIZATION CHECK (Future: deduction logic here)
        // For now, it's a "Teaser" feature (Always free or limited)

        // 3. Generate Suggestions (Heuristic AI)
        let suggestions: string[] = [];

        // Strategy: 1 Interest-based + 2 Random/General
        interests.forEach((interest: string) => {
            const key = interest.toLowerCase();
            if (ICEBREAKERS[key as keyof typeof ICEBREAKERS]) {
                suggestions.push(...ICEBREAKERS[key as keyof typeof ICEBREAKERS]);
            }
        });

        // Fill remaining with generic high-quality openers
        // Shuffle defaults
        const shuffledDefaults = ICEBREAKERS.default.sort(() => 0.5 - Math.random());

        while (suggestions.length < 3) {
            if (shuffledDefaults.length > 0) {
                suggestions.push(shuffledDefaults.pop()!);
            } else {
                break; // Should not happen
            }
        }

        // Slice to max 3
        const finalSuggestions = suggestions.slice(0, 3);

        res.json({
            suggestions: finalSuggestions,
            context: `Based on ${target.name}'s interests: ${interests.join(', ')}`
        });

    } catch (error) {
        console.error("AI Icebreaker Error:", error);
        res.status(500).json({ error: "Failed to generate magic" });
    }
});



export default router;
