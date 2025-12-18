import express from 'express';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { pool } from '../db';

const router = express.Router();

const isMock = process.env.RAZORPAY_KEY_ID?.includes('mock');

const razorpay = !isMock ? new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!
}) : null;

// Create Order (Mock or Real)
router.post('/create-order', async (req, res) => {
    try {
        const { amount } = req.body; // Amount in paise

        if (isMock) {
            console.log("⚠️ Using MOCK Payment Order");
            return res.json({
                id: `order_mock_${Date.now()}`,
                currency: 'INR',
                amount: amount,
                notes: { mock: true }
            });
        }

        const options = {
            amount: amount, // amount in the smallest currency unit
            currency: "INR",
            receipt: `receipt_${Date.now()}`,
        };

        const order = await razorpay!.orders.create(options);
        res.json(order);
    } catch (error) {
        console.error("Payment Order Error:", error);
        res.status(500).json({ error: "Failed to create payment order" });
    }
});

// Verify Payment (Updates Database)
router.post('/verify', async (req, res) => {
    try {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, userId } = req.body;

        if (!userId) {
            return res.status(400).json({ error: "User ID required" });
        }

        let isValid = false;

        if (isMock) {
            console.log("⚠️ Verifying MOCK Payment");
            isValid = true; // Always valid in mock mode
        } else {
            // Real Verification
            const body = razorpay_order_id + "|" + razorpay_payment_id;
            const expectedSignature = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
                .update(body.toString())
                .digest('hex');

            isValid = expectedSignature === razorpay_signature;
        }

        if (isValid) {
            // Update User to Premium
            const client = await pool.connect();
            try {
                if (req.body.type === 'COINS') {
                    // Credit Coins
                    const coins = req.body.coins || 0;
                    await client.query(
                        `UPDATE users SET coins = coins + $1 WHERE id = $2`,
                        [coins, userId]
                    );

                    // Record Transaction
                    await client.query(`
                        INSERT INTO transactions (user_id, type, amount, description, metadata)
                        VALUES ($1, 'DEPOSIT', $2, $3, $4)
                    `, [userId, coins, `Purchased ${coins} Coins`, { paymentId: razorpay_payment_id }]);

                } else {
                    // Default: Premium Subscription
                    await client.query(
                        `UPDATE users 
                         SET is_premium = TRUE, 
                             premium_expiry = NOW() + INTERVAL '1 year',
                             razorpay_customer_id = $1
                         WHERE id = $2`,
                        [razorpay_payment_id, userId]
                    );
                }
            } finally {
                client.release();
            }

            res.json({ success: true, message: "Premium Activated" });
        } else {
            res.status(400).json({ error: "Invalid Signature" });
        }

    } catch (error) {
        console.error("Payment Verify Error:", error);
        res.status(500).json({ error: "Verification Failed" });
    }
});

export default router;
