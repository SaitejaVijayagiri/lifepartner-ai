import { Router } from 'express';
import { GAME_STORE, PROFILE_STORE } from '../store';

const router = Router();

const QUESTIONS = [
    { id: 1, text: "Ideal Vacation?", options: ["Relaxing Beach 🏖️", "Adventure Hike 🏔️"] },
    { id: 2, text: "Friday Night?", options: ["Netflix & Chill 🍿", "Party Out 💃"] },
    { id: 3, text: "Money Style?", options: ["Save for Future 💰", "Live in Moment 💸"] },
    { id: 4, text: "Conflict?", options: ["Solve Immediately 🗣️", "Cool Down First 🧊"] },
    { id: 5, text: "Social Battery?", options: ["Small Group 👯", "Big Crowd 🏟️"] }
];

// Start a Game
router.post('/start', (req, res) => {
    const { partnerId } = req.body; // In real app, get userId from auth
    // Mock user for now or get from context if we had robust auth middleware

    const gameId = Math.random().toString(36).substring(7);

    // Create Session
    GAME_STORE[gameId] = {
        id: gameId,
        players: ["USER_ME", partnerId], // Assuming 'USER_ME' is current user for demo
        questions: QUESTIONS.map(q => ({ ...q, answers: {} })).slice(0, 5) as any,
        status: 'active',
        scores: {}
    };

    res.json({ success: true, gameId, questions: GAME_STORE[gameId].questions });
});

// Submit Answer
router.post('/:id/answer', (req, res) => {
    const { id } = req.params;
    const { userId, questionId, optionIndex } = req.body;

    const game = GAME_STORE[id];
    if (!game) return res.status(404).json({ error: "Game not found" });

    const q = game.questions.find(q => q.id === questionId);
    if (!q) return res.status(404).json({ error: "Question not found" });

    // Save User Answer
    q.answers[userId] = optionIndex;

    // MOCK: Partner accepts/answers instantly
    const partnerId = game.players.find(p => p !== userId) || "PARTNER_BOT";
    // Partner picks random or same? Let's make it 80% compatible for good vibes
    const partnerChoice = Math.random() > 0.2 ? optionIndex : (optionIndex === 0 ? 1 : 0);
    q.answers[partnerId] = partnerChoice;

    res.json({ success: true, partnerChoice });
});

export default router;
