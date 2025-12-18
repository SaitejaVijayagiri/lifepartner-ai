import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Get Notifications
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const result = await pool.query('SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC', [req.user.userId]);
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch notifications" });
    }
});

export default router;
