
'use client';

import { useSocket } from '@/context/SocketContext';
import { WifiOff } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function NetworkStatus() {
    const { isConnected } = useSocket() as any;
    const [show, setShow] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    useEffect(() => {
        // Only show if logged in
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        setIsLoggedIn(!!token);

        if (!token) {
            setShow(false);
            return;
        }

        let timeoutId: NodeJS.Timeout;

        // Show only if disconnected
        if (!isConnected) {
            // Delay showing "Reconnecting" by 2s to allow initial connection or brief hiccups
            timeoutId = setTimeout(() => setShow(true), 2000);
        } else {
            // If we were showing the banner (meaning we were truly disconnected long enough), show success
            if (show) {
                // Show "Back Online" for 2 seconds then hide
                timeoutId = setTimeout(() => setShow(false), 2000);
            }
        }

        return () => clearTimeout(timeoutId);
    }, [isConnected, show]);

    if (!show || !isLoggedIn) return null;

    return (
        <div className={`
            fixed top-0 left-0 right-0 z-[100] 
            bg-rose-500 text-white text-xs font-bold 
            h-6 flex items-center justify-center gap-2
            animate-in slide-in-from-top duration-300
            ${isConnected ? 'bg-emerald-500' : ''}
        `}>
            {isConnected ? (
                <>
                    <span>Back Online ⚡</span>
                </>
            ) : (
                <>
                    <WifiOff size={12} />
                    <span>Reconnecting...</span>
                </>
            )}
        </div>
    );
}
