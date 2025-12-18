'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import MatchCard from '@/components/MatchCard';
import ProfileEditor from '@/components/ProfileEditor';
// import ProfileModal from '@/components/ProfileModal';
import dynamic from 'next/dynamic';
const ProfileModal = dynamic(() => import('@/components/ProfileModal'), {
    loading: () => <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"><div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div></div>,
    ssr: false
});
import ChatWindow from '@/components/ChatWindow';
import VideoCallModal from '@/components/VideoCallModal';
import ReelFeed from '@/components/ReelFeed';
import { Toaster, useToast } from '@/components/ui/Toast';
import { PremiumModal } from '@/components/PremiumModal';
import { NotificationBell } from '@/components/NotificationBell';
import { Heart, MessageCircle, User, Video, Users, LogOut, Sparkles, Trash2, Crown, X } from 'lucide-react';
import StoryModal from '@/components/StoryModal';

export default function DashboardPage() {
    const [activeTab, setActiveTab] = useState<'matches' | 'requests' | 'connections' | 'profile' | 'reels'>('matches');
    const [matches, setMatches] = useState<any[]>([]);
    const [requests, setRequests] = useState<any[]>([]);
    const [connections, setConnections] = useState<any[]>([]);
    const [myProfile, setMyProfile] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<any>(null);
    const [viewingReel, setViewingReel] = useState<string | null>(null);
    const [viewingStory, setViewingStory] = useState<any>(null); // Changed from boolean to any to support story object
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [showConnectionsModal, setShowConnectionsModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);

    // Chat & Video State
    const [activeChat, setActiveChat] = useState<any>(null); // The accepted interaction object
    const [isVideoCall, setIsVideoCall] = useState(false);

    const [loading, setLoading] = useState(true);
    const toast = useToast();

    // Auth Check - redirect to login if not authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            window.location.href = '/login';
        }
    }, []);

    // Fetch Data
    const loadData = async () => {
        try {
            // 1. Fetch Profile FAST (Blocks UI Structure)
            // If we don't have profile, we can't show much anyway
            try {
                const me = await api.profile.getMe();
                setMyProfile(me);
                setLoading(false); // <--- UNBLOCK UI HERE
            } catch (e) {
                console.error("Failed to load profile", e);
                // If profile fails, likely auth error, but let's not break everything
                setLoading(false);
                return;
            }

            // 2. Fetch Heavy Data (Matches, Connections) in Background
            // Don't set loading=true here, just let them populate
            const [matchesColors, requestsData, connectionsData] = await Promise.all([
                api.matches.getAll().catch(e => ({ matches: [] })),
                api.interactions.getRequests().catch(e => []),
                api.interactions.getConnections().catch(e => [])
            ]);

            setMatches(matchesColors.matches || []);
            setRequests(requestsData || []);
            setConnections(connectionsData || []);

        } catch (err) {
            console.error("Failed to load dashboard data", err);
            toast.error("Network issue. Some data might be missing.");
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAccept = async (reqId: string) => {
        try {
            await api.interactions.acceptRequest(reqId);
            setRequests(prev => prev.filter(r => r.interactionId !== reqId));

            // Refresh connections to show the new chat immediately
            const newConns = await api.interactions.getConnections();
            setConnections(newConns);

            toast.success("Request Accepted! You can now chat.");
        } catch (err) {
            toast.error("Failed to accept request.");
        }
    };

    const handleDecline = async (reqId: string) => {
        try {
            await api.interactions.declineRequest(reqId);
            setRequests(prev => prev.filter(r => r.interactionId !== reqId));
            toast.info("Request declined.");
        } catch (err) {
            toast.error("Failed to decline.");
        }
    };

    const handleProfileSave = (newData: any) => {
        setMyProfile(newData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const [uploadProgress, setUploadProgress] = useState(0);

    const handleStoryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];

        // Frontend Limit Check: Removed to allow backend FIFO (Auto-delete oldest)
        // if (myProfile?.stories?.length >= 5) {
        //    toast.error("Limit reached: You can only have 5 active stories.");
        //    return;
        // }

        try {
            setLoading(true);
            setUploadProgress(1); // Start progress
            const formData = new FormData();
            formData.append('media', file);

            // Use direct XHR for progress since fetch doesn't support it easily
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open('POST', `${process.env.NEXT_PUBLIC_API_URL}/profile/stories`);

                // Add Auth Token
                const token = localStorage.getItem('token');
                if (token) xhr.setRequestHeader('Authorization', `Bearer ${token}`);

                xhr.upload.onprogress = (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = (event.loaded / event.total) * 100;
                        setUploadProgress(percentComplete);
                    }
                };

                xhr.onload = async () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve(xhr.response);
                    } else {
                        reject(new Error(JSON.parse(xhr.response).error || 'Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));
                xhr.send(formData);
            });

            toast.success("Story added! 📸");

            // Reload profile to see new story
            const me = await api.profile.getMe();
            setMyProfile(me);
        } catch (err: any) {
            toast.error(err.message || "Failed to upload story.");
        } finally {
            setLoading(false);
            setUploadProgress(0); // Reset
            // Clear input
            e.target.value = '';
        }
    };

    const handleLogout = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
            window.location.href = '/';
        }
    };

    const navItems = [
        { id: 'matches', label: 'Matches', icon: Heart },
        { id: 'reels', label: 'Vibe Reels', icon: Video },
        { id: 'requests', label: 'Requests', icon: Users, badge: requests.length },
        { id: 'connections', label: 'Chat', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            <Toaster />
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 lg:px-8 py-3 flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <div className="h-9 w-9 bg-gradient-to-tr from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg">
                            <Sparkles size={18} fill="white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-700 to-purple-700 tracking-tight leading-none">LifePartner.AI</h1>
                            <p className="text-[10px] text-gray-500 font-medium tracking-wide">SMART MATCHING</p>
                        </div>
                    </div>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center p-1 bg-gray-100/50 rounded-full border border-gray-200/60 backdrop-blur-sm">
                        {navItems.map((item) => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id as any)}
                                className={`
                                    relative flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 ease-out
                                    ${activeTab === item.id
                                        ? 'bg-white text-indigo-700 shadow-md ring-1 ring-black/5 transform scale-105'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-200/50'
                                    }
                                `}
                            >
                                <item.icon size={16} className={activeTab === item.id ? 'fill-indigo-700/20' : ''} />
                                {item.label}
                                {item.badge ? (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 flex items-center justify-center rounded-full shadow-sm animate-bounce">
                                        {item.badge}
                                    </span>
                                ) : null}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-4">
                        {/* Premium Button */}
                        {myProfile && !myProfile.is_premium ? (
                            <button
                                onClick={() => setShowPremiumModal(true)}
                                className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 px-3 py-1.5 rounded-lg border border-yellow-300 hover:from-amber-300 hover:to-yellow-500 transition-all shadow-sm"
                            >
                                <Crown size={14} fill="currentColor" />
                                <span className="text-xs font-bold">Upgrade</span>
                            </button>
                        ) : myProfile?.is_premium ? (
                            <div className="hidden sm:flex items-center gap-2 bg-black text-amber-400 px-3 py-1.5 rounded-lg border border-gray-800">
                                <Crown size={14} fill="currentColor" />
                                <span className="text-xs font-bold">Premium</span>
                            </div>
                        ) : null}

                        <div className="hidden sm:flex items-center gap-2 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-100">
                            <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-semibold text-indigo-700">Online</span>
                        </div>

                        <div className="hidden sm:block">
                            <NotificationBell />
                        </div>

                        <div className="h-8 w-[1px] bg-gray-200 hidden sm:block"></div>

                        <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600 font-medium transition-colors flex items-center gap-1 group">
                            <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                            <span className="hidden sm:inline">Logout</span>
                        </button>

                        <div onClick={() => setActiveTab('profile')} className="h-10 w-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full p-0.5 cursor-pointer hover:ring-2 hover:ring-indigo-400 transition-all">
                            <img
                                src={myProfile?.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${myProfile?.id || 'me'}`}
                                className="w-full h-full rounded-full object-cover border-2 border-white"
                                alt="Me"
                            />
                        </div>
                    </div>
                </div>

                {/* Mobile Scrollable Nav */}
                <div className="md:hidden overflow-x-auto pb-2 px-4 flex gap-2 no-scrollbar border-t border-gray-100 pt-2 bg-white">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`
                                flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap
                                ${activeTab === item.id
                                    ? 'bg-indigo-600 text-white shadow-md'
                                    : 'bg-gray-50 text-gray-600 border border-gray-200'
                                }
                            `}
                        >
                            <item.icon size={14} />
                            {item.label}
                            {item.badge ? <span className="ml-1 bg-white/20 px-1.5 rounded-full">{item.badge}</span> : null}
                        </button>
                    ))}
                    {/* Fake Nav Item for Premium on Mobile */}
                    {!myProfile?.is_premium ? (
                        <button
                            onClick={() => setShowPremiumModal(true)}
                            className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all whitespace-nowrap bg-gradient-to-r from-amber-200 to-yellow-400 text-yellow-900 border border-yellow-300"
                        >
                            <Crown size={14} fill="currentColor" />
                            Upgrade
                        </button>
                    ) : null}
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {activeTab === 'matches' ? (
                    <div className="animate-in fade-in duration-500">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Daily Recommendations</h2>
                                <p className="text-indigo-600 font-medium mt-1 flex items-center gap-2">
                                    <Sparkles size={14} /> Curated by AI based on your preferences
                                </p>
                            </div>

                            {/* AI Search Bar */}
                            <div className="w-full md:w-1/2 relative group z-10">
                                <form
                                    onSubmit={async (e) => {
                                        e.preventDefault();
                                        const formData = new FormData(e.currentTarget);
                                        const q = formData.get('search') as string;
                                        if (!q) return;

                                        setLoading(true);
                                        try {
                                            const res = await api.matches.search(q);
                                            setMatches(res.matches || []);
                                            toast.success(`Found ${res.matches?.length || 0} matches!`);
                                        } catch (err) {
                                            toast.error("Search failed.");
                                        } finally {
                                            setLoading(false);
                                        }
                                    }}
                                    className="relative transition-transform duration-300 focus-within:-translate-y-1"
                                >
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Sparkles className="text-indigo-500" size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="search"
                                        placeholder="Ask AI: 'Find a doctor who loves travel'..."
                                        className="block w-full pl-12 pr-14 py-4 border-2 border-indigo-50 rounded-2xl leading-5 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 shadow-sm transition-all text-base"
                                    />
                                    <div className="absolute inset-y-0 right-2 flex items-center">
                                        <button type="submit" className="group p-3 bg-gradient-to-tr from-indigo-600 to-purple-600 text-white rounded-xl shadow-lg hover:shadow-indigo-500/40 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center justify-center">
                                            <Sparkles size={18} className="fill-white/20 group-hover:rotate-12 transition-transform duration-500" />
                                        </button>
                                    </div>
                                </form>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-96 bg-gray-100 rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {matches.map((match) => (
                                    <MatchCard
                                        key={match.id}
                                        match={match}
                                        onViewProfile={() => setSelectedProfile(match)}
                                        onStoryClick={() => setViewingStory({ stories: match.stories, initialIndex: 0, user: match })}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'requests' ? (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            Connection Requests <span className="bg-red-100 text-red-600 text-sm px-2 py-0.5 rounded-full">{requests.length}</span>
                        </h2>
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Users size={32} className="text-gray-400" />
                                </div>
                                <p className="text-gray-500 font-medium">No pending requests yet.</p>
                                <button onClick={() => setActiveTab('matches')} className="text-indigo-600 font-bold text-sm mt-3 hover:underline">Browse Matches</button>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {requests.map((req) => (
                                    <div key={req.interactionId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                        <div className="relative mb-4">
                                            <img
                                                src={req.fromUser.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${req.fromUser.id}`}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                alt="User"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded-full border-2 border-white shadow font-bold">New</div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{req.fromUser.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6">{req.fromUser.career?.profession || "Member"} • {req.fromUser.age} Yrs</p>
                                        <div className="flex w-full gap-3">
                                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 h-10 shadow-md font-semibold" onClick={() => handleAccept(req.interactionId)}>Accept</Button>
                                            <Button variant="outline" className="flex-1 h-10 border-gray-200" onClick={() => handleDecline(req.interactionId)}>Decline</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'connections' ? (
                    <div className="animate-in slide-in-from-right-4 duration-300">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Connections</h2>
                        {connections.length === 0 ? (
                            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                                <p className="text-gray-500">No connections yet. Keep matching!</p>
                            </div>
                        ) : (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {connections.map((conn) => (
                                    <div key={conn.interactionId} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                                        <div className="relative mb-4">
                                            <img
                                                src={conn.partner.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${conn.partner.id}`}
                                                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                                                alt="User"
                                            />
                                            <div className="absolute bottom-1 right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-white shadow-sm"></div>
                                        </div>
                                        <h3 className="text-xl font-bold text-gray-900">{conn.partner.name}</h3>
                                        <p className="text-sm text-gray-500 mb-6">{conn.partner.role || "Member"} • {conn.partner.location || "India"}</p>
                                        <div className="flex w-full gap-3">
                                            <Button className="flex-1 bg-indigo-600 hover:bg-indigo-700 shadow-md font-semibold h-11" onClick={() => setActiveChat(conn)}>
                                                <MessageCircle size={18} className="mr-2" /> Chat
                                            </Button>
                                            <Button variant="outline" className="w-12 px-0 border-gray-200" onClick={() => { setActiveChat(conn); setIsVideoCall(true); }}>
                                                <Video size={20} className="text-gray-600" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : activeTab === 'reels' ? (
                    <div className="animate-in slide-in-from-bottom-4 duration-500">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl font-extrabold text-gray-900">Discover Vibes 📹</h2>
                            <p className="text-gray-500 mt-2 text-lg">Watch short intro reels to find your perfect vibe match</p>
                        </div>
                        <ReelFeed />
                    </div>
                ) : (
                    /* My Profile Tab */
                    <div className="max-w-4xl mx-auto animate-in fade-in duration-300">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-900">My Profile</h2>
                                <p className="text-gray-500">Manage your bio, photos, and preferences</p>
                            </div>
                        </div>
                        <div className="flex gap-3 w-full md:w-auto">
                            <Button
                                onClick={async () => {
                                    try {
                                        await api.wallet.boostProfile();
                                        toast.success("Profile Boosted! 🚀 30 mins of fame!");
                                        // Refresh profile
                                        const me = await api.profile.getMe();
                                        setMyProfile(me);
                                    } catch (e: any) {
                                        toast.error(e.message || "Boost failed (Cost: 50 coins)");
                                    }
                                }}
                                className={`shadow-md flex-1 md:flex-none ${myProfile?.is_boosted ? 'bg-amber-400 hover:bg-amber-500 text-black' : 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600'}`}
                                disabled={myProfile?.is_boosted}
                            >
                                <Sparkles size={16} className="mr-2" />
                                {myProfile?.is_boosted ? 'Boost Active' : 'Boost (50 🪙)'}
                            </Button>
                            <Button onClick={() => setIsEditing(true)} variant="outline" className="shadow-sm flex-1 md:flex-none border-gray-300">Edit Profile</Button>
                        </div>


                        {myProfile && (
                            <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 border border-gray-200">
                                {/* Profile Header Section */}
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-10 border-b border-gray-100 pb-8 mb-8">
                                    {/* Avatar Column */}
                                    <div className="flex-shrink-0 relative cursor-pointer group" onClick={() => myProfile.stories?.length > 0 && setViewingStory(true)}>
                                        <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full p-[4px] box-content ${myProfile.stories?.length > 0 ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600 animate-spin-slow' : 'border-4 border-white shadow-lg'}`}>
                                            <div className="w-full h-full rounded-full overflow-hidden border-4 border-white bg-white relative">
                                                {/* Progress Overlay */}
                                                {uploadProgress > 0 && (
                                                    <div className="absolute inset-0 bg-black/50 z-20 flex items-center justify-center">
                                                        <div className="text-white text-xs font-bold">{Math.round(uploadProgress)}%</div>
                                                        <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 100 100">
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="10" />
                                                            <circle cx="50" cy="50" r="45" fill="none" stroke="#4F46E5" strokeWidth="10" strokeDasharray="283" strokeDashoffset={283 - (283 * uploadProgress) / 100} className="transition-all duration-300" />
                                                        </svg>
                                                    </div>
                                                )}
                                                {myProfile.photoUrl ? (
                                                    <img src={myProfile.photoUrl} alt="Me" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-indigo-50 flex items-center justify-center text-indigo-300">
                                                        <User size={48} />
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Upload Button */}
                                        <label className="absolute bottom-1 right-1 bg-indigo-600 text-white p-2.5 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-all hover:scale-110 z-10"
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            <div className="relative">
                                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                    <line x1="12" y1="5" x2="12" y2="19"></line>
                                                    <line x1="5" y1="12" x2="19" y2="12"></line>
                                                </svg>
                                            </div>
                                            <input
                                                type="file"
                                                className="hidden"
                                                accept="image/*,video/*"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    if (!myProfile.is_premium) {
                                                        e.preventDefault();
                                                        setShowPremiumModal(true);
                                                    }
                                                }}
                                                onChange={async (e) => {
                                                    if (!myProfile.is_premium) {
                                                        setShowPremiumModal(true);
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    await handleStoryUpload(e);
                                                }}
                                            />
                                        </label>
                                    </div>

                                    {/* Details Column */}
                                    <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left space-y-3 w-full">
                                        <div className="space-y-1">
                                            <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
                                                {myProfile.name || "Add Name"}
                                                {myProfile.is_premium && (
                                                    <span className="bg-gradient-to-r from-amber-300 to-yellow-500 text-black text-[12px] px-3 py-1 rounded-full uppercase tracking-wider shadow-sm border border-yellow-400 font-extrabold flex items-center gap-1 align-middle">
                                                        Premium 👑
                                                    </span>
                                                )}
                                            </h3>
                                            <p className="text-lg text-gray-500 font-medium">
                                                {myProfile.location?.city || (typeof myProfile.location === 'string' ? myProfile.location : "Add Location")}
                                            </p>
                                        </div>

                                        <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                                            <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                {myProfile.career?.profession || "Add Profession"}
                                            </div>
                                            {myProfile.age && (
                                                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-50 text-purple-700 border border-purple-100">
                                                    {myProfile.age} Years Old
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-2 w-full md:w-auto">
                                            <Button variant="outline" onClick={() => setSelectedProfile(myProfile)} className="w-full md:w-auto border-gray-300 hover:bg-gray-50">
                                                Preview Public View
                                            </Button>
                                        </div>
                                    </div>
                                </div>

                                {/* Rest of the profile content (Stats, Gallery, Reels, Details) remains similar but wrapped properly */}
                                <div className="space-y-8">
                                    {/* Connection Stats */}
                                    <div className="flex items-center justify-between bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100/50">
                                        <div className="flex items-center gap-4">
                                            <div className="bg-white p-3 rounded-full shadow-sm text-indigo-600">
                                                <Users size={24} />
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 text-lg">{connections.length} Connections</h4>
                                                <p className="text-sm text-gray-600">People you have matched with</p>
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            onClick={() => setShowConnectionsModal(true)}
                                            className="bg-white shadow-sm hover:bg-gray-50 text-indigo-700 font-semibold"
                                        >
                                            Manage
                                        </Button>
                                    </div>

                                    {/* Photos & Reels Sections (Preserving Logic) */}
                                    {myProfile.photos?.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg"><Sparkles size={18} className="text-indigo-500" /> My Photos</h4>
                                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                                {myProfile.photos.map((photo: string, idx: number) => (
                                                    <img
                                                        key={idx}
                                                        src={photo}
                                                        alt={`Gallery ${idx}`}
                                                        className="w-32 h-32 md:w-40 md:h-40 object-cover rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:scale-105 transition-transform"
                                                        onClick={() => setViewingPhoto(photo)}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {myProfile.reels?.length > 0 && (
                                        <div>
                                            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2 text-lg"><Video size={18} className="text-pink-500" /> My Vibe Reels</h4>
                                            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                                                {myProfile.reels.map((url: string, idx: number) => (
                                                    <div key={idx} className="relative group flex-shrink-0 cursor-pointer" onClick={() => setViewingReel(url)}>
                                                        <video
                                                            src={url.startsWith('http') ? url : `http://localhost:4000${url}`}
                                                            className="w-28 h-48 md:w-36 md:h-60 object-cover rounded-xl border-2 border-indigo-100 shadow-md bg-black hover:opacity-90 transition-opacity"
                                                            muted
                                                            onMouseOver={e => e.currentTarget.play()}
                                                            onMouseOut={e => { e.currentTarget.pause(); e.currentTarget.currentTime = 0; }}
                                                        />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-xl">
                                                            <div className="bg-white/20 backdrop-blur-md p-2 rounded-full">
                                                                <Video size={20} className="text-white" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Details Grid */}
                                    <div className="grid md:grid-cols-2 gap-6 bg-gray-50/50 rounded-2xl p-6 border border-gray-100">
                                        <div className="space-y-4">
                                            <h4 className="font-bold text-gray-900 border-b border-gray-200 pb-2">Personal Details</h4>
                                            <div className="space-y-3">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Height</span>
                                                    <span className="font-medium text-gray-900">{myProfile.height}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Religion</span>
                                                    <span className="font-medium text-gray-900">{myProfile.religion?.faith || '-'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Marital Status</span>
                                                    <span className="font-medium text-gray-900">{myProfile.maritalStatus || 'Never Married'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Father's Job</span>
                                                    <span className="font-medium text-gray-900">{myProfile.family?.fatherOccupation || '-'}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-gray-500">Mother Tongue</span>
                                                    <span className="font-medium text-gray-900">{myProfile.motherTongue || '-'}</span>
                                                </div>
                                                <div className="flex justify-between mt-6 pt-6 border-t border-gray-100">
                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Joined</div>
                                                        <div className="font-medium">{new Date(myProfile.created_at).toLocaleDateString()}</div>
                                                    </div>
                                                    <div className="text-center">
                                                        <div className="text-xs text-gray-500 uppercase tracking-wider font-semibold">Status</div>
                                                        <div className="font-medium text-green-600">Active</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {isEditing && (
                                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
                                        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
                                            <ProfileEditor initialData={myProfile} onSave={handleProfileSave} onCancel={() => setIsEditing(false)} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </main>

            {/* Story Viewer */}
                {viewingStory && myProfile?.stories?.length > 0 && (
                    <StoryModal
                        stories={myProfile.stories}
                        initialIndex={0}
                        user={myProfile}
                        currentUser={myProfile}
                        onClose={() => setViewingStory(false)}
                        onDelete={async (storyId: string) => {
                            try {
                                await api.interactions.deleteStory(storyId);
                                setMyProfile((prev: any) => ({
                                    ...prev,
                                    stories: prev.stories.filter((s: any) => s.id !== storyId)
                                }));
                                if (myProfile.stories.length <= 1) setViewingStory(false);
                            } catch (e) {
                                console.error(e);
                            }
                        }}
                    />
                )}

                {/* Global Modals */}
                {selectedProfile && (
                    <ProfileModal
                        profile={selectedProfile}
                        currentUser={myProfile}
                        onClose={() => setSelectedProfile(null)}
                        onConnect={() => {
                            api.interactions.sendInterest(selectedProfile.id);
                            setSelectedProfile(null);
                            toast.success(`Interest sent to ${selectedProfile.name}!`);
                        }}
                        onUpgrade={() => {
                            setSelectedProfile(null);
                            setShowPremiumModal(true);
                        }}
                    />
                )}

                <PremiumModal
                    isOpen={showPremiumModal}
                    onClose={() => setShowPremiumModal(false)}
                    user={myProfile}
                    onSuccess={() => {
                        toast.success("Welcome to Premium! 👑");
                        loadData();
                    }}
                />

                {/* Full Screen Reel Player Modal */}
                {viewingReel && (
                    <div
                        className="fixed inset-0 z-[60] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
                        onClick={() => setViewingReel(null)}
                    >
                        <div className="relative w-full max-w-[450px] h-[calc(100vh-80px)] max-h-[800px] bg-black rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                {/* Reel Action Buttons */}
                                {myProfile?.reels?.includes(viewingReel) && (
                                    <button
                                        className="bg-red-600/80 text-white p-2 rounded-full hover:bg-red-700 transition-colors shadow-lg"
                                        onClick={async (e) => {
                                            e.stopPropagation();
                                            if (confirm("Delete this reel?")) {
                                                try {
                                                    await api.profile.deleteReel(viewingReel);
                                                    toast.success("Reel deleted");
                                                    setViewingReel(null);
                                                    const u = await api.profile.getMe();
                                                    setMyProfile(u);
                                                } catch (err) {
                                                    toast.error("Failed to delete reel");
                                                }
                                            }
                                        }}
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                )}
                                <button
                                    className="bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                    onClick={() => setViewingReel(null)}
                                >
                                    <X size={24} />
                                </button>
                            </div>
                            <video
                                src={viewingReel.startsWith('http') ? viewingReel : `http://localhost:4000${viewingReel}`}
                                className="w-full h-full object-contain"
                                controls
                                autoPlay
                            />
                        </div>
                    </div>
                )}

                {/* Chat & Video Modals */}
                {activeChat && !isVideoCall && (
                    <ChatWindow
                        connectionId={activeChat.interactionId}
                        partner={activeChat.partner}
                        onClose={() => setActiveChat(null)}
                        onVideoCall={() => setIsVideoCall(true)}
                    />
                )}


                {activeChat && isVideoCall && (
                    <VideoCallModal
                        connectionId={activeChat.interactionId}
                        partner={activeChat.partner}
                        onEndCall={() => setIsVideoCall(false)}
                    />
                )}

                {/* Photo Viewer */}
                toast.error("Failed to remove connection.");
                    }
                }
            }}
        />
                )
}
        </div >
    );
}

// Sub-component for Story Viewer
const StoryModal = ({ stories, initialIndex, user, onClose, currentUser, onDelete }: any) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [progress, setProgress] = useState(0);
    const story = stories[currentIndex];

    // Auto-advance Timer
    useEffect(() => {
        const timer = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) return 100;
                return prev + 1;
            });
        }, 40); // Slightly faster for smoother feel

        return () => clearInterval(timer);
    }, [currentIndex]); // Restart timer on index change

    // Handle Story Completion
    useEffect(() => {
        if (progress >= 100) {
            if (currentIndex < stories.length - 1) {
                setCurrentIndex((prev: number) => prev + 1);
                setProgress(0); // Reset progress immediately for next story
            } else {
                onClose();
            }
        }
    }, [progress, currentIndex, stories.length, onClose]);

    if (!story) return null;

    return (
        <div className="fixed inset-0 z-[80] bg-black flex flex-col items-center justify-center animate-in fade-in duration-300">
            {/* Header */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-20 text-white">
                <div className="flex items-center gap-3">
                    <img src={user.photoUrl || user.avatar_url} className="w-10 h-10 rounded-full border border-white/50" alt="" />
                    <span className="font-bold">{user.name || user.full_name}</span>
                    <span className="text-sm opacity-70">• {new Date(story.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex gap-4">
                    {user.id === currentUser?.id && (
                        <button onClick={() => onDelete(story.id)} className="p-2 hover:bg-white/20 rounded-full"><Trash2 size={20} /></button>
                    )}
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
            </div>

            {/* Progress Bars */}
            <div className="absolute top-2 left-2 right-2 flex gap-1 z-20">
                {stories.map((s: any, idx: number) => (
                    <div key={s.id} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                        <div
                            className={`h-full bg-white transition-all linear duration-75`}
                            style={{
                                width: idx === currentIndex ? `${progress}%` : idx < currentIndex ? '100%' : '0%'
                            }}
                        />
                    </div>
                ))}
            </div>

            {/* Content */}
            <div className="relative w-full h-full max-w-lg bg-black flex items-center justify-center">
                {story.type === 'video' ? (
                    <video
                        src={story.url}
                        className="w-full h-full object-contain"
                        autoPlay
                        muted={false} // Allow sound?
                    />
                ) : (
                    <img src={story.url} className="w-full h-full object-contain" alt="" />
                )}

                {/* Navigation Tap Zones */}
                <div className="absolute inset-y-0 left-0 w-1/3 z-10" onClick={() => currentIndex > 0 && setCurrentIndex((p: number) => p - 1)}></div>
                <div className="absolute inset-y-0 right-0 w-1/3 z-10" onClick={() => currentIndex < stories.length - 1 ? setCurrentIndex((p: number) => p + 1) : onClose()}></div>
            </div>
        </div>
    );
};

interface ConnectionsModalProps {
    connections: any[];
    onClose: () => void;
    onDelete: (id: string) => void;
    onChat: (conn: any) => void;
}

// Connections Management Modal
const ConnectionsModal = ({ connections, onClose, onDelete, onChat }: ConnectionsModalProps) => {
    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl flex flex-col max-h-[80vh]">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center">
                    <h3 className="font-bold text-lg text-gray-900">Manage Connections</h3>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="overflow-y-auto p-4 space-y-3 flex-1">
                    {connections.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">No connections yet.</div>
                    ) : (
                        connections.map((c: any) => (
                            <div key={c.interactionId} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <img src={c.partner.photoUrl} className="w-12 h-12 rounded-full object-cover border border-white shadow-sm" alt="" />
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-sm">{c.partner.name}</h4>
                                        <p className="text-xs text-gray-500">{c.partner.role || 'Member'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-indigo-600 hover:bg-indigo-50" onClick={() => onChat(c)}>
                                        <MessageCircle size={16} />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-600"
                                        onClick={() => onDelete(c.interactionId)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="p-4 border-t border-gray-100 bg-gray-50 rounded-b-2xl">
                    <Button className="w-full" onClick={onClose}>Done</Button>
                </div>
            </div>
        </div>
    );
};
