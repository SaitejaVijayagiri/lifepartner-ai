import { pool } from '../db';

const setupWallet = async () => {
    const client = await pool.connect();
    try {
        console.log("Adding 'coins' to users...");
        await client.query(`
            ALTER TABLE public.users 
            ADD COLUMN IF NOT EXISTS coins INTEGER DEFAULT 0;
        `);

        console.log("Creating 'transactions' table...");
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.transactions (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES public.users(id),
                type VARCHAR(20) NOT NULL, -- 'DEPOSIT', 'SPEND'
                amount INTEGER NOT NULL,
                description TEXT,
                metadata JSONB, -- store gift_id, receiver_id etc.
                created_at TIMESTAMP DEFAULT NOW()
            );
        `);

        console.log("Giving 100 free coins to everyone!");
        await client.query(`UPDATE public.users SET coins = 100 WHERE coins = 0`);

        console.log("✅ Wallet System Ready");

    } catch (e) {
        console.error("Setup Failed", e);
    } finally {
        client.release();
        process.exit();
    }
};

setupWallet();
