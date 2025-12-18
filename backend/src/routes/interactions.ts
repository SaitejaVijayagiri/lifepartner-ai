import express from 'express';
import { pool } from '../db';
import { getIO } from '../socket'; // Import socket getter

const router = express.Router();

const getUserId = (req: express.Request) => {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        const token = authHeader.split(' ')[1];
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString());
            return payload.userId;
        } catch (e) { return null; }
    }
    return null;
}

// Get Requests (Pending matches where I am 'user_b' - traditionally receiving?)
// Actually matches table has user_a and user_b.
// Let's assume interactions are stored in `matches` table where status='pending'.
// But `matches` is usually AI recommendations.
// Let's look at init.sql: "matches" table has user_a, user_b, status.
// A sent request is: INSERT INTO matches (user_a, user_b, status='pending').
// So incoming requests for me: user_b = me AND status = 'pending'.

router.get('/requests', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        const result = await client.query(`
            SELECT m.id as interaction_id, m.created_at,
                   u.id as from_id, u.full_name as from_name
            FROM matches m
            JOIN users u ON m.user_a_id = u.id
            WHERE m.user_b_id = $1 AND m.status = 'pending'
        `, [userId]);

        client.release();

        const requests = result.rows.map(r => ({
            interactionId: r.interaction_id,
            fromUser: {
                id: r.from_id,
                name: r.from_name,
                photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.from_id}`,
                career: { profession: "Member" } // Join profiles for more data
            },
            timestamp: r.created_at
        }));

        res.json(requests);
    } catch (e) {
        console.error("Get Requests Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Get Connections (Accepted)
router.get('/connections', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const client = await pool.connect();
        // Find matches where status='accepted' AND (user_a=me OR user_b=me)
        const result = await client.query(`
            SELECT m.id as interaction_id, m.created_at,
                   u1.id as u1_id, u1.full_name as u1_name,
                   u2.id as u2_id, u2.full_name as u2_name
            FROM matches m
            JOIN users u1 ON m.user_a_id = u1.id
            JOIN users u2 ON m.user_b_id = u2.id
            WHERE (m.user_a_id = $1 OR m.user_b_id = $1) AND m.status = 'accepted'
        `, [userId]);

        client.release();

        const connections = result.rows.map(r => {
            const isA = r.u1_id === userId;
            const partnerId = isA ? r.u2_id : r.u1_id;
            const partnerName = isA ? r.u2_name : r.u1_name;

            return {
                interactionId: r.interaction_id,
                partner: {
                    id: partnerId,
                    name: partnerName,
                    photoUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${partnerId}`,
                    role: "Member",
                    location: "India"
                },
                timestamp: r.created_at
            };
        });

        res.json(connections);
    } catch (e) {
        console.error("Get Connections Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Delete Connection
router.delete('/connections/:id', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { id } = req.params;
        // Verify user is part of the connection
        const client = await pool.connect();
        await client.query(`
            DELETE FROM matches 
            WHERE id = $1 AND (user_a_id = $2 OR user_b_id = $2)
        `, [id, userId]);

        client.release();
        res.json({ success: true });
    } catch (e) {
        console.error("Delete Connection Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Send Interest (Connect Request)
router.post('/interest', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { toUserId } = req.body;

        const client = await pool.connect();

        // Upsert: Only update STATUS. Do NOT touch is_liked.
        await client.query(`
            INSERT INTO public.matches (user_a_id, user_b_id, status, is_liked, score_total)
            VALUES ($1, $2, 'pending', FALSE, 0.8)
            ON CONFLICT (user_a_id, user_b_id) 
            DO UPDATE SET status = 'pending'
            WHERE matches.status IS DISTINCT FROM 'pending'
        `, [userId, toUserId]);

        // Emit Real-time Notification & Persist
        try {
            const msg = "Someone sent you an Interest Request! 💖";

            // Persist
            await client.query(`
                INSERT INTO public.notifications (user_id, type, message, data)
                VALUES ($1, 'request', $2, $3)
            `, [toUserId, msg, JSON.stringify({ fromUserId: userId })]);

            // Realtime
            getIO().to(toUserId).emit('notification:new', {
                type: 'request',
                message: msg,
                timestamp: new Date()
            });
        } catch (err) {
            console.warn("Notification failed:", err);
        }

        client.release();
        res.json({ success: true });
    } catch (e) {
        console.error("Send Interest Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Revoke Interest (Cancel Request)
router.delete('/interest/:toUserId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { toUserId } = req.params;

        const client = await pool.connect();
        // Only remove status=pending. Keep row if is_liked=true?
        // Actually, users might want to keep the "Like" if they cancel request?
        // Let's assume if I cancel request, I just set status=NULL.
        // If is_liked is false AND status becomes null, effectively row is dead (but exists).
        // Postgres doesn't auto-delete. That's fine.
        await client.query(`
            UPDATE matches 
            SET status = NULL 
            WHERE user_a_id = $1 AND user_b_id = $2 AND status = 'pending'
        `, [userId, toUserId]);

        client.release();
        res.json({ success: true });
    } catch (e) {
        console.error("Revoke Interest Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Like Profile (Instagram Style)
router.post('/like', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { toUserId } = req.body;

        const client = await pool.connect();

        // Upsert: Only update IS_LIKED = TRUE. Do NOT touch status.
        await client.query(`
            INSERT INTO public.matches (user_a_id, user_b_id, status, is_liked, score_total)
            VALUES ($1, $2, DEFAULT, TRUE, 0.8)
            ON CONFLICT (user_a_id, user_b_id) 
            DO UPDATE SET is_liked = TRUE
        `, [userId, toUserId]);

        // Notify
        try {
            const msg = "Someone liked your profile! ⭐";
            await client.query(`
                INSERT INTO public.notifications (user_id, type, message, data)
                VALUES ($1, 'like', $2, $3)
            `, [toUserId, 'like', JSON.stringify({ fromUserId: userId })]);

            getIO().to(toUserId).emit('notification:new', {
                type: 'like',
                message: msg,
                timestamp: new Date()
            });
        } catch (e) { console.warn("Notify error", e); }

        client.release();
        res.json({ success: true });
    } catch (e) {
        console.error("Like Profile Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Unlike Profile (Instagram Style)
router.delete('/like/:toUserId', async (req, res) => {
    try {
        const userId = getUserId(req);
        const { toUserId } = req.params;

        const client = await pool.connect();

        // Update is_liked = FALSE. Do NOT touch status.
        await client.query(`
            UPDATE matches 
            SET is_liked = FALSE
            WHERE user_a_id = $1 AND user_b_id = $2
        `, [userId, toUserId]);

        client.release();
        res.json({ success: true });
    } catch (e) {
        console.error("Unlike Profile Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// Accept
router.post('/:id/accept', async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();
        await client.query("UPDATE matches SET status = 'accepted' WHERE id = $1", [id]);
        client.release();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed" });
    }
});

// Decline
router.post('/:id/decline', async (req, res) => {
    try {
        const { id } = req.params;
        const client = await pool.connect();
        await client.query("UPDATE matches SET status = 'declined' WHERE id = $1", [id]);
        client.release();
        res.json({ success: true });
    } catch (e) {
        res.status(500).json({ error: "Failed" });
    }
});

// Report User
router.post('/report', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { reportedId, reason, details } = req.body;
        if (!reportedId || !reason) return res.status(400).json({ error: "Missing fields" });

        const client = await pool.connect();
        await client.query(`
            INSERT INTO public.reports (reporter_id, reported_id, reason, details)
            VALUES ($1, $2, $3, $4)
        `, [userId, reportedId, reason, details || '']);

        client.release();
        res.json({ success: true, message: "Report submitted" });

    } catch (e) {
        console.error("Report Error", e);
        res.status(500).json({ error: "Failed to submit report" });
    }
});

// POST /contact - Save Inquiry
router.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        if (!name || !email || !message) {
            return res.status(400).json({ error: "Missing fields" });
        }

        const client = await pool.connect();
        await client.query(`
            INSERT INTO public.contact_inquiries (name, email, message)
            VALUES ($1, $2, $3)
        `, [name, email, message]);

        client.release();
        res.json({ success: true, message: "Inquiry received" });
    } catch (e) {
        console.error("Contact Form Error", e);
        res.status(500).json({ error: "Failed to save inquiry" });
    }
});

export default router;
