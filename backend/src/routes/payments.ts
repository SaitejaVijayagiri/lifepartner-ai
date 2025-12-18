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

// Create Order
router.post('/create-order', async (req, res) => {
    try {
        const { amount, userId, phone, name } = req.body;

        const orderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

        const requestData = {
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

// Verify Payment
router.post('/verify', async (req, res) => {
    try {
        const { orderId, userId, type, coins } = req.body;

        const response = await fetch(`${BASE_URL}/orders/${orderId}/payments`, {
            method: 'GET',
            headers: HEADERS
        });

        const payments = await response.json();

        if (!Array.isArray(payments)) {
            // Check if it's an error object
            if (payments.message) throw new Error(payments.message);
            throw new Error("Invalid response from Cashfree");
        }

        // Check for a SUCCESS payment
        const successfulPayment = payments.find((p: any) => p.payment_status === "SUCCESS");

        if (successfulPayment) {
            const client = await pool.connect();
            try {
                // Ensure we haven't processed this order yet
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
                        [successfulPayment.cf_payment_id, userId]
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
