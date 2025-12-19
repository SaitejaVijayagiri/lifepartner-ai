
import express from 'express';
import { pool } from '../db';
import { authenticateToken } from '../middleware/auth';
import { AstrologyService } from '../services/astrology';

const router = express.Router();
const astrologyService = new AstrologyService();

// Middleware duplications because I'm lazy to make a shared middleware file right now
// FIXED: Using imported getUserId
router.get('/recommendations', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const client = await pool.connect();
        // ... (rest of code)

        // 1. Get Me
        const meRes = await client.query("SELECT * FROM public.users u LEFT JOIN public.profiles p ON u.id = p.user_id WHERE u.id = $1", [userId]);
        if (meRes.rows.length === 0) return res.json({ matches: [] });
        const me = meRes.rows[0];
        const meMeta = me.metadata || {};

        // 2. Get Candidates (Limit 50)
        // Gender Filtering Logic
        let genderFilter = "";
        const myGender = (me.gender || "").toLowerCase();
        console.log(`DEBUG: myId=${userId}, myGender=${myGender}`);

        if (myGender === 'male') genderFilter = "AND LOWER(u.gender) = 'female'";
        else if (myGender === 'female') genderFilter = "AND LOWER(u.gender) = 'male'";

        console.log(`DEBUG: Gender Filter SQL: ${genderFilter}`);

        const candRes = await client.query(`
            SELECT u.*, p.*,
            (SELECT COUNT(*) FROM matches m WHERE m.user_b_id = u.id AND m.is_liked = TRUE)::int as total_likes,
            (SELECT m.status FROM matches m WHERE m.user_a_id = $1 AND m.user_b_id = u.id) as match_status,
            (SELECT m.is_liked FROM matches m WHERE m.user_a_id = $1 AND m.user_b_id = u.id) as is_liked
            FROM public.users u 
            LEFT JOIN public.profiles p ON u.id = p.user_id 
            WHERE u.id != $1 ${genderFilter}
            LIMIT 50
        `, [userId]);
        const candidates = candRes.rows;

        client.release();

        const userPrompt = (me.raw_prompt || "").toLowerCase();

        // 3. Score
        const matches = candidates.map(c => {
            const meta = c.metadata || {};
            let score = 50;
            let reasons: string[] = [];

            // Simple Logic mirroring old one
            if (meMeta.religion?.religion && meta.religion?.religion && meMeta.religion.religion === meta.religion.religion) {
                score += 10;
                if (meMeta.religion.caste && meta.religion.caste && meMeta.religion.caste === meta.religion.caste) {
                    score += 10;
                    reasons.push("Same Caste");
                }
            }

            if (meMeta.lifestyle?.diet && meta.lifestyle?.diet && meMeta.lifestyle.diet === meta.lifestyle.diet) {
                score += 10;
                reasons.push("Same diet");
            }

            // Keyword matching
            const otherPrompt = (c.raw_prompt || "").toLowerCase();
            if (userPrompt.includes('doctor') && otherPrompt.includes('doctor')) {
                score += 20;
                reasons.push("Career Match");
            }

            // Cap
            if (score > 99) score = 99;

            // Safe Location Access
            let locString = "India";
            if (meta.location && typeof meta.location === 'object') {
                locString = meta.location.city || locString;
            } else if (c.location_name) {
                locString = c.location_name;
            }

            return {
                id: c.user_id || c.id,
                name: c.full_name,
                age: c.age,
                height: meta.height || "Not Specified", // Real Height
                location: locString,
                role: meta.career?.profession || "Member",
                photoUrl: c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`,
                score: (c.avatar_url && !c.avatar_url.includes('dicebear')) ? score + 40 : score, // Boost real photos
                match_reasons: reasons,
                analysis: {
                    emotional: 75 + (c.id % 20), // Deterministic pseudo-random based on ID
                    vision: 80 + (c.id % 15)
                },
                summary: (c.raw_prompt || meta.aboutMe || "No bio yet.").substring(0, 150),
                reels: meta.reels || c.reels || [],
                photos: meta.photos || [],

                // Pass Full Details for Modal
                career: meta.career || {},
                family: meta.family || {},
                religion: meta.religion || {},
                horoscope: meta.horoscope || {},
                lifestyle: meta.lifestyle || {},

                stories: c.stories || [], // Stories
                total_likes: c.total_likes || 0,
                is_liked: c.is_liked || false,
                // Premium Data
                phone: me.is_premium ? (c.phone || meta.phone) : null,
                email: me.is_premium ? (c.email || meta.email) : null,
                voiceBioUrl: c.voice_bio_url || null,

                // Astrology
                kundli: astrologyService.calculateCompatibility(meMeta.horoscope?.nakshatra, meta.horoscope?.nakshatra)
            };
        })
            .sort((a, b) => b.score - a.score)
            .slice(0, 10);

        res.json({ matches });

    } catch (e) {
        console.error("Matches Error", e);
        res.status(500).json({ error: "Failed" });
    }
});

// 3. AI Search Route
router.post('/search', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const { query } = req.body;
        if (!query) return res.json({ matches: [] });

        // 1. Parse Query with AI
        const aiService = new (require('../services/ai').AIService)();
        const filters = await aiService.parseSearchQuery(query);
        console.log("AI Search Filters:", filters);

        const client = await pool.connect();

        // 2. Get Me (for gender filtering & premium status)
        // Need is_premium to decide whether to show contacts
        const meRes = await client.query("SELECT gender, is_premium FROM public.users WHERE id = $1", [userId]);
        const me = meRes.rows[0];
        const myGender = (me?.gender || "").toLowerCase();
        const isPremium = me?.is_premium;
        // Ensure me metadata is available for astrology
        if (!me.metadata) me.metadata = {};

        // 3. Build Dynamic Query
        let sql = `
            SELECT 
                u.id, u.email, u.phone, u.full_name, u.gender, u.age, u.location_name, u.avatar_url, u.voice_bio_url, u.is_premium,
                p.metadata, p.raw_prompt
            FROM public.users u 
            LEFT JOIN public.profiles p ON u.id = p.user_id 
            WHERE u.id != $1 
        `;
        const params: any[] = [userId];
        let pIdx = 2;

        // Gender Filter (Strict)
        if (myGender === 'male') {
            sql += ` AND LOWER(u.gender) = 'female' `;
        } else if (myGender === 'female') {
            sql += ` AND LOWER(u.gender) = 'male' `;
        }

        // Apply AI Filters
        if (filters.profession) {
            sql += ` AND p.metadata->'career'->>'profession' ILIKE $${pIdx} `;
            params.push(`%${filters.profession}%`);
            pIdx++;
        }

        if (filters.religion) {
            sql += ` AND p.metadata->'religion'->>'faith' ILIKE $${pIdx} `; // 'faith' matches editor field
            params.push(`%${filters.religion}%`);
            pIdx++;
        }

        if (filters.diet) {
            sql += ` AND p.metadata->'lifestyle'->>'diet' = $${pIdx} `;
            params.push(filters.diet);
            pIdx++;
        }

        // Habits (if present in metadata)
        if (filters.smoking === 'No') {
            // Check if smoking is explicitly 'No' or null (assuming default good)
            sql += ` AND (p.metadata->'lifestyle'->>'smoking' = 'No' OR p.metadata->'lifestyle'->>'smoking' IS NULL) `;
        }
        if (filters.drinking === 'No') {
            sql += ` AND (p.metadata->'lifestyle'->>'drinking' = 'No' OR p.metadata->'lifestyle'->>'drinking' IS NULL) `;
        }

        sql += ` LIMIT 50`;

        // DEBUG: Write to file
        const fs = require('fs');
        const debugLog = `
Timestamp: ${new Date().toISOString()}
My Gender: ${myGender}
Query: ${query}
Filters: ${JSON.stringify(filters)}
SQL: ${sql}
Params: ${params}
--------------------------------`;
        fs.appendFileSync('debug_search.log', debugLog);

        console.log("DEBUG WRITTEN TO debug_search.log");

        const result = await client.query(sql, params);
        client.release();

        // Helper: Height Parser
        const parseHeightToInches = (hStr: string): number => {
            if (!hStr) return 0;
            const str = hStr.toLowerCase().replace(/[^0-9.]/g, ' ');
            const parts = str.trim().split(/\s+/).map(Number);

            // Format: 5'9 or 5 9
            if (hStr.includes("'") || parts.length >= 2) {
                return (parts[0] * 12) + (parts[1] || 0);
            }
            // Format: 175 cm
            if (hStr.toLowerCase().includes('cm')) {
                return Math.round(parts[0] / 2.54);
            }
            // Fallback: Just feet?
            if (parts.length === 1 && parts[0] < 8) return parts[0] * 12;

            return 0;
        };

        // Post-Filter: Advanced Weighted Matching
        let scoredMatches = result.rows.map(c => {
            const meta = c.metadata || {};
            // Safe Location Access
            let locString = "India";
            if (meta.location && typeof meta.location === 'object') {
                locString = meta.location.city || locString;
            } else if (c.location_name) {
                locString = c.location_name;
            }

            const profileHeight = meta.height || "";
            const heightInches = parseHeightToInches(profileHeight);

            // Base AI Score
            let score = 70;
            const reasons: string[] = [];

            // 1. Height Analysis
            if (filters.minHeightInches && filters.maxHeightInches) {
                if (heightInches >= filters.minHeightInches && heightInches <= filters.maxHeightInches) {
                    score += 20;
                    reasons.push(`Perfect Height (${profileHeight})`);
                } else if (heightInches > 0) {
                    // Decay score based on distance
                    const diff = Math.min(Math.abs(heightInches - filters.minHeightInches), Math.abs(heightInches - filters.maxHeightInches));
                    score -= (diff * 2);
                    if (score < 40) reasons.push(`Height Mismatch (${profileHeight})`);
                }
            }

            // 2. Appearance & Keyword Analysis (Semantic Proxy)
            if (filters.appearance && filters.appearance.length > 0) {
                const combinedBio = ((c.raw_prompt || "") + " " + (meta.aboutMe || "")).toLowerCase();
                // Count matches
                const matchCount = filters.appearance.filter((trait: string) => combinedBio.includes(trait.toLowerCase())).length;

                if (matchCount > 0) {
                    score += (matchCount * 10);
                    reasons.push(`${matchCount} Appearance traits matched`);
                }
            }

            // 3. Habits & Lifestyle
            if (filters.smoking === 'No' && meta.lifestyle?.smoking === 'Yes') {
                score -= 30; // Strong penalty
                reasons.push("Smoker (Mismatch)");
            }
            if (filters.drinking === 'No' && meta.lifestyle?.drinking === 'Yes') {
                score -= 20;
                reasons.push("Drinker (Mismatch)");
            }

            return {
                id: c.user_id || c.id,
                name: c.full_name,
                age: c.age,
                height: meta.height || "Not Specified",
                location: locString,
                role: meta.career?.profession || "Member",
                photoUrl: c.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${c.id}`,
                score: Math.max(0, Math.min(score, 99)),
                match_reasons: reasons.length > 0 ? reasons : ["AI Suggestion"],
                analysis: {
                    emotional: 80 + (c.id % 15),
                    vision: 85 + (c.id % 10)
                },
                isOnline: Math.random() > 0.3,
                summary: (c.raw_prompt || meta.aboutMe || "No bio yet.").substring(0, 150),
                reels: meta.reels || c.reels || [],
                photos: meta.photos || [],

                // Pass Full Details for Modal
                career: meta.career || {},
                family: meta.family || {},
                religion: meta.religion || {},
                horoscope: meta.horoscope || {},
                lifestyle: meta.lifestyle || {},

                stories: c.stories || [],
                phone: isPremium ? (c.phone || meta.phone) : null,
                email: isPremium ? (c.email || meta.email) : null,
                voiceBioUrl: c.voice_bio_url || null,
                kundli: astrologyService.calculateCompatibility(me.metadata?.horoscope?.nakshatra, meta.horoscope?.nakshatra)
            };
        });

        // Sort by Score DESC and Return Top 10
        scoredMatches.sort((a, b) => b.score - a.score);

        // 4. Optimization: Skip Real-Time AI Analysis for List View
        // Just return the scored matches directly. Real AI analysis should be on-demand (Profile View).
        const finalMatches = scoredMatches.slice(0, 20).map(m => ({
            ...m,
            // Ensure analysis structure exists even if fake
            analysis: {
                emotional: m.score,
                vision: m.score
            }
        }));

        // DEBUG: 
        if (finalMatches.length > 0) {
            console.log(`[DEBUG] Returning ${finalMatches.length} matches. User Premium: ${isPremium}`);
        }

        res.json({ matches: finalMatches });

    } catch (e) {
        console.error("Search Error", e);
        res.status(500).json({ error: "Search failed" });
    }
});

// 4. GET PDF Report (Premium / Free)
router.get('/:id/report', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;
        const { id } = req.params; // Partner ID

        const client = await pool.connect();

        // 1. Fetch Both Profiles
        const p1 = await client.query('SELECT u.full_name, u.age, p.metadata FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1', [userId]);
        const p2 = await client.query('SELECT u.full_name, u.age, p.metadata FROM users u LEFT JOIN profiles p ON u.id = p.user_id WHERE u.id = $1', [id]);

        client.release();

        if (p1.rows.length === 0 || p2.rows.length === 0) {
            return res.status(404).json({ error: "Profiles not found" });
        }

        const profileA = { ...p1.rows[0].metadata, full_name: p1.rows[0].full_name, age: p1.rows[0].age };
        const profileB = { ...p2.rows[0].metadata, full_name: p2.rows[0].full_name, age: p2.rows[0].age };

        // 2. Set Headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=compatibility_report_${id}.pdf`);

        // 3. Generate PDF
        const { generatePDFReport } = await import('../services/reportGenerator');
        await generatePDFReport(profileA, profileB, res);

    } catch (e: any) {
        console.error("Report Gen Error", e);
        res.status(500).json({ error: "Failed to generate report" });
    }
});

export default router;
