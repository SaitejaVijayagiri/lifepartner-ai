'use client';
import { useToast } from '@/components/ui/Toast';

import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/api';
import { Heart, MessageCircle, Send, Share2, Volume2, VolumeX, Gift } from 'lucide-react';
import axios from 'axios';
import AdCard, { AdItem } from './AdCard';
import GoogleAdCard from './GoogleAdCard';
import GiftModal from './GiftModal';

// API Configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface Reel {
    id: string;
    url: string;
    caption?: string;
    user: {
        id: string;
        name: string;
        photoUrl: string;
        age?: number;
        location?: { city: string };
        career?: { profession: string };
    };
    isMe: boolean;
    likes: number;
    isLiked: boolean; // Computed by backend for current user
    commentCount: number;
    comments?: { id: string; user: string; text: string; userAvatar?: string }[]; // Lazy loaded
}

type FeedItem = Reel | AdItem;

export default function ReelFeed() { // Removed 'users' prop as we fetch feed directly
    const toast = useToast();
    const [reels, setReels] = useState<FeedItem[]>([]);
    const [activeIndex, setActiveIndex] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showComments, setShowComments] = useState<number | null>(null); // Index
    const [commentText, setCommentText] = useState('');
    const [isMuted, setIsMuted] = useState(false);
    const [giftModal, setGiftModal] = useState<{ isOpen: boolean; userId: string; userName: string } | null>(null);

    // Fetch Feed on Mount
    useEffect(() => {
        loadFeed();
    }, []);

    const loadFeed = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_URL}/reels/feed`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const rawReels: Reel[] = res.data;
            const mixedFeed: FeedItem[] = [];

            rawReels.forEach((reel, index) => {
                mixedFeed.push(reel);
                // Inject Ad every 5 reels
                if (index > 0 && index % 5 === 0) {
                    mixedFeed.push({
                        id: `ad-google-${index}`,
                        type: 'google_ad', // New type
                        title: "Sponsored",
                        description: "",
                        advertiserName: "Google",
                        advertiserAvatar: "",
                        contentUrl: "",
                        ctaLink: "",
                        ctaText: ""
                    } as any); // Cast as any or extend Type if strict
                }
            });

            setReels(mixedFeed);
        } catch (e) {
            console.error("Failed to load reels", e);
        }
    };

    const handleScroll = () => {
        if (scrollRef.current) {
            const index = Math.round(scrollRef.current.scrollTop / scrollRef.current.clientHeight);
            setActiveIndex(index);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validation
        if (!['video/mp4', 'video/quicktime', 'video/webm'].includes(file.type)) {
            toast.error('Invalid file format. MP4, MOV, WEBM only.');
            return;
        }
        if (file.size > 100 * 1024 * 1024) {
            toast.error('File too large (Max 100MB)');
            return;
        }

        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('video', file);
            const token = localStorage.getItem('token');

            await axios.post(`${API_URL}/reels/upload`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            toast.success('Reel uploaded! 🚀');
            loadFeed(); // Refresh feed
        } catch (err: any) {
            toast.error(`Upload failed: ${err.response?.data?.error || err.message}`);
        } finally {
            setIsUploading(false);
            e.target.value = '';
        }
    };

    const handleLike = async (idx: number, reelId: string) => {
        // Optimistic UI Update
        setReels(prev => prev.map((r, i) => {
            if (i === idx) {
                if ('type' in r && r.type === 'ad') return r; // Skip Ad
                const reel = r as Reel;
                return {
                    ...reel,
                    isLiked: !reel.isLiked,
                    likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
                };
            }
            return r;
        }));

        // API Call
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${API_URL}/reels/${reelId}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (e) {
            console.error("Like failed", e);
        }
    };

    const toggleComments = async (idx: number, reelId: string) => {
        if ('type' in reels[idx] && (reels[idx] as any).type === 'ad') return;

        if (showComments === idx) {
            setShowComments(null);
        } else {
            setShowComments(idx);
            // Lazy load comments if not present
            const currentReel = reels[idx] as Reel;
            if (!currentReel.comments) {
                try {
                    const token = localStorage.getItem('token');
                    const res = await axios.get(`${API_URL}/reels/${reelId}/comments`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    setReels(prev => prev.map((r, i) => i === idx ? { ...r, comments: res.data } : r));
                } catch (e) { console.error(e); }
            }
        }
    };

    const handleComment = async (idx: number, reelId: string) => {
        if (!commentText.trim()) return;

        const text = commentText;
        setCommentText('');

        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_URL}/reels/${reelId}/comment`, { text }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            const newComment = {
                id: res.data.id,
                text: res.data.text,
                user: 'You',
                userAvatar: ''
            };

            setReels(prev => prev.map((r, i) => {
                if (i === idx) {
                    if ('type' in r && r.type === 'ad') return r;
                    const reel = r as Reel;
                    return {
                        ...reel,
                        comments: [newComment, ...(reel.comments || [])],
                        commentCount: reel.commentCount + 1
                    };
                }
                return r;
            }));

        } catch (e) {
            toast.error("Failed to post comment");
        }
    };

    if (reels.length === 0) {
        return (
            <div className="h-[600px] flex flex-col items-center justify-center bg-gray-900 rounded-xl text-white relative overflow-hidden">
                {isUploading ? (
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                ) : (
                    <>
                        <p className="text-xl font-bold">No Reels Yet</p>
                        <p className="text-gray-400 mb-4">Be the first to post a vibe!</p>
                        <label className="cursor-pointer bg-gradient-to-r from-pink-500 to-red-500 px-6 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2">
                            <span>📹 Post First Reel</span>
                            <input type="file" className="hidden" onChange={handleUpload} />
                        </label>
                    </>
                )}
            </div>
        );
    }

    return (
        <div className="relative h-[calc(100vh-120px)] max-h-[800px] bg-black rounded-2xl overflow-hidden w-full max-w-[450px] mx-auto shadow-2xl">
            {/* Feed */}
            <div
                ref={scrollRef}
                className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
                onScroll={handleScroll}
            >
                {reels.map((item, idx) => {
                    // Logic for Google Ads
                    if ('type' in item && (item as any).type === 'google_ad') {
                        return <GoogleAdCard key={item.id} isActive={idx === activeIndex} />;
                    }

                    if ('type' in item && item.type === 'ad') {
                        return <AdCard key={item.id} ad={item} isActive={idx === activeIndex} />;
                    }

                    const reel = item as Reel; // Type Assertion for clarity
                    return (
                        <div key={reel.id} className="h-full w-full snap-start relative bg-gray-900">
                            <video
                                src={reel.url} // Supabase URLs are absolute
                                className="w-full h-full object-cover"
                                loop
                                muted={isMuted}
                                autoPlay={idx === activeIndex}
                                playsInline
                                onClick={() => setIsMuted(!isMuted)} // Tap to mute/unmute
                            />

                            {/* Upload Button */}
                            <div className="absolute top-4 left-4 z-20">
                                <label className="cursor-pointer">
                                    <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white text-2xl border border-white/30">
                                        +
                                    </div>
                                    <input type="file" className="hidden" onChange={handleUpload} />
                                </label>
                            </div>

                            {/* Mute Button */}
                            <button
                                onClick={() => setIsMuted(!isMuted)}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center text-white"
                            >
                                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
                            </button>

                            {/* Actions (Right) */}
                            <div className="absolute right-3 bottom-24 flex flex-col gap-6 z-10 items-center">
                                <button onClick={() => handleLike(idx, reel.id)} className="flex flex-col items-center gap-1">
                                    <div className={`p-3 rounded-full backdrop-blur-md transition-all ${reel.isLiked ? 'bg-red-500/80' : 'bg-black/40'}`}>
                                        <Heart size={24} className={reel.isLiked ? 'fill-white text-white' : 'text-white'} />
                                    </div>
                                    <span className="text-white text-xs font-bold drop-shadow-md">{reel.likes}</span>
                                </button>

                                <button onClick={() => toggleComments(idx, reel.id)} className="flex flex-col items-center gap-1">
                                    <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                                        <MessageCircle size={24} className="text-white" />
                                    </div>
                                    <span className="text-white text-xs font-bold drop-shadow-md">{reel.commentCount}</span>
                                </button>

                                <button onClick={() => setGiftModal({ isOpen: true, userId: reel.user.id, userName: reel.user.name })} className="flex flex-col items-center gap-1">
                                    <div className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                                        <Gift size={24} className="text-pink-500" />
                                    </div>
                                    <span className="text-white text-xs font-bold drop-shadow-md">Gift</span>
                                </button>

                                <button className="p-3 rounded-full bg-black/40 backdrop-blur-md">
                                    <Share2 size={24} className="text-white" />
                                </button>
                            </div>

                            {/* Info Overlay */}
                            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent p-5 pb-8 pointer-events-none">
                                <div className="flex items-center gap-3 mb-3 pointer-events-auto">
                                    <img src={reel.user.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reel.user.id}`} className="w-10 h-10 rounded-full border border-white/50" />
                                    <div>
                                        <h3 className="font-bold text-white text-sm flex items-center gap-2">
                                            {reel.user.name}
                                            {reel.isMe && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px]">YOU</span>}
                                        </h3>
                                        <p className="text-xs text-gray-300">{reel.user.location?.city || "India"}</p>
                                    </div>
                                    {!reel.isMe && (
                                        <button className="ml-auto bg-indigo-600 text-white text-xs font-bold px-4 py-1.5 rounded-full hover:bg-indigo-700 pointer-events-auto">
                                            Follow
                                        </button>
                                    )}
                                </div>
                                {reel.caption && <p className="text-white text-sm mb-2 line-clamp-2">{reel.caption}</p>}
                            </div>

                            {/* Comments Modal (Integrated) */}
                            {showComments === idx && (
                                <div className="absolute inset-x-0 bottom-0 h-[60%] bg-black/95 z-30 rounded-t-2xl flex flex-col animate-in slide-in-from-bottom duration-300">
                                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                                        <h3 className="text-white font-bold">Comments ({reel.commentCount})</h3>
                                        <button onClick={() => setShowComments(null)} className="text-gray-400 hover:text-white text-2xl">&times;</button>
                                    </div>

                                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                        {reel.comments?.map((c, cIdx) => (
                                            <div key={cIdx} className="flex gap-3">
                                                <div className="w-8 h-8 rounded-full bg-indigo-500/50 flex items-center justify-center text-white text-xs font-bold shrink-0">
                                                    {c.user[0]}
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs font-bold mb-0.5">{c.user}</p>
                                                    <p className="text-white text-sm">{c.text}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {(!reel.comments || reel.comments.length === 0) && (
                                            <p className="text-center text-gray-500 text-sm mt-10">No comments yet. Start the conversation!</p>
                                        )}
                                    </div>

                                    <div className="p-3 border-t border-white/10 flex gap-2">
                                        <input
                                            type="text"
                                            className="flex-1 bg-gray-800 text-white text-sm rounded-full px-4 py-2 outline-none focus:ring-1 focus:ring-indigo-500"
                                            placeholder="Add a comment..."
                                            value={commentText}
                                            onChange={(e) => setCommentText(e.target.value)}
                                            onKeyPress={(e) => e.key === 'Enter' && handleComment(idx, reel.id)}
                                        />
                                        <button onClick={() => handleComment(idx, reel.id)} className="p-2 bg-indigo-600 rounded-full text-white">
                                            <Send size={16} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {isUploading && (
                <div className="absolute inset-0 bg-black/80 z-50 flex flex-col items-center justify-center text-white">
                    <div className="animate-spin text-4xl mb-4">⏳</div>
                    <p className="font-bold">Uploading Reel...</p>
                </div>
            )}

            {giftModal && (
                <GiftModal
                    isOpen={giftModal.isOpen}
                    onClose={() => setGiftModal(null)}
                    toUserId={giftModal.userId}
                    toUserName={giftModal.userName}
                />
            )}

            <style jsx global>{`
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
