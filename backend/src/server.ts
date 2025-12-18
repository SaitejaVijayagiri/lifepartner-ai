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
// import { seedDatabase } from './seed'; 

dotenv.config(); // Load ENV

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
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

// Health Check
app.get('/', (req, res) => {
    res.send('Life Partner AI Backend is Running (Production Mode)');
});

// Routes
app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/matches', matchRoutes);
app.use('/interactions', interactionRoutes);
app.use('/messages', chatRoutes);
app.use('/games', gameRoutes);
app.use('/payments', paymentRoutes);
app.use('/reels', require('./routes/reels').default);
app.use('/notifications', require('./routes/notifications').default);
app.use('/wallet', walletRoutes); // Mounted wallet routes

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
                -- Profiles: reels, metadata
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND table_schema='public' AND column_name='reels') THEN 
                    ALTER TABLE public.profiles ADD COLUMN reels JSONB DEFAULT '[]'::jsonb; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='profiles' AND table_schema='public' AND column_name='metadata') THEN 
                    ALTER TABLE public.profiles ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb; 
                END IF;
                
                -- Users: phone
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='phone') THEN 
                    ALTER TABLE public.users ADD COLUMN phone VARCHAR(20); 
                    ALTER TABLE public.users ADD CONSTRAINT users_phone_key UNIQUE (phone);
                END IF;

                -- Users: Premium Status
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='is_premium') THEN 
                    ALTER TABLE public.users ADD COLUMN is_premium BOOLEAN DEFAULT FALSE;
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='razorpay_customer_id') THEN 
                    ALTER TABLE public.users ADD COLUMN razorpay_customer_id VARCHAR(100);
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND table_schema='public' AND column_name='premium_expiry') THEN 
                    ALTER TABLE public.users ADD COLUMN premium_expiry TIMESTAMP;
                END IF;
            END $$;
                -- Messages Table Self-Healing
                -- Ensure table exists first (if not created by CREATE TABLE IF NOT EXISTS below)
                CREATE TABLE IF NOT EXISTS public.messages (
                    id UUID DEFAULT gen_random_uuid() PRIMARY KEY
                );

                -- Check columns
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='sender_id') THEN 
                    ALTER TABLE public.messages ADD COLUMN sender_id UUID REFERENCES public.users(id); 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='receiver_id') THEN 
                    ALTER TABLE public.messages ADD COLUMN receiver_id UUID REFERENCES public.users(id); 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='content') THEN 
                    ALTER TABLE public.messages ADD COLUMN content TEXT; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='is_read') THEN 
                    ALTER TABLE public.messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE; 
                END IF;
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='messages' AND table_schema='public' AND column_name='timestamp') THEN 
                    ALTER TABLE public.messages ADD COLUMN timestamp TIMESTAMP DEFAULT NOW(); 
                END IF;
            END $$;
        `);

        // 3. Create Indexes (Idempotent)
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_messages_sender ON public.messages(sender_id);
            CREATE INDEX IF NOT EXISTS idx_messages_receiver ON public.messages(receiver_id);
            CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON public.messages(timestamp);
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
