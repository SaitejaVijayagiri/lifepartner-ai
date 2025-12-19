import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { pool } from '../db';
import { Resend } from 'resend';

const router = express.Router();
const resend = new Resend(process.env.RESEND_API_KEY || 're_123_mock'); // Fallback for dev if needed, or handle error

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret_key_123';

// Helper: Generate Token
const generateToken = (userId: string) => {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: '7d' });
};

// 1. Register with OTP
router.post('/register', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, phone, password, full_name, age, gender, location_name } = req.body;

        // 1. Validation
        if ((!email && !phone) || !password) {
            return res.status(400).json({ error: "Email/Phone and Password required" });
        }

        const identifier = email || phone;
        const targetEmail = email; // For now only email OTP

        // 2. Check existence
        const check = await client.query(
            "SELECT id FROM public.users WHERE email = $1 OR phone = $2",
            [email || '', phone || '']
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: "User already exists" });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // 4. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 5. Insert User (Unverified)
        await client.query('BEGIN');

        // Referral Logic
        let referredByUserId = null;
        if (req.body.referralCode) {
            const referrerRes = await client.query("SELECT id FROM public.users WHERE referral_code = $1", [req.body.referralCode]);
            if (referrerRes.rows.length > 0) {
                referredByUserId = referrerRes.rows[0].id;
                console.log(`🤝 Referred by: ${referredByUserId}`);
            }
        }

        // Generate Self Referral Code (First 4 name + 4 random)
        const safeName = full_name || "User";
        const baseName = safeName.replace(/[^a-zA-Z]/g, '').substring(0, 4).toUpperCase();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const myReferralCode = `${baseName}${randomSuffix}`;

        const userRes = await client.query(
            `INSERT INTO public.users (
                email, phone, password_hash, full_name, age, gender, location_name, 
                otp_code, otp_expires_at, is_verified, referral_code, referred_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, FALSE, $10, $11) 
            RETURNING id, full_name`,
            [email, phone, passwordHash, full_name, age, gender, location_name, otp, otpExpiresAt, myReferralCode, referredByUserId]
        );
        const newUser = userRes.rows[0];

        // Process Referral Rewards (Lazy Wallet Creation handled by wallet routes usually, but we insert directly here)
        if (referredByUserId) {
            // 1. Credit Referrer (+50 Coins)
            await client.query(
                `INSERT INTO public.transactions (user_id, amount, type, status, description, metadata) 
                 VALUES ($1, 50, 'REFERRAL_REWARD', 'SUCCESS', 'Referral Bonus', $2)`,
                [referredByUserId, JSON.stringify({ referredUser: newUser.id })]
            );

            // 2. Credit New User (+20 Coins)
            await client.query(
                `INSERT INTO public.transactions (user_id, amount, type, status, description, metadata) 
                 VALUES ($1, 20, 'REFERRAL_BONUS', 'SUCCESS', 'Signup Bonus', $2)`,
                [newUser.id, JSON.stringify({ referrer: referredByUserId })]
            );
        }

        // 6. Initialize Profile with Metadata
        const defaultMetadata = {
            religion: { religion: "Hindu", interCasteOpen: false },
            career: { profession: "", education: "", income: "" },
            family: { type: "Nuclear", values: "Moderate" },
            lifestyle: { diet: "Veg", smoke: "No", drink: "No" },
            partners: [] // To store simple interactions if needed
        };

        await client.query(
            `INSERT INTO public.profiles (user_id, raw_prompt, metadata) VALUES ($1, '', $2)`,
            [newUser.id, defaultMetadata]
        );

        await client.query('COMMIT');

        // 7. Send OTP Email
        console.log(`🔐 OTP for ${identifier}: ${otp}`); // Log for dev
        // DEV DEBUG: Write OTP to file
        try {
            const fs = require('fs');
            const path = require('path');
            fs.appendFileSync(path.join(__dirname, '../otp.log'), `[${new Date().toISOString()}] OTP for ${identifier}: ${otp}\n`);
        } catch (err) { console.error("Failed to write OTP log", err); }
        if (targetEmail && process.env.RESEND_API_KEY) {
            try {
                // Professional HTML Template
                const htmlContent = `
                <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f9fafb; padding: 40px; border-radius: 8px;">
                    <div style="text-align: center; margin-bottom: 30px;">
                        <h1 style="color: #4f46e5; margin: 0; font-size: 28px; font-weight: 700;">LifePartner AI</h1>
                        <p style="color: #6b7280; font-size: 14px; margin-top: 5px;">Where Tradition Meets Technology</p>
                    </div>
                    
                    <div style="background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);">
                        <p style="font-size: 16px; color: #374151; margin-bottom: 20px;">Namaste <strong>${full_name.split(' ')[0]}</strong>,</p>
                        <p style="font-size: 16px; color: #374151; line-height: 1.5; margin-bottom: 25px;">
                            Welcome to <strong>LifePartner AI</strong>! We are excited to help you find your perfect match.
                            To secure your account and begin your journey, please verify your email address using the code below:
                        </p>
                        
                        <div style="background-color: #f3f4f6; border-radius: 6px; padding: 20px; text-align: center; margin: 30px 0;">
                            <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #111827;">${otp}</span>
                        </div>
                        
                        <p style="font-size: 14px; color: #6b7280; text-align: center; margin-top: 20px;">
                            This code will expire in 10 minutes. <br/> If you didn't request this, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="text-align: center; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 20px;">
                        <p style="font-size: 12px; color: #9ca3af;">
                            &copy; ${new Date().getFullYear()} LifePartner AI. All rights reserved.<br/>
                            Secure & Private Matchmaking.
                        </p>
                    </div>
                </div>
                `;

                // Try sending
                if (process.env.RESEND_API_KEY.includes('mock')) {
                    console.log("⚠️ EMAIL NOT SENT (Mock Key in use). Check server logs for OTP.");
                } else {
                    const { error } = await resend.emails.send({
                        from: 'LifePartner AI <onboarding@resend.dev>', // Only works for your own email until domain verified
                        to: targetEmail,
                        subject: 'Verify your LifePartner AI Account',
                        html: htmlContent
                    });

                    if (error) {
                        console.error("Resend API Error:", error);
                    } else {
                        console.log(`📧 Email sent to ${targetEmail}`);
                    }
                }

            } catch (e) {
                console.error("Resend Network Error", e);
            }
        }

        // 8. Return success but NO TOKEN
        res.json({
            success: true,
            requiresVerification: true,
            email: targetEmail,
            message: "OTP sent to email"
        });

    } catch (error: any) {
        await client.query('ROLLBACK');
        console.error("Registration Error:", error);
        res.status(500).json({ error: 'Registration failed', details: error.message });
    } finally {
        client.release();
    }
});

// 2. Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        // Find user
        const result = await pool.query(
            "SELECT id, otp_code, otp_expires_at, is_verified, full_name FROM public.users WHERE email = $1",
            [email]
        );

        if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
        const user = result.rows[0];

        // Check if already verified
        if (user.is_verified) {
            const token = generateToken(user.id);
            return res.json({ success: true, token, userId: user.id, user: { id: user.id, name: user.full_name } });
        }

        // Validate OTP
        if (user.otp_code !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ error: "OTP Expired" });

        // Update User
        await pool.query("UPDATE public.users SET is_verified = TRUE, otp_code = NULL WHERE id = $1", [user.id]);

        // Return Token
        const token = generateToken(user.id);
        res.json({ success: true, token, userId: user.id, user: { id: user.id, name: user.full_name } });

    } catch (e) {
        console.error("Verify Error", e);
        res.status(500).json({ error: "Verification validation failed" });
    }
});

// 3. Login (Updated to check verification)
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const userRes = await pool.query(
            "SELECT id, password_hash, full_name, is_verified FROM public.users WHERE email = $1 OR phone = $1",
            [email]
        );

        if (userRes.rows.length === 0) return res.status(401).json({ error: "Invalid credentials" });

        const user = userRes.rows[0];

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) return res.status(401).json({ error: "Invalid credentials" });

        // Warn if not verified? For now, we might allow basic access or force verify.
        // Let's force verify if we are strict.
        /* 
        if (!user.is_verified) {
             return res.status(403).json({ error: "Account not verified", requiresVerification: true });
        }
        */

        const token = generateToken(user.id);
        res.json({ token, userId: user.id, user: { id: user.id, name: user.full_name } });

    } catch (error: any) {
        console.error("Login Error Details:", error);
        res.status(500).json({ error: "Login failed", details: error.message, stack: error.stack });
    }
});

// 4. Resend OTP Route
// 4. Resend OTP Route
router.post('/resend-otp', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        // 1. Check User
        const userRes = await client.query("SELECT id, full_name, is_verified FROM public.users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "User not found" });
        const user = userRes.rows[0];

        if (user.is_verified) return res.json({ message: "User already verified" });

        // 2. Generate New OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Update DB
        await client.query("UPDATE public.users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3", [otp, otpExpiresAt, user.id]);

        // 4. Send Email
        console.log(`🔐 RESENT OTP for ${email}: ${otp}`);

        if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('mock')) {
            await resend.emails.send({
                from: 'LifePartner AI <onboarding@resend.dev>',
                to: email,
                subject: 'Verify your LifePartner AI Account (Resend)',
                html: `
                    <h1>Verification Code</h1>
                    <p>Hello ${user.full_name},</p>
                    <p>Here is your new verification code:</p>
                    <h2>${otp}</h2>
                    <p>Expires in 10 minutes.</p>
                `
            });
        }

        res.json({ success: true, message: "OTP resent successfully" });

    } catch (e) {
        console.error("Resend OTP Error", e);
        res.status(500).json({ error: "Failed to resend OTP" });
    } finally {
        client.release();
    }
});

// 5. Forgot Password - Send OTP
router.post('/forgot-password', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email } = req.body;
        if (!email) return res.status(400).json({ error: "Email required" });

        // 1. Check User exists
        const userRes = await client.query("SELECT id, full_name FROM public.users WHERE email = $1", [email]);
        if (userRes.rows.length === 0) {
            // Security: Don't reveal user existence
            return res.json({ success: true, message: "If account exists, OTP sent." });
        }
        const user = userRes.rows[0];

        // 2. Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // 3. Save OTP (Re-using otp_code fields)
        await client.query(
            "UPDATE public.users SET otp_code = $1, otp_expires_at = $2 WHERE id = $3",
            [otp, otpExpiresAt, user.id]
        );

        // 4. Send Email
        console.log(`🔐 RESET OTP for ${email}: ${otp}`); // Dev log

        if (process.env.RESEND_API_KEY && !process.env.RESEND_API_KEY.includes('mock')) {
            await resend.emails.send({
                from: 'LifePartner AI Safety <security@resend.dev>',
                to: email,
                subject: 'Reset your LifePartner AI Password',
                html: `
                    <h1>Password Reset Request</h1>
                    <p>Hello ${user.full_name},</p>
                    <p>Use this code to reset your password:</p>
                    <h2>${otp}</h2>
                    <p>Expires in 10 minutes.</p>
                `
            });
        }

        res.json({ success: true, message: "OTP sent" });

    } catch (e) {
        console.error("Forgot PW Error", e);
        res.status(500).json({ error: "Request failed" });
    } finally {
        client.release();
    }
});

// 6. Reset Password - Verify OTP & Change PW
router.post('/reset-password', async (req, res) => {
    const client = await pool.connect();
    try {
        const { email, otp, newPassword } = req.body;
        if (!email || !otp || !newPassword) return res.status(400).json({ error: "Missing fields" });

        // 1. Validate User & OTP
        const userRes = await client.query(
            "SELECT id, otp_code, otp_expires_at FROM public.users WHERE email = $1",
            [email]
        );

        if (userRes.rows.length === 0) return res.status(400).json({ error: "Invalid request" });
        const user = userRes.rows[0];

        if (user.otp_code !== otp) return res.status(400).json({ error: "Invalid OTP" });
        if (new Date() > new Date(user.otp_expires_at)) return res.status(400).json({ error: "OTP Expired" });

        // 2. Hash New Password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(newPassword, salt);

        // 3. Update DB
        await client.query(
            "UPDATE public.users SET password_hash = $1, otp_code = NULL WHERE id = $2",
            [passwordHash, user.id]
        );

        res.json({ success: true, message: "Password updated successfully" });

    } catch (e) {
        console.error("Reset PW Error", e);
        res.status(500).json({ error: "Reset failed" });
    } finally {
        client.release();
    }
});

router.post('/send-otp', async (req, res) => {
    // Keeping old route for compatibility if needed, but it's mostly replaced by register flow
    res.json({ success: true, message: "Use /register for new accounts" });
});

// 7. Google Auth Code Exchange
router.post('/google', async (req, res) => {
    const client = await pool.connect();
    try {
        const { code } = req.body;

        // 1. Exchange Code for Tokens
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: '326304538770-5tskm10njnb8e5kkh1gdp4as7sb7km9b.apps.googleusercontent.com',
                client_secret: process.env.GOOGLE_CLIENT_SECRET!,
                redirect_uri: process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3005/auth/callback/google',
                grant_type: 'authorization_code'
            })
        });

        const tokens = await tokenRes.json();
        if (tokens.error) throw new Error(tokens.error_description || tokens.error);

        // 2. Get User Profile
        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const profile = await profileRes.json();

        // 3. Upsert User
        const email = profile.email;
        const googleId = profile.id;
        const name = profile.name;
        const picture = profile.picture;

        // Check if user exists by google_id OR email
        const userCheck = await client.query(
            "SELECT id FROM public.users WHERE google_id = $1 OR email = $2",
            [googleId, email]
        );

        let userId;

        if (userCheck.rows.length > 0) {
            // Update existing
            userId = userCheck.rows[0].id;
            await client.query(
                "UPDATE public.users SET google_id = $1, is_verified = TRUE WHERE id = $2",
                [googleId, userId]
            );
        } else {
            // Create new
            await client.query('BEGIN');
            const newUser = await client.query(`
                INSERT INTO public.users (full_name, email, google_id, is_verified, password_hash, avatar_url)
                VALUES ($1, $2, $3, TRUE, 'google_auth_placeholder', $4)
                RETURNING id
            `, [name, email, googleId, picture]);
            userId = newUser.rows[0].id;

            // Init Profile
            await client.query(
                `INSERT INTO public.profiles (user_id, raw_prompt, metadata) VALUES ($1, '', $2)`,
                [userId, {}] // Empty metadata for now
            );
            await client.query('COMMIT');
        }

        // 4. Generate Token
        const token = generateToken(userId);
        res.json({ success: true, token, userId });

    } catch (e: any) {
        await client.query('ROLLBACK');
        console.error("Google Auth Error", e);
        res.status(500).json({ error: e.message || "Google Login Failed" });
    } finally {
        client.release();
    }
});

export default router;
