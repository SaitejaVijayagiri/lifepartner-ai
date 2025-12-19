import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { pool } from './db';
import jwt from 'jsonwebtoken';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    // MIDDLEWARE: Authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token || socket.handshake.query.token;

        if (!token) {
            return next(new Error("Authentication error"));
        }

        jwt.verify(token as string, process.env.JWT_SECRET as string, (err, decoded) => {
            if (err) return next(new Error("Authentication error"));
            socket.data.user = decoded; // Store user info in socket session
            next();
        });
    });

    io.on('connection', (socket: Socket) => {
        const userId = socket.data.user?.userId;
        console.log(`Socket User Connected: ${socket.id} (User: ${userId})`);

        // User Greeting
        socket.emit('me', socket.id);

        // Disconnect
        socket.on('disconnect', () => {
            // console.log('Socket User Disconnected:', socket.id);
            socket.broadcast.emit('callEnded');
        });

        // JOIN "Personal Room" (using userId as room name)
        // Auto-join based on auth, ignore client param if it doesn't match (or just force it)
        if (userId) {
            socket.join(userId);
            console.log(`User ${userId} auto-joined room ${userId}`);
        }

        /**
         * CALL USER
         */
        socket.on("callUser", async ({ userToCall, signalData, name, type }) => {
            const from = userId; // Secure source
            console.log(`Call Initiated: ${from} -> ${userToCall} (${type || 'video'})`);

            try {
                // REVENUE PROTECTION: Check if Caller is Premium
                const client = await pool.connect();
                // Simple validation to prevent crashes if 'from' is 'me' or invalid
                if (from) {
                    const userCheck = await client.query("SELECT is_premium FROM public.users WHERE id = $1", [from]);
                    if (userCheck.rows.length === 0 || !userCheck.rows[0].is_premium) {
                        console.log(`Blocked Call from Free User: ${from}`);
                        io.to(socket.id).emit("callError", { message: "Premium Plan required to make video calls." });
                        client.release();
                        return;
                    }
                }
                client.release();

                io.to(userToCall).emit("callUser", {
                    signal: signalData,
                    from,
                    name,
                    type // Pass the type (audio/video)
                });

            } catch (e) {
                console.error("Call Gating Error", e);
            }
        });

        /**
         * ANSWER CALL
         */
        socket.on("answerCall", (data) => {
            // console.log(`Call Answered by ${userId}`);
            io.to(data.to).emit("callAccepted", data.signal);
        });

        /**
         * TYPING
         */
        socket.on("typing", ({ to }) => {
            io.to(to).emit("typing", { from: userId });
        });

        /**
         * CHAT LOGIC
         */
        socket.on("sendMessage", async ({ to, text }) => {
            const from = userId; // Secure source
            // console.log(`Msg: ${from} -> ${to}: ${text}`);

            try {
                // 1. Save to DB
                const client = await pool.connect();
                await client.query(
                    `INSERT INTO public.messages (sender_id, receiver_id, content) VALUES ($1, $2, $3)`,
                    [from, to, text]
                );
                client.release();

                // 2. Emit to Receiver
                io.to(to).emit("receiveMessage", {
                    text,
                    senderId: from,
                    timestamp: new Date()
                });
            } catch (e) {
                console.error("Message Persistence Error:", e);
            }
        });
    });

    console.log("✅ Socket.io Initialized");
    return io;
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
