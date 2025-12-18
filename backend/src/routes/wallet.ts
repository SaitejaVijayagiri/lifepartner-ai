import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Get Wallet Balance
router.get('/balance', authenticateToken, async (req: any, res) => {
    try {
        const client = await pool.connect();
        const result = await client.query(`SELECT coins FROM users WHERE id = $1`, [req.user.userId]);
        const transactions = await client.query(`
            SELECT * FROM transactions WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20
        `, [req.user.userId]);

        client.release();

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        res.json({
            balance: result.rows[0].coins,
            history: transactions.rows
        });
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: "Failed to fetch balance" });
    }
});

// Send Gift
router.post('/gift', authenticateToken, async (req: any, res) => {
    const { toUserId, giftId, cost } = req.body;

    if (!toUserId || !cost) return res.status(400).json({ error: "Missing details" });

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check Balance
        const userRes = await client.query(`SELECT coins FROM users WHERE id = $1 FOR UPDATE`, [req.user.userId]);
        const currentBalance = userRes.rows[0].coins;

        if (currentBalance < cost) {
            await client.query('ROLLBACK');
            return res.status(402).json({ error: "Insufficient coins" });
        }

        // 2. Deduct Coins
        await client.query(`UPDATE users SET coins = coins - $1 WHERE id = $2`, [cost, req.user.userId]);

        // 3. Record Transaction
        await client.query(`
            INSERT INTO transactions (user_id, type, amount, description, metadata)
            VALUES ($1, 'SPEND', $2, $3, $4)
        `, [req.user.userId, cost, `Sent Gift: ${giftId}`, { toUserId, giftId }]);

        // 4. (Optional) Notifying Receiver or crediting creator currently omitted for simplicity

        await client.query('COMMIT');

        res.json({ success: true, newBalance: currentBalance - cost });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Gift Failed", e);
        res.status(500).json({ error: "Transaction failed" });
    } finally {
        client.release();
    }
});

// Purchase Profile Boost
router.post('/boost', authenticateToken, async (req: any, res) => {
    const BOOST_COST = 50;
    const DURATION_MINUTES = 30;

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // 1. Check Balance
        const userRes = await client.query(`SELECT coins FROM users WHERE id = $1 FOR UPDATE`, [req.user.userId]);
        const currentBalance = userRes.rows[0].coins;

        if (currentBalance < BOOST_COST) {
            await client.query('ROLLBACK');
            return res.status(402).json({ error: `Insufficient coins. Need ${BOOST_COST} coins.` });
        }

        // 2. Deduct Coins
        await client.query(`UPDATE users SET coins = coins - $1 WHERE id = $2`, [BOOST_COST, req.user.userId]);

        // 3. Activate Boost
        await client.query(`
            UPDATE users 
            SET is_boosted = TRUE, 
                boost_expires_at = NOW() + INTERVAL '${DURATION_MINUTES} minutes' 
            WHERE id = $1
        `, [req.user.userId]);

        // 4. Record Transaction
        await client.query(`
            INSERT INTO transactions (user_id, type, amount, description)
            VALUES ($1, 'SPEND', $2, $3)
        `, [req.user.userId, BOOST_COST, `Profile Boost (${DURATION_MINUTES} mins)`]);

        await client.query('COMMIT');
        res.json({ success: true, message: "Profile Boosted!" });

    } catch (e) {
        await client.query('ROLLBACK');
        console.error("Boost Failed", e);
        res.status(500).json({ error: "Failed to activate boost" });
    } finally {
        client.release();
    }
});

export default router;
