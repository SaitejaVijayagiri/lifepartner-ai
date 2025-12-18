import express from 'express';
import { sanitizeContent } from '../utils/contentFilter';

import { pool } from '../db';

const router = express.Router();

// GET Chat History
router.get('/:connectionId/history', async (req: any, res) => {
    const { connectionId } = req.params;
    const userId = req.user?.userId; // Assuming auth middleware attached this

    if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
    }

    try {
        const client = await pool.connect();
        const result = await client.query(`
            SELECT id, sender_id, receiver_id, content as text, timestamp 
            FROM public.messages 
            WHERE (sender_id = $1 AND receiver_id = $2) 
               OR (sender_id = $2 AND receiver_id = $1)
            ORDER BY timestamp ASC
        `, [userId, connectionId]);

        // Format for frontend
        const history = result.rows.map(row => ({
            id: row.id,
            text: row.text,
            senderId: row.sender_id,
            timestamp: row.timestamp
        }));

        client.release();
        res.json(history);
    } catch (e) {
        console.error("Fetch History Error", e);
        res.status(500).json({ error: "Failed to fetch chat history" });
    }
});

// SEND Message (Fallback / API based)
router.post('/:connectionId/send', async (req: any, res) => {
    const { connectionId } = req.params; // receiverId
    const { text, senderId } = req.body; // senderId usually from token, but using body for flexibility

    if (!text || !senderId) {
        return res.status(400).json({ error: "Missing text or senderId" });
    }

    const cleanText = sanitizeContent(text);

    try {
        const client = await pool.connect();
        const result = await client.query(`
            INSERT INTO public.messages (sender_id, receiver_id, content) 
            VALUES ($1, $2, $3) 
            RETURNING id, timestamp
        `, [senderId, connectionId, cleanText]);

        const newMessage = {
            id: result.rows[0].id,
            text: cleanText,
            senderId,
            timestamp: result.rows[0].timestamp
        };

        client.release();
        res.json({ success: true, message: newMessage });

    } catch (e) {
        console.error("Send Message Error", e);
        res.status(500).json({ error: "Failed to send message" });
    }
});

export default router;
