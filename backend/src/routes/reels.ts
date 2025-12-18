import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Get Reels
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const result = await pool.query('SELECT * FROM reels ORDER BY created_at DESC LIMIT 20');
        res.json(result.rows);
    } catch (e) {
        res.status(500).json({ error: "Failed to fetch reels" });
    }
});

export default router;
