import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';
import { upload } from '../middleware/upload';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { sanitizeContent } from '../utils/contentFilter';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
const router = express.Router();

// Helper to get User ID from Request (assuming auth middleware populates it)
// But interactions.ts had a helper, here we use middleware.
// We'll trust req.user.id from authenticateToken

// 1. Get Reels Feed (Viral Algorithm)
router.get('/feed', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.userId;

        // Algorithm:
        // 1. Recency (Newer is better)
        // 2. Engagement (Likes * 2 + Views * 0.1)
        // 3. Exclude own reels? Maybe show them occasionally or in profile. For feed, let's keep them mixed or exclude.
        // Let's exclude own reels for the main discovery feed to encourage matching.

        const query = `
            SELECT 
                r.*,
                u.full_name as author_name,
                u.avatar_url as author_photo,
                u.location_name as author_city,
                u.age as author_age,
                (
                    (EXTRACT(EPOCH FROM r.created_at) * 0.0001) + 
                    (r.likes * 2) + 
                    (r.views * 0.1)
                ) as score,
                EXISTS(SELECT 1 FROM interactions i WHERE i.from_user_id = $1 AND i.to_user_id = r.user_id AND i.type = 'LIKE') as is_liked_author,
                EXISTS(SELECT 1 FROM reel_likes rl WHERE rl.user_id = $1 AND rl.reel_id = r.id) as is_liked
            FROM reels r
            JOIN users u ON r.user_id = u.id
            WHERE r.user_id != $1
            ORDER BY score DESC
            LIMIT 20;
        `;

        const result = await pool.query(query, [userId]);

        // Map to Frontend Format
        const reels = result.rows.map(row => ({
            id: row.id,
            url: row.url, // Supabase URL
            caption: row.caption || "",
            user: {
                id: row.user_id,
                name: row.author_name || "User",
                photoUrl: row.author_photo || "",
                location: { city: row.author_city || "India" },
                age: row.author_age
            },
            isMe: false, // Filtered out above
            likes: row.likes || 0,
            isLiked: row.is_liked || false,
            commentCount: row.comments_count || 0
        }));

        res.json(reels);
    } catch (e) {
        console.error("Fetch Reels Error", e);
        res.status(500).json({ error: "Failed to fetch reels" });
    }
});

// 2. Upload Reel (Protected)
router.post('/upload', authenticateToken, upload.single('video'), async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        if (!req.file) return res.status(400).json({ error: "No video file" });

        const filePath = req.file.path;
        const filename = `reels/${userId}/${Date.now()}-${path.basename(filePath)}`;
        const caption = req.body.caption || "";

        console.log(`Starting Reel upload: ${filename}`);

        // REVENUE PROTECTION: Caption
        const cleanCaption = sanitizeContent(caption);

        // 0. AI Vibe Analysis (Phase 2) - Real Video Analysis
        let vibeSummary = "";
        try {
            console.log("Analyzing Reel Vibe...");
            const { analyzeVibe } = await import('../services/vibeAnalysis');
            // We pass the local path before upload logic deletes it?
            // Actually upload logic deletes it at line 102.
            // We can run analysis parallel or before.
            // Let's run it here.

            const vibeResult = await analyzeVibe(filePath, 'VIDEO');
            if (vibeResult && vibeResult.summary) {
                vibeSummary = `\n\n✨ AI Vibe: ${vibeResult.vibe} (${vibeResult.tags.slice(0, 3).join(', ')})`;
            }
        } catch (aiErr) {
            console.error("Reel AI Analysis Failed", aiErr);
        }

        // 1. Upload to Supabase
        const fileStream = fs.createReadStream(filePath);
        const { error } = await supabase.storage
            .from('reels')
            .upload(filename, fileStream, {
                contentType: req.file.mimetype,
                upsert: true,
                duplex: 'half'
            });

        // Cleanup
        fs.unlink(filePath, () => { });

        if (error) {
            console.error("Supabase Upload Error:", error);
            return res.status(500).json({ error: "Upload failed" });
        }

        // 2. Get Public URL
        const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(filename);

        // 3. Save to DB
        // Append vibe to caption for now to show it in UI without schema change
        const finalCaption = cleanCaption + vibeSummary;

        const result = await pool.query(`
            INSERT INTO reels (user_id, url, caption)
            VALUES ($1, $2, $3)
            RETURNING id
        `, [userId, publicUrl, finalCaption]);

        res.json({
            success: true,
            reelId: result.rows[0].id,
            vibe: vibeSummary // Return to UI for immediate feedback
        });

    } catch (e) {
        console.error("Reel Upload Error", e);
        if (req.file?.path) fs.unlink(req.file.path, () => { });
        res.status(500).json({ error: "Server Error" });
    }
});

// 3. Like Reel
router.post('/:id/like', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;

        // Toggle Like
        const check = await pool.query('SELECT 1 FROM reel_likes WHERE user_id = $1 AND reel_id = $2', [userId, id]);

        if (check.rows.length > 0) {
            // Unlike
            await pool.query('DELETE FROM reel_likes WHERE user_id = $1 AND reel_id = $2', [userId, id]);
            await pool.query('UPDATE reels SET likes = GREATEST(likes - 1, 0) WHERE id = $1', [id]);
        } else {
            // Like
            await pool.query('INSERT INTO reel_likes (user_id, reel_id) VALUES ($1, $2)', [userId, id]);
            await pool.query('UPDATE reels SET likes = likes + 1 WHERE id = $1', [id]);
        }

        res.sendStatus(200);
    } catch (e) {
        console.error("Like Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// 4. Comment on Reel (Protected)
router.post('/:id/comment', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user?.userId;
        const { id } = req.params;
        const { text } = req.body;

        if (!text) return res.status(400).json({ error: "Missing text" });

        // REVENUE PROTECTION: Comment
        const cleanText = sanitizeContent(text);

        // Insert
        const r = await pool.query(`
            INSERT INTO reel_comments (user_id, reel_id, text)
            VALUES ($1, $2, $3)
            RETURNING id, created_at
        `, [userId, id, cleanText]);

        // Update Count
        await pool.query('UPDATE reels SET comments_count = comments_count + 1 WHERE id = $1', [id]);

        res.json({
            id: r.rows[0].id,
            text: cleanText,
            user: "You" // Frontend handles lazy loading of name if needed, or we fetch it.
        });

    } catch (e) {
        console.error("Comment Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// 5. Get Comments
router.get('/:id/comments', authenticateToken, async (req: any, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(`
            SELECT c.id, c.text, u.full_name as user_name
            FROM reel_comments c
            JOIN users u ON c.user_id = u.id
            WHERE c.reel_id = $1
            ORDER BY c.created_at DESC
            LIMIT 50
        `, [id]);

        const comments = result.rows.map(r => ({
            id: r.id,
            text: r.text,
            user: r.user_name
        }));

        res.json(comments);

    } catch (e) {
        console.error("Get Comments Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// 6. Track View
router.post('/:id/view', async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query('UPDATE reels SET views = views + 1 WHERE id = $1', [id]);
        res.sendStatus(200);
    } catch (e) {
        console.error("Track View Error", e);
        res.sendStatus(500);
    }
});

export default router;
