
import express from 'express';
import { pool } from '../db';
import { getUserId } from './profile'; // Re-use auth
import { supabase } from '../db';
import { getIO } from '../socket'; // Import socket getter
import multer from 'multer';
import fs from 'fs';
import path from 'path';

const router = express.Router();

// 1. Storage Config (Same as profile.ts)
const upload = multer({
    storage: multer.diskStorage({
        destination: 'uploads/temp/',
        filename: (req, file, cb) => {
            cb(null, `${Date.now()}-${file.originalname}`);
        }
    }),
    limits: { fileSize: 100 * 1024 * 1024 }, // 100MB
});

// 2. GET /feed - Fetch all reels
router.get('/feed', async (req, res) => {
    try {
        const userId = getUserId(req); // Optional auth for "is_liked" check
        console.log("Fetching Feed for user:", userId);

        const client = await pool.connect();

        // 0. Get Current User Context (if logged in)
        let myLocation = "";
        let myGender = "";

        if (userId) {
            const userCtx = await client.query('SELECT location_name, gender FROM public.users WHERE id = $1', [userId]);
            if (userCtx.rows.length > 0) {
                myLocation = userCtx.rows[0].location_name || "";
                myGender = userCtx.rows[0].gender || "";
            }
        }

        // Complex Query with Relevance Scoring
        // Prioritize: 
        // 1. Same City (High relevance)
        // 2. Opposite Gender (Discovery)
        // 3. Recency (Freshness)
        const result = await client.query(`
            SELECT 
                r.id, r.url, r.caption, r.created_at,
                u.id as user_id, u.full_name, u.avatar_url, u.age, u.location_name,
                p.metadata->'career'->>'profession' as profession,
                
                (SELECT COUNT(*)::int FROM reel_likes rl WHERE rl.reel_id = r.id) as like_count,
                (SELECT COUNT(*)::int FROM reel_comments rc WHERE rc.reel_id = r.id) as comment_count,
                
                CASE WHEN $1::uuid IS NOT NULL THEN
                    EXISTS(SELECT 1 FROM reel_likes rl WHERE rl.reel_id = r.id AND rl.user_id = $1)
                ELSE false END as is_liked

            FROM public.reels r
            JOIN public.users u ON r.user_id = u.id
            LEFT JOIN public.profiles p ON u.id = p.user_id
            ORDER BY 
                (CASE WHEN u.location_name = $2 AND $2 != '' THEN 1 ELSE 0 END) DESC,
                (CASE WHEN u.gender != $3 AND $3 != '' THEN 1 ELSE 0 END) DESC,
                r.created_at DESC
            LIMIT 50
        `, [userId, myLocation, myGender]); // Pass context params

        client.release();

        // Transform for Frontend
        const reels = result.rows.map(row => ({
            id: row.id,
            url: row.url,
            caption: row.caption,
            likes: row.like_count,
            isLiked: row.is_liked,
            commentCount: row.comment_count,
            user: {
                id: row.user_id,
                name: row.full_name,
                photoUrl: row.avatar_url,
                age: row.age,
                location: { city: row.location_name || "India" }, // Minimal loc
                career: { profession: row.profession }
            },
            isMe: row.user_id === userId
        }));

        res.json(reels);

    } catch (e) {
        console.error("Feed Error", e);
        res.status(500).json({ error: "Failed to fetch feed" });
    }
});

// 3. POST /:id/like - Toggle Like
router.post('/:id/like', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const reelId = req.params.id;
        const client = await pool.connect();

        // Check if liked
        const check = await client.query(
            "SELECT 1 FROM reel_likes WHERE reel_id = $1 AND user_id = $2",
            [reelId, userId]
        );

        if ((check.rowCount || 0) > 0) {
            // Unlike
            await client.query(
                "DELETE FROM reel_likes WHERE reel_id = $1 AND user_id = $2",
                [reelId, userId]
            );
            res.json({ liked: false });
        } else {
            // Like
            await client.query(
                "INSERT INTO reel_likes (reel_id, user_id) VALUES ($1, $2)",
                [reelId, userId]
            );

            // Notify Owner
            const reelRes = await client.query("SELECT user_id FROM reels WHERE id = $1", [reelId]);
            if (reelRes.rows.length > 0) {
                const ownerId = reelRes.rows[0].user_id;
                if (ownerId !== userId) {
                    await client.query(`
                        INSERT INTO public.notifications (user_id, type, message, data)
                        VALUES ($1, 'like', $2, $3)
                    `, [ownerId, "Someone liked your reel! 🎥", JSON.stringify({ reelId, fromUserId: userId })]);

                    try {
                        getIO().to(ownerId).emit('notification:new', {
                            type: 'like',
                            message: "Someone liked your reel! 🎥",
                            timestamp: new Date()
                        });
                    } catch (err) { console.warn("Socket emit error", err); }
                }
            }
            res.json({ liked: true });
        }
        client.release();

    } catch (e) {
        console.error("Like Error", e);
        res.status(500).json({ error: "Action failed" });
    }
});

import { sanitizeContent } from '../utils/contentFilter';

// ... (existing imports)

// ...

// 4. POST /:id/comment - Add Comment
router.post('/:id/comment', async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });

        const { text } = req.body;
        if (!text) return res.status(400).json({ error: "Text required" });

        // REVENUE PROTECTION: Sanitize
        const cleanText = sanitizeContent(text);

        const reelId = req.params.id;
        const client = await pool.connect();

        const result = await client.query(`
            INSERT INTO reel_comments (reel_id, user_id, text)
            VALUES ($1, $2, $3)
            RETURNING id, text, created_at
        `, [reelId, userId, cleanText]);

        client.release();

        // Notify Owner
        const reelRes = await client.query("SELECT user_id FROM reels WHERE id = $1", [reelId]);
        if (reelRes.rows.length > 0) {
            const ownerId = reelRes.rows[0].user_id;
            if (ownerId !== userId) {
                await client.query(`
                    INSERT INTO public.notifications (user_id, type, message, data)
                    VALUES ($1, 'comment', $2, $3)
                `, [ownerId, "New comment on your reel! 💬", JSON.stringify({ reelId, fromUserId: userId, text: cleanText })]);

                try {
                    getIO().to(ownerId).emit('notification:new', {
                        type: 'comment',
                        message: "New comment on your reel! 💬",
                        timestamp: new Date()
                    });
                } catch (err) { console.warn("Socket emit error", err); }
            }
        }

        res.json(result.rows[0]);

    } catch (e) {
        console.error("Comment Error", e);
        res.status(500).json({ error: "Failed to post comment" });
    }
});

// 5. GET /:id/comments - Fetch Comments for a specific reel
router.get('/:id/comments', async (req, res) => {
    try {
        const reelId = req.params.id;
        const client = await pool.connect();

        const result = await client.query(`
            SELECT 
                rc.id, rc.text, rc.created_at,
                u.full_name as user_name, u.avatar_url
            FROM reel_comments rc
            JOIN public.users u ON rc.user_id = u.id
            WHERE rc.reel_id = $1
            ORDER BY rc.created_at DESC
        `, [reelId]);

        client.release();

        const comments = result.rows.map(r => ({
            id: r.id,
            text: r.text,
            user: r.user_name, // Match UI format
            userAvatar: r.avatar_url,
            created_at: r.created_at
        }));

        res.json(comments);

    } catch (e) {
        console.error("Get Comments Error", e);
        res.status(500).json({ error: "Failed to fetch comments" });
    }
});

// 6. POST /upload - New Upload Handler
router.post('/upload', upload.single('video'), async (req, res) => {
    try {
        const userId = getUserId(req);
        if (!userId) return res.status(401).json({ error: "Unauthorized" });
        if (!req.file) return res.status(400).json({ error: "No file" });

        const filePath = req.file.path;
        const filename = `${userId}/${Date.now()}_${path.basename(filePath)}`;

        // Stream to Supabase
        const fileStream = fs.createReadStream(filePath);
        const { data, error } = await supabase.storage.from('reels').upload(filename, fileStream, {
            contentType: req.file.mimetype,
            upsert: true,
            duplex: 'half'
        });

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(filename);

        console.log("Uploaded Reel:", publicUrl);

        // REVENUE PROTECTION: Sanitize Caption
        // Multer puts body fields in req.body. Note: client must send caption.
        const rawCaption = req.body.caption || "";
        const cleanCaption = sanitizeContent(rawCaption);

        // 4. Save to DB (reels table)
        const client = await pool.connect();
        await client.query(`
            INSERT INTO public.reels (user_id, url, caption) VALUES ($1, $2, $3)
        `, [userId, publicUrl, cleanCaption]);
        client.release();

        res.json({ success: true, url: publicUrl, caption: cleanCaption });

    } catch (e: any) {
        console.error("Upload Error", e);
        if (req.file) fs.unlink(req.file.path, () => { });
        res.status(500).json({ error: e.message });
    }
});

export default router;
