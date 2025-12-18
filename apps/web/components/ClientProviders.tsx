
'use client';

import { useEffect, useState } from 'react';
import { SocketProvider } from '@/context/SocketContext';
import { Toaster } from '@/components/ui/Toast';

export default function ClientProviders({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<string | undefined>(undefined);

    useEffect(() => {
        // Hydrate User ID from LocalStorage
        try {
            const stored = localStorage.getItem('user');
            if (stored) {
                const user = JSON.parse(stored);
                if (user.id) setUserId(user.id);
            }
        } catch (e) {
            console.error("Auth Hydration Error", e);
        }
    }, []);

    return (
        <SocketProvider userId={userId}>
            {children}
            <Toaster />
        </SocketProvider>
    );
}
