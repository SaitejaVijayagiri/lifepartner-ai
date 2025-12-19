'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

import { Suspense } from 'react';

function GoogleCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('Authenticating with Google...');

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setStatus('No code received from Google.');
            return;
        }

        const exchangeCode = async () => {
            try {
                // Send code to backend
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
                const res = await axios.post(`${apiUrl}/auth/google`, { code });

                if (res.data.token) {
                    localStorage.setItem('token', res.data.token);
                    localStorage.setItem('userId', res.data.userId);
                    setStatus('Success! Redirecting...');
                    setTimeout(() => router.push('/dashboard'), 1000);
                }
            } catch (err: any) {
                console.error("Google Auth Error", err);
                setStatus(`Login Failed: ${err.response?.data?.error || err.message}`);
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, router]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-white">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xl font-semibold text-gray-700">{status}</p>
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <GoogleCallbackContent />
        </Suspense>
    );
}
