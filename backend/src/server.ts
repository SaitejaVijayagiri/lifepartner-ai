import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { pool, checkDbConnection } from './db';
import authRoutes from './routes/auth';
import profileRoutes from './routes/profile';
import matchRoutes from './routes/matches';
import interactionRoutes from './routes/interactions';
import chatRoutes from './routes/chat';
import gameRoutes from './routes/games';
import paymentRoutes from './routes/payments';
import walletRoutes from './routes/wallet';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notifications';
import path from 'path';
// import { seedDatabase } from './seed'; 

dotenv.config(); // Load ENV

import rateLimit from 'express-rate-limit';

const app = express();
const PORT = process.env.PORT || 4000;

// Rate Limiters
const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 500, // Limit each IP to 500 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many requests from this IP, please try again later."
});

const authLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 100, // Limit each IP to 100 requests per hour (Login/Register attempts)
    standardHeaders: true,
    legacyHeaders: false,
});

const contactLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Limit contact form submission
    message: "Too many contact requests, please try again later."
});

// Middleware
app.use(globalLimiter); // Apply global limiter to all routes
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'Accept-Ranges', 'Content-Length']
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Legacy uploads (keeping for backward compat if needed, but we use Supabase now)
app.use('/uploads', express.static('uploads'));

app.use('/api/ai', aiRoutes);

// Health Check
app.get('/', (req, res) => {
    res.send('Life Partner AI Backend is Running (Production Mode)');
});

// Routes
app.use('/auth', authLimiter, authRoutes); // Stricter limit for auth
app.use('/profile', profileRoutes);
app.use('/matches', matchRoutes);
app.use('/interactions', interactionRoutes);
app.use('/messages', chatRoutes);
app.use('/games', gameRoutes);
app.use('/payments', paymentRoutes);
app.use('/reels', require('./routes/reels').default);
app.use('/notifications', notificationRoutes);
app.use('/wallet', walletRoutes); // Mounted wallet routes
app.use('/calls', require('./routes/calls').default);

const initServer = async () => {
    // 1. Check DB
    const connected = await checkDbConnection();
    if (!connected) {
        console.error("❌ CRITICAL: Database connection failed. Server may not function correctly.");
    }

    // 2. Self-Healing Schema (Add missing columns if needed)
    try {
        const client = await pool.connect();
        await client.query(`
            DO $$ 
            BEGIN 
                ----------------------------------------------------------------
                -- 1. Core Tables (Users & Profiles)
                ----------------------------------------------------------------
                -- Users already exists ideally, but let's assume it does or is created by Supabase Auth usually. 
                -- We only add columns here.

                -- Profiles: reels, metadata
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND table_schema='public' AND column_name='reels') THEN 
                    ALTER TABLE public.profiles ADD COLUMN reels JSONB DEFAULT '[]'::jsonb; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND table_schema='public' AND column_name='metadata') THEN 
                    ALTER TABLE public.profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb; 
                END IF;
                
                -- Users: Extended Fields
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='phone') THEN 
                    ALTER TABLE public.users ADD COLUMN phone VARCHAR(20); 
                    -- ALTER TABLE public.users ADD CONSTRAINT users_phone_key UNIQUE (phone); -- Generic constraint might fail if data exists
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='is_premium') THEN 
                    ALTER TABLE public.users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='razorpay_customer_id') THEN 
                    ALTER TABLE public.users ADD COLUMN razorpay_customer_id VARCHAR(100);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='premium_expiry') THEN 
                    ALTER TABLE public.users ADD COLUMN premium_expiry TIMESTAMP;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='voice_bio_url') THEN 
                    ALTER TABLE public.users ADD COLUMN voice_bio_url VARCHAR(255);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='referral_code') THEN 
                    ALTER TABLE public.users ADD COLUMN referral_code VARCHAR(10) UNIQUE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='referred_by') THEN 
                    ALTER TABLE public.users ADD COLUMN referred_by UUID;
                END IF;

                ----------------------------------------------------------------
                -- 2. Core Feature Tables
                ----------------------------------------------------------------

                -- Transactions
                CREATE TABLE IF NOT EXISTS public.transactions (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID REFERENCES public.users(id),
                    amount DECIMAL(10, 2) NOT NULL,
                    currency VARCHAR(10) DEFAULT 'INR',
                    type VARCHAR(50) NOT NULL, 
                    status VARCHAR(50) DEFAULT 'SUCCESS',
                    description TEXT,
                    metadata JSONB DEFAULT '{}'::jsonb,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- Matches (For Compatibility & History)
                CREATE TABLE IF NOT EXISTS public.matches (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_a_id UUID REFERENCES public.users(id),
                    user_b_id UUID REFERENCES public.users(id),
                    score INTEGER,
                    is_liked BOOLEAN DEFAULT FALSE,
                    is_skipped BOOLEAN DEFAULT FALSE,
                    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, MATCHED, REJECTED
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_a_id, user_b_id)
                );

                -- Interactions (Requests, Likes, etc.)
                CREATE TABLE IF NOT EXISTS public.interactions (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    from_user_id UUID REFERENCES public.users(id),
                    to_user_id UUID REFERENCES public.users(id),
                    type VARCHAR(20) NOT NULL, -- LIKE, REQUEST, VIEW
                    status VARCHAR(20) DEFAULT 'PENDING',
                    created_at TIMESTAMP DEFAULT NOW()
                );

                -- Device Tokens
                CREATE TABLE IF NOT EXISTS public.device_tokens (
                    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                    token TEXT NOT NULL,
                    platform VARCHAR(20),
                    created_at TIMESTAMP DEFAULT NOW(),
                    PRIMARY KEY (user_id, token)
                );

                -- Messages (Chat Room Style)
                CREATE TABLE IF NOT EXISTS public.messages (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    match_id UUID REFERENCES public.matches(id),
                    sender_id UUID REFERENCES public.users(id), 
                    content TEXT,
                    is_read BOOLEAN DEFAULT FALSE,
                    created_at TIMESTAMP DEFAULT NOW()
                );
                
                -- Check columns for Messages (Migrations)
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='match_id') THEN 
                    ALTER TABLE public.messages ADD COLUMN match_id UUID REFERENCES public.matches(id);
                END IF;

                -- Reports
                CREATE TABLE IF NOT EXISTS public.reports (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    reporter_id UUID REFERENCES public.users(id),
                    target_id UUID REFERENCES public.users(id),
                    reason TEXT,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                ----------------------------------------------------------------
                -- 3. Viral Feature Tables (Reels)
                ----------------------------------------------------------------

                -- Reels
                CREATE TABLE IF NOT EXISTS public.reels (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID REFERENCES public.users(id),
                    video_url TEXT NOT NULL,
                    thumbnail_url TEXT,
                    caption TEXT,
                    tags TEXT[],
                    likes INTEGER DEFAULT 0,
                    views INTEGER DEFAULT 0,
                    comments_count INTEGER DEFAULT 0,
                    shares INTEGER DEFAULT 0,
                    created_at TIMESTAMP DEFAULT NOW(),
                    is_processed BOOLEAN DEFAULT FALSE
                );
                
                -- Check columns for Reels (Migrations for older DBs)
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reels' AND table_schema='public' AND column_name='views') THEN 
                    ALTER TABLE public.reels ADD COLUMN views INTEGER DEFAULT 0; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reels' AND table_schema='public' AND column_name='tags') THEN 
                    ALTER TABLE public.reels ADD COLUMN tags TEXT[]; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reels' AND table_schema='public' AND column_name='likes') THEN 
                    ALTER TABLE public.reels ADD COLUMN likes INTEGER DEFAULT 0; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='reels' AND table_schema='public' AND column_name='comments_count') THEN 
                    ALTER TABLE public.reels ADD COLUMN comments_count INTEGER DEFAULT 0; 
                END IF;

                -- Reel Likes
                CREATE TABLE IF NOT EXISTS public.reel_likes (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
                    created_at TIMESTAMP DEFAULT NOW(),
                    UNIQUE(user_id, reel_id)
                );

                -- Reel Comments
                CREATE TABLE IF NOT EXISTS public.reel_comments (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
                    reel_id UUID REFERENCES public.reels(id) ON DELETE CASCADE,
                    text TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT NOW()
                );

                ----------------------------------------------------------------
                -- 4. Communication Tables
                ----------------------------------------------------------------

                -- Call Logs
                CREATE TABLE IF NOT EXISTS public.call_logs (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                    caller_id UUID REFERENCES public.users(id),
                    receiver_id UUID REFERENCES public.users(id),
                    type VARCHAR(10) DEFAULT 'VIDEO', -- AUDIO, VIDEO
                    status VARCHAR(20) DEFAULT 'COMPLETED', -- MISSED, REJECTED, COMPLETED
                    duration_seconds INTEGER DEFAULT 0,
                    started_at TIMESTAMP DEFAULT NOW(),
                    ended_at TIMESTAMP
                );

            END $$;
        `);

        // 3. Create Indexes (Idempotent)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_messages_match ON public.messages(match_id); -- Corrected Index
            CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(created_at);
        `);
        client.release();
        console.log("✅ Schema verified (columns verified)");
    } catch (e) {
        console.warn("⚠️ Schema check failed (might be permissions or connectivity):", e);
    }

    // 3. Start Server with Socket.io
    const { createServer } = require('http');
    const { initSocket } = require('./socket');

    const httpServer = createServer(app);
    initSocket(httpServer);

    httpServer.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} at 0.0.0.0`);
    });
};

initServer();
