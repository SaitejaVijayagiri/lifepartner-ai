
import * as admin from 'firebase-admin';
import path from 'path';

export class NotificationService {
    private static instance: NotificationService;
    private initialized = false;

    private constructor() {
        try {
            // Check for service account file
            // User needs to place 'firebase-service-account.json' in backend root
            const serviceAccountPath = path.resolve(__dirname, '../../firebase-service-account.json');

            // Or use env var
            if (process.env.FIREBASE_SERVICE_ACCOUNT) {
                admin.initializeApp({
                    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
                });
                this.initialized = true;
                console.log("Firebase Admin Initialized (Env Var)");
            } else {
                // Try file
                const fs = require('fs');
                if (fs.existsSync(serviceAccountPath)) {
                    admin.initializeApp({
                        credential: admin.credential.cert(require(serviceAccountPath))
                    });
                    this.initialized = true;
                    console.log("Firebase Admin Initialized (File)");
                } else {
                    console.warn("Push Notifications skipped: No firebase-service-account.json found.");
                }
            }
        } catch (e) {
            console.error("Firebase Init Failed", e);
        }
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    public async sendvalidate(token: string): Promise<boolean> {
        if (!this.initialized) return false;
        try {
            await admin.messaging().send({
                token,
                notification: { title: 'Test', body: 'Validating token' },
            }, true); // dryRun
            return true;
        } catch (e) {
            return false;
        }
    }

    public async sendToToken(token: string, title: string, body: string, data?: any) {
        if (!this.initialized) {
            console.log(`[Mock Push] To ${token}: ${title} - ${body}`);
            return;
        }

        try {
            await admin.messaging().send({
                token,
                notification: { title, body },
                data: data ? Object.keys(data).reduce((acc, k) => ({ ...acc, [k]: String(data[k]) }), {}) : {}
            });
            console.log(`Push sent to ${token}`);
        } catch (e) {
            console.error(`Push failed to ${token}`, e);
        }
    }

    public async sendToUser(pool: any, userId: string, title: string, body: string, data?: any) {
        // 1. Get tokens
        const res = await pool.query("SELECT token FROM device_tokens WHERE user_id = $1", [userId]);
        if (res.rows.length === 0) return;

        const tokens = res.rows.map((r: any) => r.token);

        // 2. Send (Parallel)
        // If real firebase is off, we just mock log
        if (!this.initialized) {
            console.log(`[Mock Push] To User ${userId} (${tokens.length} devices): ${title}`);
            return;
        }

        // Multicast
        try {
            const message = {
                tokens,
                notification: { title, body },
                data: data ? Object.keys(data).reduce((acc, k) => ({ ...acc, [k]: String(data[k]) }), {}) : {}
            };
            const batchResponse = await admin.messaging().sendEachForMulticast(message);
            console.log(`Sent ${batchResponse.successCount} messages, failed ${batchResponse.failureCount}`);

            // Cleanup invalid tokens? (Optional enhancement)
        } catch (e) {
            console.error("Multicast Push Failed", e);
        }
    }
}
