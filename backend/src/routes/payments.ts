import express from 'express';
import crypto from 'crypto';
import { pool } from '../db';

const router = express.Router();

const APP_ID = process.env.CASHFREE_APP_ID!;
const SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
// Use TEST keys -> Sandbox URL
const ENV = process.env.CASHFREE_ENV || "TEST";
const BASE_URL = ENV === "PROD" ? "https://api.cashfree.com/pg" : "https://sandbox.cashfree.com/pg";

const HEADERS = {
    'x-client-id': APP_ID,
    'x-client-secret': SECRET_KEY,
    'x-api-version': '2023-08-01',
    'Content-Type': 'application/json'
};

import { authenticateToken } from '../middleware/auth';

// Create Order (Authenticated)
router.post('/create-order', authenticateToken, async (req: any, res) => {
    try {
        const { amount, phone, name } = req.body;
        const userId = req.user.userId; // Secure User ID

        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const requestData = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: userId,
                customer_phone: phone || "9999999999",
                customer_name: name || "User",
                customer_email: "user@example.com"
            },
            order_meta: {
                return_url: `${req.headers.origin || 'https://lifepartner-ai.vercel.app'}/dashboard?order_id=${orderId}&type=${req.body.type || 'COINS'}&coins=${req.body.coins || 0}`
            }
        };

        const response = await fetch(`${BASE_URL}/orders`, {
            method: 'POST',
            headers: HEADERS,
            body: JSON.stringify(requestData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Cashfree API Failed");
        }

        res.json(data);

    } catch (error: any) {
        console.error("Cashfree Create Order Error:", error.message);
        res.status(500).json({ error: error.message, details: error.response });
    }
});

// Helper: Verify and Record Payment safely
const verifyPaymentInternal = async (orderId: string, expectedUserId?: string) => {
    try {
        console.log(`Verifying Order: ${orderId}`);

        // 1. Fetch Authoritative Status from Cashfree (Server-to-Server)
        const response = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
            method: 'GET',
            headers: HEADERS
        });

        const payments = await response.json();

        if (!Array.isArray(payments)) {
            if (payments.message) throw new Error(payments.message);
            throw new Error("Invalid response from Cashfree");
        }

        // 2. Check for SUCCESS
        const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

        if (!successfulPayment) {
            return { success: false, message: "Payment not successful yet" };
        }

        // 3. Database Updates (Idempotent)
        const client = await pool.connect();
        try {
            await client.query('BEGIN');

            // Check if processed
            const existing = await client.query('SELECT id, user_id FROM transactions WHERE metadata->>\'orderId\' = $1', [orderId]);

            // If already processed, just return success
            if (existing.rows.length > 0) {
                await client.query('ROLLBACK');
                return { success: true, message: "Already processed", type: 'EXISTING' };
            }

            // If userId was not passed (e.g. Webhook), we must find it.
            // Assumption: we stored userId in Cashfree order_meta or customer_id? 
            // In create-order we sent `customer_id`. Let's assume customer_id IS userId.
            // But Cashfree returns it in the order details, not always in payment details.
            // For now, if expectedUserId is missing, we might fail unless we fetch order details.
            // Let's fetch Order Details to get customer_id if needed.
            let userId = expectedUserId;
            if (!userId) {
                const orderResp = await fetch(`${BASE_URL}/orders/${orderId}`, { headers: HEADERS });
                const orderData = await orderResp.json();
                userId = orderData.customer_details?.customer_id;
                // If customer_id was "guest", we can't link.
                if (!userId || userId === 'guest_user') throw new Error("Cannot link payment to user");
            }

            // Extract Value
            const paymentAmount = successfulPayment.payment_amount;
            const paymentCurrency = successfulPayment.payment_currency || 'INR';

            // Determine Type based on Amount (Naive but works) or Metadata if we saved it?
            // We didn't save metadata in Cashfree CreateOrder other than return_url.
            // Strategy: 499 = Premium, others = Coins?
            // BETTER: Use the `amount` to determine coins.
            // 99 = 100 coins, 399 = 500 coins, 699 = 1000 coins.
            // 499 = Premium.
            // 50 = Boost.

            let type = 'COINS';
            let coins = 0;
            let description = '';

            const amt = parseFloat(paymentAmount);

            if (Math.abs(amt - 499) < 1) {
                type = 'SUBSCRIPTION';
                description = 'Premium Subscription (1 Year)';
            } else if (Math.abs(amt - 50) < 1) {
                type = 'BOOST';
                description = 'Profile Boost';
            } else {
                type = 'COINS';
                // Reverse engineer coins? 
                if (Math.abs(amt - 99) < 1) coins = 100;
                else if (Math.abs(amt - 399) < 1) coins = 500;
                else if (Math.abs(amt - 699) < 1) coins = 1000;
                else coins = Math.floor(amt); // Fallback: 1 Rupee = 1 Coin
                description = `Purchased ${coins} Coins`;
            }

            // EXECUTE UPDATES
            if (type === 'COINS') {
                await client.query(`UPDATE users SET coins = coins + $1 WHERE id = $2`, [coins, userId]);
            } else if (type === 'SUBSCRIPTION') {
                await client.query(`
                    UPDATE users 
                    SET is_premium = TRUE, 
                        premium_expiry = NOW() + INTERVAL '1 year',
                        razorpay_customer_id = $1 
                    WHERE id = $2`,
                    [successfulPayment.cf_payment_id, userId]
                );
            } else if (type === 'BOOST') {
                await client.query(`
                    UPDATE users 
                    SET is_boosted = TRUE, 
                        boost_expires_at = NOW() + INTERVAL '30 minutes',
                        coins = coins  -- No deduction here, it was direct purchase
                    WHERE id = $1`,
                    [userId]
                );
            }

            // Log Transaction
            await client.query(`
                INSERT INTO transactions (user_id, type, amount, currency, description, metadata, status)
                VALUES ($1, $2, $3, $4, $5, $6, 'SUCCESS')
            `, [
                userId,
                type === 'COINS' ? 'DEPOSIT' : type, // Keep DB enum clean
                paymentAmount,
                paymentCurrency,
                description,
                { orderId, paymentId: successfulPayment.cf_payment_id, coins }
            ]);

            await client.query('COMMIT');
            return { success: true, message: "Payment Verified & Recorded" };

        } catch (e) {
            await client.query('ROLLBACK');
            throw e;
        } finally {
            client.release();
        }

    } catch (error: any) {
        console.error("Verify Internal Error:", error.message);
        throw error;
    }
};

// Client-Side Verification (called by frontend) - Authenticated
router.post('/verify', authenticateToken, async (req: any, res) => {
    try {
        const { orderId } = req.body;
        const userId = req.user.userId; // Secure User ID

        // userId from body helps avoiding extra fetch
        const result = await verifyPaymentInternal(orderId, userId);

        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json({ error: result.message });
        }
    } catch (error: any) {
        res.status(500).json({ error: "Verification Failed" });
    }
});

// Webhook Handler (called by Cashfree)
router.post('/webhook', async (req, res) => {
    try {
        console.log("Webhook Received:", JSON.stringify(req.body));

        // 1. Basic Signature/Secret Check (Optional but recommended)
        // Cashfree usually sends verification headers. For now, we rely on the implementation 
        // that fetches status DIRECTLY from Cashfree using the ID. 
        // Faking the ID won't work because we validate against cashfree server.

        const data = req.body?.data;
        const orderId = data?.order?.order_id;

        if (orderId) {
            // Trigger verification (Fire & Forget / Await)
            // We await to send 200 OK only if processed.
            await verifyPaymentInternal(orderId);
            console.log(`Webhook Processed for ${orderId}`);
        }

        res.json({ status: "OK" });

    } catch (error) {
        console.error("Webhook Error:", error);
        // Return 200 to prevent Cashfree retries on logic errors? 
        // Usually better to return 500 to force retry if DB failed.
        res.status(500).json({ status: "Error" });
    }
});

export default router;
