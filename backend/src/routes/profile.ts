import express from 'express';

import { pool } from '../db'; // Centralized DB & Storage
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
import { AIService } from '../services/ai';
import { sanitizeContent } from '../utils/contentFilter';
import fs from 'fs';
import path from 'path';

const router = express.Router();
const aiService = new AIService();

import { upload } from '../middleware/upload';
import { authenticateToken } from '../middleware/auth';

// Debug Logger
const logDebug = (msg: string, data?: any) => {
    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${msg} ${data ? JSON.stringify(data) : ''}\n`;
    console.log(msg, data || '');
    try {
        fs.appendFileSync(path.join(__dirname, '../backend_debug.log'), logLine);
    } catch (e) {
        // Ignore logging errors
    }
};

// 2. GET /me (Fetch from DB)
router.get('/me', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const client = await pool.connect();
        const result = await client.query(`
            SELECT u.id as uid, u.*, p.* 
            FROM public.users u
            LEFT JOIN public.profiles p ON u.id = p.user_id
            WHERE u.id = $1
        `, [userId]);

        client.release();

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

        const user = result.rows[0];
        const meta = user.metadata || {};

        // Transform User + Profile into the specific Frontend Shape
        const profile = {
            userId: user.uid || user.id || user.user_id,
            name: user.full_name,
            email: user.email,
            age: user.age, // Added Age
            gender: user.gender,
            // Prefer metadata location (full object) over user.location_name (string)
            location: meta.location || { city: user.location_name, country: "India" },

            // Read from Metadata with fallbacks
            career: meta.career || { profession: "", education: "" },
            family: meta.family || { type: "Nuclear" },
            lifestyle: meta.lifestyle || { diet: "Veg" },
            religion: meta.religion || { religion: "Hindu" },
            horoscope: meta.horoscope || {},
            partnerPreferences: meta.partnerPreferences || {},
            motherTongue: meta.motherTongue || user.mother_tongue || "", // Fallback
            dob: meta.dob, // Added DOB

            reels: user.reels || [],
            prompt: user.raw_prompt,
            aboutMe: user.raw_prompt, // Map raw_prompt to aboutMe for frontend
            photos: meta.photos || [],
            photoUrl: user.avatar_url,
            joinedAt: user.created_at,
            is_premium: user.is_premium || false, // Exposed to Frontend
            coins: user.coins || 0, // Added Coin Balance
            phone: meta.phone || "", // Added Phone
            referral_code: user.referral_code || "", // Added Referral Code
            stories: (user.stories || []).filter((s: any) => new Date(s.expiresAt) > new Date()) // Only return active stories
        };

        res.json(profile);
    } catch (e) {
        console.error("Get Profile Error", e);
        res.status(500).json({ error: "Failed to fetch profile" });
    }
});

// 2.5 PUT /me (Update Profile)
router.put('/me', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        // ...

        const {
            name, age, gender, location,
            religion, horoscope, career, family, lifestyle,
            prompt, aboutMe, // Accept aboutMe as alias for prompt
            partnerPreferences,
            motherTongue, dob, height, // Accept DOB & Height
            photos, photoUrl,
            email, phone // Added email and phone
        } = req.body;

        // REVENUE PROTECTION: Sanitize Inputs
        const cleanPrompt = sanitizeContent(prompt || aboutMe || '');
        if (career) career.profession = sanitizeContent(career.profession || '');
        if (location) location.city = sanitizeContent(location.city || '');

        const client = await pool.connect();

        try {
            await client.query('BEGIN');

            // 1. Update Core User Info
            await client.query(`
                UPDATE public.users
                SET full_name = COALESCE($1, full_name),
                    age = COALESCE($2, age),
                    gender = COALESCE($3, gender),
                    location_name = COALESCE($4, location_name),
                    avatar_url = COALESCE($5, avatar_url),
                    email = COALESCE($6, email)
                WHERE id = $7
            `, [name, age, gender, location?.city, photoUrl, email, userId]);

            // 2. Update Profile Metadata
            // We store extended fields (dob, full location) in metadata
            const metadata = {
                religion,
                horoscope,
                career, // already sanitized
                family,
                lifestyle,
                partnerPreferences,
                motherTongue,
                photos,
                dob,
                location, // already sanitized
                height, // Added Height
                phone // Added Phone
            };

            // Upsert Profile
            await client.query(`
                INSERT INTO public.profiles (user_id, raw_prompt, metadata, updated_at)
                VALUES ($1, $2, $3, NOW())
                ON CONFLICT (user_id)
                DO UPDATE SET
                    raw_prompt = COALESCE(EXCLUDED.raw_prompt, public.profiles.raw_prompt),
                    metadata = COALESCE(public.profiles.metadata, '{}'::jsonb) || EXCLUDED.metadata,
                    updated_at = NOW()
            `, [userId, cleanPrompt, JSON.stringify(metadata)]);

            await client.query('COMMIT');
            res.json({ success: true, message: "Profile saved" });

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (e) {
        console.error("Save Profile Error", e);
        res.status(500).json({ error: "Failed to save profile" });
    }
});

// 3. POST /prompt (Update Profile with AI)
router.post('/prompt', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const { prompt } = req.body;

        // 1. AI Analysis
        const analysis = await aiService.parseUserPrompt(prompt);

        // 2. Save to DB
        // We update the 'profiles' table
        const client = await pool.connect();

        // Upsert logic (unlikely to fail since we create profile on register)
        await client.query(`
            UPDATE public.profiles 
            SET raw_prompt = $1, traits = $2, values = $3, updated_at = NOW()
            WHERE user_id = $4
        `, [prompt, analysis.traits || {}, analysis.values || [], userId]);

        client.release();

        res.json({ success: true, message: "Profile updated via AI" });
    } catch (e) {
        console.error("Prompt Error", e);
        res.status(500).json({ error: "AI Processing Failed" });
    }
});

// 4. POST /reel (Stream from Disk to Supabase)
router.post('/reel', authenticateToken, upload.single('video'), async (req: any, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) return res.status(400).json({ error: "No video file" });

        const filePath = req.file.path;
        const filename = `${userId}/${path.basename(filePath)}`;

        console.log(`Starting stream upload: ${filename} (${req.file.size} bytes)`);

        // 1. Stream to Supabase Storage
        const fileStream = fs.createReadStream(filePath);

        const { data, error } = await supabase
            .storage
            .from('reels')
            .upload(filename, fileStream, {
                contentType: req.file.mimetype,
                upsert: true,
                duplex: 'half' // Important for node streams
            });

        // 2. Cleanup Temp File
        fs.unlink(filePath, (err) => {
            if (err) console.error("Failed to delete temp file:", err);
            else console.log("Temp file cleaned up");
        });

        if (error) {
            console.error("Supabase Upload Error:", error);
            throw error;
        }

        // 3. Get Public URL
        const { data: { publicUrl } } = supabase
            .storage
            .from('reels')
            .getPublicUrl(filename);

        console.log("Uploaded Reel:", publicUrl);

        // 4. Save URL to DB
        await pool.query(`
            UPDATE public.profiles 
            SET reels = COALESCE(reels, '[]'::jsonb) || $1::jsonb 
            WHERE user_id = $2
        `, [JSON.stringify([publicUrl]), userId]);

        res.json({ success: true, videoUrl: publicUrl });

    } catch (e: any) {
        console.error("Upload Error", e);
        // Try to cleanup if error occurred before cleanup
        if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => { });
        }
        res.status(500).json({ error: "Upload failed", details: e.message || JSON.stringify(e) });
    }
});

// 4.5 POST /voice-bio (Upload Voice Bio)
router.post('/voice-bio', authenticateToken, upload.single('audio'), async (req: any, res) => {
    try {
        const userId = req.user.userId;

        if (!req.file) return res.status(400).json({ error: "No audio file" });


        const filePath = req.file.path;
        // Use a consistent filename so user can overwrite their bio
        const filename = `voice-bios/${userId}/bio-${Date.now()}.webm`;

        console.log(`Starting Voice Bio upload: ${filename}`);

        // 2. Transcription & Safety Check (FREE AI)
        console.log("🛡️ Running Voice Safety Analysis...");
        const transcript = await aiService.transcribeAudio(filePath);
        const cleanTranscript = sanitizeContent(transcript);

        // If 'Clean' differs from 'Original' (meaning it had phones/emails), REJECT.
        // OR search for specific trigger words if needed. 
        // Note: sanitizeContent replaces with [Hidden...], so if the string contains that, we know it was bad.
        if (cleanTranscript.includes("[Hidden Contact")) {
            console.warn(`🚨 BLOCKED Voice Bio: User tried to share contact info. Transcript: "${transcript}"`);

            // Cleanup
            fs.unlink(filePath, () => { });

            return res.status(400).json({
                error: "Safety Alert: Personal contact information detected in audio. Please record again without phone numbers or emails."
            });
        }

        // 3. Stream to Supabase (if safe)
        const fileStream = fs.createReadStream(filePath);
        const { data, error } = await supabase
            .storage
            .from('uploads')
            .upload(filename, fileStream, {
                contentType: req.file.mimetype,
                upsert: true
            });

        // Cleanup local temp file
        // Don't clean up yet if we want to run vibe analysis on local file?
        // Actually vibe analysis runs on file path.
        // We can run it in parallel or after.
        // Let's run it BEFORE cleanup.

        let vibeResult = null;
        try {
            // 4. AI Vibe Analysis (Phase 2 Feature)
            console.log("🧠 Analyzing Voice Vibe...");
            const { analyzeVibe } = await import('../services/vibeAnalysis');
            vibeResult = await analyzeVibe(filePath, 'AUDIO');
            console.log("✨ Vibe Analysis Result:", vibeResult);
        } catch (vibeErr) {
            console.error("Vibe Analysis Failed (Non-blocking):", vibeErr);
        }

        fs.unlink(filePath, () => { });

        if (error) {
            console.error("Supabase Upload Error", error);
            throw error;
        }

        const { data: { publicUrl } } = supabase.storage.from('uploads').getPublicUrl(filename);

        // 5. Update Profile & Store Vibe Metadata
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Update URL
            await client.query(`UPDATE public.users SET voice_bio_url = $1 WHERE id = $2`, [publicUrl, userId]);

            // Update Metadata if vibe exists
            if (vibeResult) {
                // Merge into metadata JSON
                await client.query(`
                    UPDATE public.profiles 
                    SET metadata = jsonb_set(
                        COALESCE(metadata, '{}'::jsonb), 
                        '{voice_vibe}', 
                        $1::jsonb
                    )
                    WHERE user_id = $2
                `, [JSON.stringify(vibeResult), userId]);
            }

            await client.query('COMMIT');
        } catch (dbErr) {
            await client.query('ROLLBACK');
            throw dbErr;
        } finally {
            client.release();
        }

        res.json({
            success: true,
            audioUrl: publicUrl,
            vibe: vibeResult, // Return to frontend!
            transcript
        }); // Return transcript for UI if we want to show it later

    } catch (e: any) {
        console.error("Voice Upload Error", e);
        if (req.file && req.file.path) fs.unlink(req.file.path, () => { });
        res.status(500).json({ error: "Upload failed" });
    }
});

// 5. POST /stories (Upload Story)
router.post('/stories', authenticateToken, (req, res, next) => {
    // Custom Error Handling for Multer (File Limit, etc.)
    upload.single('media')(req, res, (err) => {
        if (err) {
            // logDebug("Multer Error:", err);
            return res.status(400).json({ error: err.message });
        }
        next();
    });
}, async (req: any, res) => {
    let filePath = '';
    try {
        const userId = req.user.userId;

        logDebug(`[POST /stories] User: ${userId} Requesting Upload`);

        if (!req.file) {
            logDebug("No file received");
            return res.status(400).json({ error: "No media file" });
        }

        filePath = req.file.path;

        // Premium Restriction for Stories
        const authClient = await pool.connect();
        const userRes = await authClient.query('SELECT public.users.is_premium, public.profiles.stories FROM public.users LEFT JOIN public.profiles ON public.users.id = public.profiles.user_id WHERE public.users.id = $1', [userId]);
        const user = userRes.rows[0];

        const isPremium = user?.is_premium;
        let currentStories = (user?.stories || []) as any[];

        authClient.release();

        if (!isPremium) {
            return res.status(403).json({ error: "Stories are a Premium feature" });
        }

        // AUTO-CLEANUP: Filter out expired stories
        const now = new Date();
        const validStories = currentStories.filter((s: any) => new Date(s.expiresAt) > now);

        if (validStories.length >= 5) {
            // FIFO STRATEGY: Remove oldest
            const removed = validStories.shift();
            logDebug(`Limit reached. Auto-deleted story: ${removed?.id}`);
            if (removed?.url) {
                // Async cleanup, don't await
                const oldPath = removed.url.split('reels/')[1];
                if (oldPath) supabase.storage.from('reels').remove([oldPath]);
            }
        }

        const filename = `stories/${userId}/${Date.now()}-${path.basename(req.file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_'))}`;
        const type = req.file.mimetype.startsWith('video') ? 'video' : 'image';

        logDebug(`Starting upload to Supabase: ${filename}`);

        // 1. Upload to Supabase Storage
        const fileContent = fs.readFileSync(filePath);
        const { data, error } = await supabase.storage
            .from('reels')
            .upload(filename, fileContent, {
                contentType: req.file.mimetype,
                upsert: true
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage.from('reels').getPublicUrl(filename);
        logDebug(`Upload Success: ${publicUrl}`);

        // 2. Add to DB
        const newStory = {
            id: Date.now().toString(),
            url: publicUrl,
            type,
            createdAt: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        };

        const finalStories = [...validStories, newStory];

        const client = await pool.connect();
        const updateRes = await client.query(`
            UPDATE public.profiles
            SET stories = $1::jsonb
            WHERE user_id = $2
        `, [JSON.stringify(finalStories), userId]);

        if (updateRes.rowCount === 0) {
            await client.query(`
                INSERT INTO public.profiles (user_id, stories)
                VALUES ($1, $2::jsonb)
            `, [userId, JSON.stringify(finalStories)]);
        }

        client.release();

        res.json({ success: true, story: newStory });

    } catch (e: any) {
        logDebug("Story Upload Error", e);
        res.status(500).json({ error: "Upload failed", details: e.message });
    } finally {
        // ALWAYS clean up temp file
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (cleanupErr) {
                console.error("Cleanup error", cleanupErr);
            }
        }
    }
});

// 6. DELETE /stories/:storyId
router.delete('/stories/:storyId', authenticateToken, async (req: any, res) => {
    try {
        const userId = req.user.userId;

        const { storyId } = req.params;

        const client = await pool.connect();

        // Remove element from JSONB array where id matches
        // Using jsonb_path_query_array or just filtering in application code if DB support is limited
        // Simplest generic approach: Get, Filter, Update

        const { rows } = await client.query('SELECT stories FROM public.profiles WHERE user_id = $1', [userId]);
        const currentStories = rows[0]?.stories || [];
        const updatedStories = currentStories.filter((s: any) => s.id !== storyId);

        await client.query('UPDATE public.profiles SET stories = $1 WHERE user_id = $2', [JSON.stringify(updatedStories), userId]);

        client.release();

        res.json({ success: true, message: "Story deleted" });

    } catch (e) {
        console.error("Delete Story Error", e);
        res.status(500).json({ error: "Failed to delete story" });
    }
});

export default router;
