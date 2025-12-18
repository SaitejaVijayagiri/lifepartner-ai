import express from 'express';
import { pool } from '../db';
import { getUserId } from './profile'; // Reuse helper

const router = express.Router();

// GET / - Fetch Notifications
router.get('/', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        const result = await client.query(`
            SELECT * FROM public.notifications 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `, [userId]);

        // Count unread
        const countRes = await client.query(`
            SELECT COUNT(*)::int as count FROM public.notifications 
            WHERE user_id = $1 AND is_read = FALSE
        `, [userId]);

        client.release();

        res.json({
            notifications: result.rows,
            unreadCount: countRes.rows[0].count
        });
    } catch (e) {
        console.error("Get Notifications Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// PUT /:id/read - Mark single as read
router.put('/:id/read', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        const client = await pool.connect();
        await client.query(`
            UPDATE public.notifications 
            SET is_read = TRUE 
            WHERE id = $1 AND user_id = $2
        `, [id, userId]);
        client.release();

        res.json({ success: true });
    } catch (e) {
        console.error("Mark Read Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// PUT /read-all - Mark all as read
router.put('/read-all', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        await client.query(`
            UPDATE public.notifications 
            SET is_read = TRUE 
            WHERE user_id = $1 AND is_read = FALSE
        `, [userId]);
        client.release();

        res.json({ success: true });
    } catch (e) {
        console.error("Mark All Read Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

export default router;
