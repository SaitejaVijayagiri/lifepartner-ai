const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export async function fetchAPI(endpoint: string, options: RequestInit = {}) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

    const headers: any = {
        ...options.headers,
    };

    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    let data;
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
        data = await res.json();
    } else {
        const text = await res.text();
        throw new Error(`API Error ${res.status}: ${text.substring(0, 100)}`);
    }

    if (res.status === 401) {
        if (typeof window !== 'undefined') {
            console.warn("Session expired. Redirecting to login.");
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            window.location.href = '/login';
        }
        throw new Error('Session Expired. Please login again.');
    }

    if (!res.ok) throw new Error(data.error || `API Request Failed: ${res.status}`);
    return data;
}

export const api = {
    auth: {
        register: (data: any) => fetchAPI('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
        login: (data: any) => fetchAPI('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
        sendOtp: (mobile: string) => fetchAPI('/auth/send-otp', { method: 'POST', body: JSON.stringify({ mobile }) }),
        verifyOtp: (payload: { email: string, otp: string }) => fetchAPI('/auth/verify-otp', { method: 'POST', body: JSON.stringify(payload) }),
    },
    profile: {
        updatePrompt: (payload: any) => fetchAPI('/profile/prompt', { method: 'POST', body: JSON.stringify(payload) }),
        getMe: () => fetchAPI('/profile/me'),
        updateProfile: (data: any) => fetchAPI('/profile/me', { method: 'PUT', body: JSON.stringify(data) }),
        uploadReel: (videoUrl: string) => fetchAPI('/profile/reel', { method: 'POST', body: JSON.stringify({ videoUrl }) }),
        deleteReel: (videoUrl: string) => fetchAPI('/profile/reel', { method: 'DELETE', body: JSON.stringify({ videoUrl }) }),
        uploadStory: (formData: FormData) => fetchAPI('/profile/stories', {
            method: 'POST',
            body: formData,
            headers: {} // Let browser set Content-Type for FormData
        }),
        deleteStory: (storyId: string) => fetchAPI(`/profile/stories/${storyId}`, { method: 'DELETE' }),
        uploadVoiceBio: (formData: FormData) => fetchAPI('/profile/voice-bio', {
            method: 'POST',
            body: formData,
            headers: {}
        }),
    },
    matches: {
        getAll: () => fetchAPI('/matches/recommendations'),
        search: (query: string) => fetchAPI('/matches/search', {
            method: 'POST',
            body: JSON.stringify({ query })
        }),
        runSimulation: (matchId: string) => fetchAPI(`/matches/${matchId}/simulation`, { method: 'POST' }),
    },
    interactions: {
        getRequests: () => fetchAPI('/interactions/requests'),
        getConnections: () => fetchAPI('/interactions/connections'),
        acceptRequest: (id: string) => fetchAPI(`/interactions/requests/${id}/accept`, { method: 'POST' }),
        declineRequest: (id: string) => fetchAPI(`/interactions/requests/${id}/decline`, { method: 'POST' }),
        sendInterest: (toUserId: string) => fetchAPI('/interactions/interest', {
            method: 'POST',
            body: JSON.stringify({ toUserId })
        }),
        revokeInterest: (toUserId: string) => fetchAPI(`/interactions/interest/${toUserId}`, { method: 'DELETE' }),
        sendLike: (toUserId: string) => fetchAPI('/interactions/like', {
            method: 'POST',
            body: JSON.stringify({ toUserId })
        }),
        revokeLike: (toUserId: string) => fetchAPI(`/interactions/like/${toUserId}`, { method: 'DELETE' }),
        deleteConnection: (id: string) => fetchAPI(`/interactions/connections/${id}`, { method: 'DELETE' }),
        deleteStory: (storyId: string) => fetchAPI(`/profile/stories/${storyId}`, { method: 'DELETE' }),
        contact: (data: any) => fetchAPI('/interactions/contact', { method: 'POST', body: JSON.stringify(data) }),
    },
    chat: {
        getHistory: (connId: string) => fetchAPI(`/messages/${connId}/history`),
        sendMessage: (connId: string, text: string, senderId: string) => fetchAPI(`/messages/${connId}/send`, {
            method: 'POST',
            body: JSON.stringify({ text, senderId })
        })
    },
    games: {
        start: (partnerId: string) => fetchAPI('/games/start', { method: 'POST', body: JSON.stringify({ partnerId }) }),
        submitAnswer: (gameId: string, questionId: number, optionIndex: number, userId: string) => fetchAPI(`/games/${gameId}/answer`, {
            method: 'POST',
            body: JSON.stringify({ questionId, optionIndex, userId })
        })
    },
    payments: {
        createOrder: (amount: number, type: 'COINS' | 'PREMIUM' = 'COINS', coins: number = 0) =>
            fetchAPI('/payments/create-order', { method: 'POST', body: JSON.stringify({ amount, type, coins }) }),
        verifyPayment: (payload: any) => fetchAPI('/payments/verify', { method: 'POST', body: JSON.stringify(payload) })
    },
    notifications: {
        register: (token: string, platform: string) => fetchAPI('/notifications/register', {
            method: 'POST',
            body: JSON.stringify({ token, platform })
        }),
        getAll: () => fetchAPI('/notifications'),
        markRead: (id: string) => fetchAPI(`/notifications/${id}/read`, { method: 'PUT' }),
        markAllRead: () => fetchAPI('/notifications/read-all', { method: 'PUT' })
    },
    wallet: {
        getBalance: () => fetchAPI('/wallet/balance'),
        sendGift: (toUserId: string, giftId: string, cost: number) => fetchAPI('/wallet/gift', {
            method: 'POST',
            body: JSON.stringify({ toUserId, giftId, cost })
        }),
        boostProfile: () => fetchAPI('/wallet/boost', { method: 'POST' })
    },
    ai: {
        getIcebreaker: (targetUserId: string) => fetchAPI('/ai/icebreaker', {
            method: 'POST',
            body: JSON.stringify({ userId: typeof window !== 'undefined' ? localStorage.getItem('userId') : null, targetUserId })
        })
    },
    calls: {
        getHistory: () => fetchAPI('/calls/history'),
        log: (data: any) => fetchAPI('/calls/log', { method: 'POST', body: JSON.stringify(data) })
    }
};
