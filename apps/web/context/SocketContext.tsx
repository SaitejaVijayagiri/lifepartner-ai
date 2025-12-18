
'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => {
    return useContext(SocketContext);
};

export const SocketProvider = ({ children, userId }: { children: React.ReactNode, userId?: string }) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        // Connect to Backend URL (Hardcoded for Production Fix)
        const socketUrl = 'https://lifepartner-ai.onrender.com';
        console.log("Connecting to Socket.io at:", socketUrl);

        const newSocket = io(socketUrl, {
            path: '/socket.io',
            transports: ['websocket', 'polling'],
        });

        // Connection Events
        newSocket.on('connect', () => {
            console.log("✅ Socket Connected");
            setIsConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log("❌ Socket Disconnected");
            setIsConnected(false);
        });

        newSocket.on('connect_error', (err) => {
            console.log("⚠️ Socket Connection Error:", err.message);
            setIsConnected(false);
        });

        setSocket(newSocket);

        // Join Personal Room if UserID exists
        if (userId) {
            newSocket.emit('join-room', userId);
        }

        return () => {
            newSocket.disconnect();
        };
    }, [userId]);

    return (
        <SocketContext.Provider value={{ socket, isConnected } as any}>
            {children}
        </SocketContext.Provider>
    );
};
