import { Router } from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = Router();

const QUESTIONS = [
    { id: 1, text: "Ideal Vacation?", options: ["Relaxing Beach 🏖️", "Adventure Hike 🏔️"] },
    { id: 2, text: "Friday Night?", options: ["Netflix & Chill 🍿", "Party Out 💃"] },
    { id: 3, text: "Money Style?", options: ["Save for Future 💰", "Live in Moment 💸"] },
    { id: 4, text: "Conflict?", options: ["Solve Immediately 🗣️", "Cool Down First 🧊"] },
    { id: 5, text: "Social Battery?", options: ["Small Group 👯", "Big Crowd 🏟️"] }
];

// Start a Game (Classic)
router.post('/start', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const { partnerId } = req.body;

        if (!partnerId) return res.status(400).json({ error: "Partner ID required" });

        const client = await pool.connect();

        // Check if active game exists? For simplicity, we create a new one.
        const result = await client.query(`
            INSERT INTO games (player_a_id, player_b_id, status)
            VALUES ($1, $2, 'ACTIVE')
            RETURNING id
        `, [userId, partnerId]);

        const gameId = result.rows[0].id;
        client.release();

        res.json({ success: true, gameId, questions: QUESTIONS });
    } catch (e: any) {
        console.error("Start Game Error", e);
        res.status(500).json({ error: "Failed to start game" });
    }
});

// Start AI Scenario (Phase 2)
router.post('/scenario/start', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const { partnerId } = req.body;

        console.log(`Generating AI Scenario for ${userId} & ${partnerId}`);

        // 1. Fetch Profiles
        const p1 = await pool.query('SELECT metadata, bio FROM profiles WHERE user_id = $1', [userId]);
        const p2 = await pool.query('SELECT metadata, bio FROM profiles WHERE user_id = $1', [partnerId]);

        const profileA = p1.rows[0] || { bio: "Unknown" };
        const profileB = p2.rows[0] || { bio: "Unknown" };

        // 2. Generate Scenario
        const { AIService } = await import('../services/ai');
        const aiService = new AIService();

        const scenario = await aiService.generateRelationshipScenario(profileA, profileB);

        res.json({ success: true, scenario });

    } catch (e) {
        console.error("Scenario Error", e);
        res.status(500).json({ error: "Failed to generate scenario" });
    }
});

// Submit Answer
router.post('/:id/answer', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params; // Game ID
        const userId = req.user.userId;
        const { questionId, optionIndex } = req.body;

        const client = await pool.connect();

        // 1. Verify Game Participation
        const gameRes = await client.query("SELECT * FROM games WHERE id = $1", [id]);
        if (gameRes.rows.length === 0) {
            client.release();
            return res.status(404).json({ error: "Game not found" });
        }
        const game = gameRes.rows[0];

        if (game.player_a_id !== userId && game.player_b_id !== userId) {
            client.release();
            return res.status(403).json({ error: "Not a player in this game" });
        }

        // 2. Save Answer (Upsert to allow changing answer? No, immutable for now)
        await client.query(`
            INSERT INTO game_moves (game_id, question_id, player_id, answer_index)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (game_id, question_id, player_id) DO NOTHING
        `, [id, questionId, userId, optionIndex]);

        // 3. Check for Match immediately (Optional)
        // OR Return partner's answer if they already answered
        const partnerId = (game.player_a_id === userId) ? game.player_b_id : game.player_a_id;

        const partnerMove = await client.query(`
            SELECT answer_index FROM game_moves 
            WHERE game_id = $1 AND question_id = $2 AND player_id = $3
        `, [id, questionId, partnerId]);

        client.release();

        let partnerChoice = null;
        if (partnerMove.rows.length > 0) {
            partnerChoice = partnerMove.rows[0].answer_index;
        }

        res.json({ success: true, partnerChoice });

    } catch (e) {
        console.error("Game Answer Error", e);
        res.status(500).json({ error: "Failed to submit answer" });
    }
});

// Get Game State (For polling or initial load)
router.get('/:id', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;
        const userId = req.user.userId;

        const client = await pool.connect();

        // Verify Auth
        const gameRes = await client.query("SELECT * FROM games WHERE id = $1", [id]);
        if (gameRes.rows.length === 0) return res.status(404).json({ error: "Game not found" });
        const game = gameRes.rows[0];

        // Fetch Moves
        const movesRes = await client.query("SELECT question_id, player_id, answer_index FROM game_moves WHERE game_id = $1", [id]);

        client.release();

        // Reconstruct State
        const questionsWithAnswers = QUESTIONS.map(q => {
            const myMove = movesRes.rows.find((m: any) => m.question_id === q.id && m.player_id === userId);
            const otherMove = movesRes.rows.find((m: any) => m.question_id === q.id && m.player_id !== userId);

            return {
                ...q,
                answers: {
                    [userId]: myMove ? myMove.answer_index : undefined,
                    [game.player_a_id === userId ? game.player_b_id : game.player_a_id]: otherMove ? otherMove.answer_index : undefined
                }
            };
        });

        res.json({ success: true, gameId: id, questions: questionsWithAnswers });

    } catch (e) {
        console.error("Get Game Error", e);
        res.status(500).json({ error: "Failed to fetch game" });
    }
});

export default router;
