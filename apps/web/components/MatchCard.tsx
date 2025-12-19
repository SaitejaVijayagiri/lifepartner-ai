'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import KundliModal from './KundliModal';

interface MatchCardProps {
    match: any;
    onConnect?: () => void;
    onViewProfile?: () => void;
    onStoryClick?: () => void;
    currentUserName?: string; // For Kundli
}


export default function MatchCard({ match, onConnect, onViewProfile, onStoryClick }: MatchCardProps) {
    // Independent States
    const [matchStatus, setMatchStatus] = useState<string | null>(match.match_status || null);
    const [isLiked, setIsLiked] = useState<boolean>(match.is_liked || false);
    const [isPlaying, setIsPlaying] = useState(false); // Audio State
    const [showKundli, setShowKundli] = useState(false); // Modal State

    // Counts
    const [likeCount, setLikeCount] = useState(match.total_likes || 0);

    const [loading, setLoading] = useState(false);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

    // Photos Array (Fallback to single photo)
    const photos = match.photos && match.photos.length > 0 ? match.photos : [match.photoUrl];

    const [isHovered, setIsHovered] = useState(false);

    // Auto-Slide Effect (3s interval, pause on hover)
    useEffect(() => {
        if (photos.length <= 1 || isHovered) return;

        const interval = setInterval(() => {
            setCurrentPhotoIndex((prev: number) => (prev + 1) % photos.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [photos.length, isHovered]);

    // 1. Handle "Send Interest" (Primary Action)
    // Connecting does NOT toggle Like anymore.
    const handleConnect = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (loading || matchStatus === 'pending') return;

        setLoading(true);
        const prevStatus = matchStatus;

        // Optimistic: Update Status Only
        setMatchStatus('pending');

        try {
            await api.interactions.sendInterest(match.id);
            if (onConnect) onConnect();
        } catch (err) {
            setMatchStatus(prevStatus);
            alert("Connection failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // 2. Handle "Like/Shortlist" (Secondary Action)
    // Liking does NOT affect connection status. purely Instagram style.
    const handleLike = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        e.nativeEvent.stopImmediatePropagation();

        if (loading) return;

        // Optimistic Toggle
        const newIsLiked = !isLiked;
        setIsLiked(newIsLiked);
        setLikeCount((prev: number) => newIsLiked ? prev + 1 : prev - 1);

        try {
            if (newIsLiked) {
                await api.interactions.sendLike(match.id);
            } else {
                await api.interactions.revokeLike(match.id);
            }
        } catch (err) {
            // Revert
            setIsLiked(!newIsLiked);
            setLikeCount((prev: number) => !newIsLiked ? prev + 1 : prev - 1);
        }
    };

    const isRequestSent = matchStatus === 'pending';
    // hasLiked is strict now.
    const hasLiked = isLiked;

    return (
        <div
            className="group relative h-[420px] w-full rounded-3xl overflow-hidden cursor-pointer shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onViewProfile}
        >
            {/* Background Image (Immersive) */}
            <div className="absolute inset-0">
                <img
                    src={match.photos?.[currentPhotoIndex] || match.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${match.id}`}
                    alt={match.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Photo Progress Bar (Card Style) */}
                {photos.length > 1 && (
                    <div className="absolute top-2 left-2 right-2 flex gap-1 z-30 transition-opacity">
                        {photos.map((_url: string, idx: number) => (
                            <div key={idx} className="h-0.5 flex-1 bg-white/30 rounded-full overflow-hidden">
                                <div
                                    className={`h-full bg-white transition-all duration-300 ${idx === currentPhotoIndex ? 'w-full' : idx < currentPhotoIndex ? 'w-full' : 'w-0'}`}
                                />
                            </div>
                        ))}
                    </div>
                )}

                {/* Gradient Overlays */}
                <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/20 to-black/90 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/40 to-transparent opacity-60 pointer-events-none" />
            </div>

            {/* Glowing Match Score (Floating Top Right) - High Contrast Fix */}
            {/* Top Right Badges - Z-Index Lowered */}
            <div className="absolute top-4 right-4 flex flex-col items-end gap-2 z-20">
                {/* Match Score */}
                <div className="relative flex items-center justify-center w-14 h-14 rounded-full bg-black/60 backdrop-blur-md border border-white/10 shadow-xl">
                    <div className="absolute inset-0 rounded-full border-t-2 border-emerald-500 opacity-100 rotate-45"></div>
                    <div className="text-center">
                        <span className="block text-sm font-black text-emerald-400 leading-none drop-shadow-md">{match.score}%</span>
                        <span className="block text-[8px] font-bold text-emerald-200 tracking-wide uppercase">Match</span>
                    </div>
                </div>
            </div>

            {/* Stories Badge (If active) */}
            {match.stories && match.stories.length > 0 && (
                <div className="absolute top-4 left-4 max-w-[70%] z-20" onClick={(e) => { e.stopPropagation(); if (onStoryClick) onStoryClick(); }}>
                    <div className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg border-2 border-white/20 animate-pulse">
                        <span>📸 New Story</span>
                    </div>
                </div>
            )}

            {/* AI Reason Badge (Floating Top Left - Shifted down if story exists) - Z-Index Lowered */}
            {match.match_reasons?.[0] && (
                <div className={`absolute left-4 max-w-[70%] z-20 transition-all duration-300 ${match.stories && match.stories.length > 0 ? 'top-14' : 'top-4'}`}>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 backdrop-blur-md border border-indigo-400/30 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg animate-in slide-in-from-left-4 duration-500 hover:scale-105 transition-transform">
                        <span>✨ {match.match_reasons[0]}</span>
                    </div>
                </div>
            )}

            {/* Voice Bio Badge (Floating Left - Under Reason) */}
            {match.voiceBioUrl && (
                <div className={`absolute left-4 z-20 transition-all duration-300 ${match.match_reasons?.[0] ? (match.stories?.length > 0 ? 'top-24' : 'top-14') : (match.stories?.length > 0 ? 'top-14' : 'top-4')}`}>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            const audio = new Audio(match.voiceBioUrl);
                            if (isPlaying) {
                                // Stop Logic hard to target instance without ref, simplest is to just play new
                                // For now simple toggle not fully robust for multiple cards playing, but ok for MVP
                                setIsPlaying(false);
                            } else {
                                audio.play();
                                setIsPlaying(true);
                                audio.onended = () => setIsPlaying(false);
                            }
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-wide shadow-lg hover:bg-white/30 transition-all"
                    >
                        <span>{isPlaying ? '🔊 Playing...' : '🎙️ Voice Bio'}</span>
                    </button>
                </div>
            )}

            {/* Bottom Info Section - Simple Original Specs */}
            <div className="absolute bottom-0 inset-x-0 p-5 z-20 flex flex-col justify-end h-full pointer-events-none">
                {/* Kundli Badge (Floating above name) */}
                {match.kundli && (
                    <div className="pointer-events-auto self-start mb-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowKundli(true); }}
                            className={`flex items-center gap-1.5 px-3 py-1 rounded-full backdrop-blur-md border shadow-lg transition-transform hover:scale-105 active:scale-95 ${match.kundli.score >= 18 ? 'bg-orange-500/80 border-orange-300/50 text-white' : 'bg-red-500/80 border-red-300/50 text-white'}`}
                        >
                            <span className="text-xs">🕉️</span>
                            <span className="text-xs font-bold">{match.kundli.score}/36 Guna</span>
                        </button>
                    </div>
                )}

                <div className="transform transition-transform duration-300 group-hover:-translate-y-16">
                    <div className="flex items-end gap-2 mb-1">
                        <h3 className="text-2xl font-bold text-white tracking-tight drop-shadow-lg filter">{match.name}, {match.age}</h3>
                        {match.isVerified && <span className="text-blue-400 text-lg mb-1 drop-shadow-md" title="Verified">✓</span>}
                        {/* Online Indicator */}
                        <div className={`flex items-center gap-1 px-2 py-0.5 rounded-full backdrop-blur-md border ${match.isOnline ? 'bg-green-500/20 border-green-400/30' : 'bg-gray-500/20 border-gray-400/30'} mb-1.5`}>
                            <div className={`w-2 h-2 rounded-full ${match.isOnline ? 'bg-green-400 animate-pulse shadow-[0_0_8px_rgba(74,222,128,0.8)]' : 'bg-gray-400'}`}></div>
                            <span className={`text-[10px] font-bold uppercase tracking-wider ${match.isOnline ? 'text-green-200' : 'text-gray-300'}`}>
                                {match.isOnline ? 'Active' : 'Offline'}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2 text-gray-100 text-xs font-medium mb-3 opacity-95">
                        <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">📏 {match.height || "N/A"}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">💼 {match.role || "Professional"}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">🕉️ {match.religion || "Hindu"}</span>
                        <span className="px-2.5 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10">📍 {match.location?.city || "India"}</span>
                    </div>

                    <p className="text-sm text-gray-300 line-clamp-2 leading-relaxed opacity-90">{match.summary}</p>
                </div>
            </div>

            {/* Hidden ACTION Buttons (Appears on Hover) - RESTORED */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-2 translate-y-20 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out pointer-events-auto z-30">
                {/* 1. Send Interest Button (Primary Action) */}
                <Button
                    onClick={handleConnect}
                    disabled={loading || isRequestSent}
                    className={`flex-1 h-12 font-bold uppercase tracking-wider text-xs border-0 shadow-2xl transition-transform active:scale-95 ${isRequestSent
                        ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                        : 'bg-indigo-600 text-white hover:bg-indigo-700'
                        }`}
                    style={{ opacity: 1 }}
                >
                    {loading ? 'Sending...' : (isRequestSent ? '✓ Request Sent' : '✨ Send Interest')}
                </Button>

                {/* 2. Like/Heart Button (Social Proof Action) */}
                <button
                    onClick={handleLike}
                    disabled={loading}
                    className={`h-12 w-16 flex flex-col items-center justify-center rounded-lg backdrop-blur-md border shadow-xl transition-all duration-300 active:scale-95 hover:bg-black/80 ${hasLiked
                        ? 'bg-pink-500/20 border-pink-500/50'
                        : 'bg-black/60 border-white/10'
                        }`}
                    title={hasLiked ? "You liked this profile" : "Like this profile"}
                >
                    <span className={`text-xs transition-transform duration-300 ${hasLiked ? 'scale-125 text-pink-500' : 'text-gray-300 group-hover:text-pink-400'}`}>
                        {hasLiked ? '❤️' : '🤍'}
                    </span>
                    <span className="text-[10px] font-bold text-white mt-0.5">{likeCount}</span>
                </button>
            </div>

            <KundliModal
                isOpen={showKundli}
                onClose={() => setShowKundli(false)}
                data={match.kundli}
                names={{ me: "You", partner: match.name }}
            />
        </div >
    );
}
