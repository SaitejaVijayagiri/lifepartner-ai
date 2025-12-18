import express from 'express';
import { Cashfree } from "cashfree-pg";
import crypto from 'crypto';
import { pool } from '../db';

const router = express.Router();

// @ts-ignore
Cashfree.XClientId = process.env.CASHFREE_APP_ID!;
// @ts-ignore
Cashfree.XClientSecret = process.env.CASHFREE_SECRET_KEY!;
// @ts-ignore
Cashfree.XEnvironment = Cashfree.Environment.SANDBOX;

// @ts-ignore
const cashfree = new Cashfree({
    xClientId: process.env.CASHFREE_APP_ID!,
    xClientSecret: process.env.CASHFREE_SECRET_KEY!,
    // @ts-ignore
    xEnvironment: Cashfree.Environment.SANDBOX
});


// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, userId, phone, name } = req.body; // Amount in INR (not paise)

        // Ensure unique order ID
        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const request = {
            order_amount: amount,
            order_currency: "INR",
            order_id: orderId,
            customer_details: {
                customer_id: userId || "guest_user",
                customer_phone: phone || "9999999999",
                customer_name: name || "User",
                customer_email: "user@example.com"
            },
            order_meta: {
                return_url: `https://lifepartner-ai.vercel.app/dashboard?order_id=${orderId}`
            }
        };

        // @ts-ignore
        const response = await cashfree.PGCreateOrder("2023-08-01", request);
        res.json(response.data);

    } catch (error: any) {
        console.error("Cashfree Create Order Error:", error.response?.data?.message || error.message);
        const detailedError = error.response?.data?.message || error.message || "Unknown Cashfree Error";
        res.status(500).json({ error: detailedError, details: error.response?.data });
    }
});

// Verify Payment
router.post('/verify', async (req, res) => {
    try {
        const { orderId, userId, type, coins } = req.body;

        // Fetch Order Status from Cashfree
        // @ts-ignore
        const response = await cashfree.PGOrderFetchPayments("2023-08-01", orderId);
        const payments = response.data;

        // Check for a SUCCESS payment
        const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

        if (successfulPayment) {
            const client = await pool.connect();
            try {
                // Ensure we haven't processed this order yet to avoid duplicates
                const existing = await client.query('SELECT id FROM transactions WHERE metadata->>\'orderId\' = $1', [orderId]);
                if (existing.rows.length > 0) {
                    return res.json({ success: true, message: "Already processed" });
                }

                if (type === 'COINS') {
                    await client.query(
                        `UPDATE users SET coins = coins + $1 WHERE id = $2`,
                        [coins, userId]
                    );
                    await client.query(`
                        INSERT INTO transactions (user_id, type, amount, description, metadata)
                        VALUES ($1, 'DEPOSIT', $2, $3, $4)
                    `, [userId, coins, `Purchased ${coins} Coins`, { orderId, paymentId: successfulPayment.cf_payment_id }]);
                } else {
                    await client.query(
                        `UPDATE users 
                         SET is_premium = TRUE, 
                             premium_expiry = NOW() + INTERVAL '1 year',
                             razorpay_customer_id = $1
                         WHERE id = $2`,
                        [successfulPayment.cf_payment_id, userId] // Using cf_id as reference
                    );
                }
            } finally {
                client.release();
            }
            res.json({ success: true, message: "Payment Verified" });
        } else {
            res.status(400).json({ error: "Payment not successful" });
        }

    } catch (error: any) {
        console.error("Cashfree Verify Error:", error.message);
        res.status(500).json({ error: "Verification Failed" });
    }
});

export default router;
