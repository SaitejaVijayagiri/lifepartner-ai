
import { Server, Socket } from 'socket.io';
import { Server as HttpServer } from 'http';
import { pool } from './db';

let io: Server;

export const initSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: '*',
            methods: ['GET', 'POST']
        }
    });

    io.on('connection', (socket: Socket) => {
        console.log('Socket User Connected:', socket.id);

        // User Greeting
        socket.emit('me', socket.id);

        // Disconnect
        socket.on('disconnect', () => {
            console.log('Socket User Disconnected:', socket.id);
            socket.broadcast.emit('callEnded');
        });

        // JOIN "Personal Room" (using userId as room name)
        socket.on("join-room", (userId: string) => {
            console.log(`User ${userId} joined room ${userId}`);
            socket.join(userId);
        });

        /**
         * CALL USER
         */
        socket.on("callUser", async ({ userToCall, signalData, from, name }) => {
            console.log(`Call Initiated: ${from} -> ${userToCall}`);

            try {
                // REVENUE PROTECTION: Check if Caller is Premium
                // Assuming 'from' is a valid userId for now.
                // TODO: Verify 'from' against actual socket auth in future refactor.

                const client = await pool.connect();
                // Simple validation to prevent crashes if 'from' is 'me' or invalid
                if (from && from !== 'me') {
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
                    name
                });

            } catch (e) {
                console.error("Call Gating Error", e);
            }
        });

        /**
         * ANSWER CALL
         */
        socket.on("answerCall", (data) => {
            console.log(`Call Answered by ${data.from}`);
            io.to(data.to).emit("callAccepted", data.signal);
        });

        /**
         * CHAT LOGIC
         */
        socket.on("sendMessage", ({ to, text, from }) => {
            console.log(`Msg: ${from} -> ${to}: ${text}`);
            // Emit to Receiver's Room (userId)
            io.to(to).emit("receiveMessage", {
                text,
                senderId: from,
                timestamp: new Date()
            });
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
