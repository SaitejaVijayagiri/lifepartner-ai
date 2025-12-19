
import express from 'express';
import { pool } from '../db';
import { NotificationService } from '../services/notification';
import { authenticateToken } from '../middleware/auth';


const router = express.Router();
const notificationService = NotificationService.getInstance();

// 1. Register Token
router.post('/register', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const { token, platform } = req.body;
        if (!token) return res.status(400).json({ error: "Token required" });

        // Upsert
        await pool.query(`
            INSERT INTO device_tokens (user_id, token, platform)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, token) DO NOTHING
        `, [userId, token, platform || 'android']);

        res.json({ success: true });
    } catch (e) {
        console.error("Token Register Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// 2. Test Push (Dev)
// 2. Test Push (Admin Only)
router.post('/test', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        // Simple Admin Check (Environmental or Hardcoded for this project scope)
        // Ideally this should use a proper Role Based Access Control (RBAC) system.
        // For now, we query the user's email.
        const userRes = await pool.query("SELECT email FROM users WHERE id = $1", [userId]);
        const email = userRes.rows[0]?.email;

        const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "").split(',');
        if (!ADMIN_EMAILS.includes(email) && email !== 'admin@lifepartner.ai') {
            return res.status(403).json({ error: "Admin access required" });
        }

        const { title, body } = req.body;

        await notificationService.sendToUser(pool, userId, title || "Test Notification", body || "This is a test from LifePartner AI");

        res.json({ success: true, message: "Notification queued" });
    } catch (e) {
        console.error("Test Push Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

export default router;
