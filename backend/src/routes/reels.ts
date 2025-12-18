import express from 'express';
import { authenticateToken } from '../middleware/auth';
import { pool } from '../db';

const router = express.Router();

// Get Reels
router.get('/', authenticateToken, async (req: any, res) => {
    try {
        const result = await pool.query('SELECT * FROM reels ORDER BY created_at DESC LIMIT 20');

        const feed = result.rows;

        // INJECT MOCK AD (Sponsored Content) - Revenue Engine 
        // Insert an Ad after the 3rd reel
        if (feed.length >= 3) {
            feed.splice(3, 0, {
                id: 'ad_1',
                url: 'https://assets.mixkit.co/videos/preview/mixkit-digital-animation-of-a-scifi-city-11679-large.mp4', // Safe/Generic Ad Video
                caption: "Try LifePartner Premium to boost your visibility! 🚀 #ad #sponsored",
                user_id: 'sponsor_brand',
                likes: 0,
                comments: 0,
                is_ad: true, // Flag for Frontend
                metadata: {
                    ctaText: "Upgrade Now",
                    ctaLink: "/premium"
                }
            });
        }

        res.json(feed);
    } catch (e) {
        console.error("Fetch Reels Error", e);
        res.status(500).json({ error: "Failed to fetch reels" });
    }
});

export default router;
