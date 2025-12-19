
import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// GET /calls/history
router.get('/history', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.id;
        const result = await pool.query(`
            SELECT 
                cl.*, 
                u.name as other_name, 
                u.photo_url as other_photo
            FROM call_logs cl
            JOIN users u ON (u.id = CASE WHEN cl.caller_id = $1 THEN cl.receiver_id ELSE cl.caller_id END)
            WHERE cl.caller_id = $1 OR cl.receiver_id = $1
            ORDER BY cl.started_at DESC
            LIMIT 50
        `, [userId]);

        // Transform keys to camelCase for frontend
        const logs = result.rows.map(row => ({
            id: row.id,
            otherName: row.other_name,
            otherPhoto: row.other_photo, // Fixed: Postgres returns lowercase aliases
            type: row.type,
            status: row.status,
            duration: row.duration_seconds,
            startedAt: row.started_at,
            isCaller: row.caller_id === userId
        }));

        res.json(logs);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch call logs" });
    }
});

// POST /calls/log
// Internal use or called by client at end of call
router.post('/log', authenticateToken, async (req: any, res) => {
    try {
        const { receiverId, type, status, duration } = req.body;
        const callerId = req.user.userId;

        await pool.query(`
            INSERT INTO call_logs (caller_id, receiver_id, type, status, duration_seconds, ended_at)
            VALUES ($1, $2, $3, $4, $5, NOW())
        `, [callerId, receiverId, type || 'VIDEO', status || 'COMPLETED', duration || 0]);

        res.json({ success: true });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to log call" });
    }
});

export default router;
