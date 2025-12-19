'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';

interface ProfileModalProps {
    profile: any;
    currentUser: any;
    onClose: () => void;
    onConnect: () => void;
    onUpgrade: () => void;
}

export default function ProfileModal({ profile, currentUser, onClose, onConnect, onUpgrade }: ProfileModalProps) {
    const [activeTab, setActiveTab] = useState('about');
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [lastInteracted, setLastInteracted] = useState(0);
    const [playingReel, setPlayingReel] = useState<string | null>(null);

    // Ensure we have an array
    const photos: string[] = profile.photos?.length > 0
        ? profile.photos
        : [profile.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.id}`];

    // Auto-Slide Effect
    useEffect(() => {
        if (photos.length <= 1) return;

        const interval = setInterval(() => {
            // Only slide if user hasn't interacted in the last 4 seconds
            if (Date.now() - lastInteracted > 4000) {
                setCurrentPhotoIndex(prev => (prev + 1) % photos.length);
            }
        }, 3000);

        return () => clearInterval(interval);
    }, [photos.length, lastInteracted]);

    // FALLBACK REELS FOR DEMO (If user has none)
    const demoReels = [
        "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-taking-photos-from-different-angles-of-a-model-34421-large.mp4",
        "https://assets.mixkit.co/videos/preview/mixkit-young-mother-playing-with-her-daughter-1208-large.mp4"
    ];
    const displayReels = (profile.reels && profile.reels.length > 0) ? profile.reels : demoReels;
    const hasReels = true;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md md:p-6 animate-in fade-in duration-300 overflow-y-auto">
            <div className="bg-white w-full max-w-5xl md:h-[85vh] min-h-screen md:min-h-0 rounded-none md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl relative">

                {/* Enhanced Close Button (Floating & Glassy) - Fixed Position for Mobile Reliability */}
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 z-[100] bg-black/60 hover:bg-black/80 backdrop-blur-md text-white p-3 rounded-full flex items-center justify-center transition-all hover:scale-110 shadow-xl border border-white/20"
                    style={{ position: 'fixed', top: '16px', right: '16px' }}
                >
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                </button>

                {/* LEFT: Immersive Image Section - Fixed Height on Mobile to Stop Jumps */}
                <div className="w-full md:w-[45%] h-[55vh] md:h-full bg-gray-900 relative group shrink-0 flex items-center justify-center">

                    {/* Main Image */}
                    <img
                        src={photos[currentPhotoIndex]}
                        alt={profile.name}
                        className="w-full h-full object-contain bg-black/90 block transition-opacity duration-500"
                    />

                    {/* Gradient Overlay for Text Readability (Subtler) */}
                    <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/90 to-transparent flex flex-col justify-end p-6 z-20 pointer-events-none">
                        <div className="flex items-center gap-2 mb-1">
                            <h2 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">{profile.name}, {profile.age}</h2>
                            {profile.isVerified !== false && <span className="text-blue-400 bg-blue-900/30 p-1 rounded-full text-xs" title="Verified">✓</span>}
                        </div>
                        <p className="text-gray-300 text-xs font-medium flex items-center gap-2 drop-shadow-md">
                            <span>{profile.career?.profession || "Professional"}</span>
                            <span className="w-1 h-1 bg-gray-400 rounded-full" />
                            <span>{typeof profile.location === 'string' ? profile.location : (profile.location?.city || "India")}</span>
                        </p>
                    </div>

                    {/* Photo Progress Bar (Instagram Story Style) */}
                    {photos.length > 1 && (
                        <div className="absolute top-4 left-4 right-16 flex gap-1 z-30">
                            {photos.map((_, idx) => (
                                <div key={idx} className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full bg-white transition-all duration-300 ${idx === currentPhotoIndex ? 'w-full' : idx < currentPhotoIndex ? 'w-full' : 'w-0'}`}
                                    />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Navigation Arrows for Visibility */}
                    {photos.length > 1 && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLastInteracted(Date.now());
                                    setCurrentPhotoIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
                                }}
                                className="absolute left-2 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white p-2 rounded-full hover:bg-black/20 transition-all"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setLastInteracted(Date.now());
                                    setCurrentPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
                                }}
                                className="absolute right-2 top-1/2 -translate-y-1/2 z-40 text-white/70 hover:text-white p-2 rounded-full hover:bg-black/20 transition-all"
                            >
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </>
                    )}

                    {/* Navigation Touch Areas */}
                    <div className="absolute inset-0 flex z-10">
                        <div className="w-1/2 h-full" onClick={() => {
                            setLastInteracted(Date.now());
                            setCurrentPhotoIndex(prev => prev === 0 ? photos.length - 1 : prev - 1);
                        }} />
                        <div className="w-1/2 h-full" onClick={() => {
                            setLastInteracted(Date.now());
                            setCurrentPhotoIndex(prev => prev === photos.length - 1 ? 0 : prev + 1);
                        }} />
                    </div>
                </div>

                {/* RIGHT: Content & Details */}
                <div className="w-full md:w-[55%] flex flex-col bg-white h-auto md:h-full relative -mt-6 md:mt-0 rounded-t-3xl md:rounded-none z-30 md:z-auto">

                    {/* Compatibility Badge (Floating on Mobile overlap) */}
                    <div className="absolute -top-5 right-6 md:static md:p-6 md:pb-2 md:bg-white z-40">
                        <div className="bg-white/95 md:bg-indigo-50 backdrop-blur shadow-lg md:shadow-none text-indigo-700 px-4 py-2 md:py-1 rounded-full text-sm font-bold border border-indigo-100 flex items-center gap-2">
                            <span className="text-lg">✨</span> {profile.score || 90}% Match
                        </div>
                    </div>

                    {/* Desktop Header (Hidden on Mobile) */}
                    <div className="hidden md:block px-8 pt-8 pb-4">
                        <p className="text-gray-500 italic text-sm border-l-4 border-indigo-500 pl-4 py-1">
                            "{profile.match_reasons?.[0] || profile.summary || "Strong compatibility based on shared values."}"
                        </p>
                    </div>

                    {/* Mobile Insight (Visible only on mobile) */}
                    <div className="md:hidden px-6 pt-8 pb-4">
                        <p className="text-gray-500 italic text-sm border-l-4 border-indigo-500 pl-4 py-1">
                            "{profile.match_reasons?.[0] || profile.summary || "Strong compatibility based on shared values."}"
                        </p>
                    </div>


                    {/* Sticky Tabs */}
                    <div className="sticky top-0 bg-white/95 backdrop-blur z-40 border-b border-gray-100 px-6">
                        <div className="flex space-x-6 overflow-x-auto no-scrollbar py-3">
                            {['about', 'personal', 'career', 'family', ...(hasReels ? ['vibe check'] : [])].map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`
                                        pb-2 text-sm font-semibold capitalize whitespace-nowrap transition-all
                                        ${activeTab === tab
                                            ? 'text-indigo-600 border-b-2 border-indigo-600'
                                            : 'text-gray-400 hover:text-gray-600 border-transparent'}
                                    `}
                                >
                                    {tab === 'vibe check' ? '✨ Vibe Check' : tab}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto p-6 md:px-8 space-y-8 pb-32 md:pb-6">

                        {activeTab === 'about' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">About Me</h3>
                                    <p className="text-gray-700 leading-relaxed text-[15px]">
                                        {profile.aboutMe || "I am a simple person looking for a partner who values family and traditions while being modern in outlook. I enjoy traveling and reading."}
                                    </p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Age / Height" value={`${profile.dob ? new Date().getFullYear() - new Date(profile.dob).getFullYear() : profile.age} Yrs, ${profile.height || "5'5\""}`} />
                                    <InfoCard label="Marital Status" value={profile.maritalStatus || "Never Married"} />
                                    <InfoCard label="Location" value={typeof profile.location === 'string' ? profile.location : (profile.location?.city || "Unknown")} />
                                    <InfoCard label="Mother Tongue" value={profile.motherTongue || "English"} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'personal' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <section>
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Horoscope & Faith</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <InfoCard label="Religion" value={profile.religion?.faith || profile.religion?.religion || "Hindu"} />
                                        <InfoCard label="Caste" value={profile.religion?.caste || "-"} />
                                        <InfoCard label="Gothra" value={profile.horoscope?.gothra || profile.religion?.gothra || "-"} />
                                        <InfoCard label="Manglik" value={profile.horoscope?.manglik || "No"} icon="✨" />
                                        <InfoCard label="Zodiac" value={profile.horoscope?.zodiacSign || "-"} />
                                        <InfoCard label="Nakshatra" value={profile.horoscope?.nakshatra || "-"} />
                                        <InfoCard label="Time of Birth" value={profile.horoscope?.birthTime || "-"} />
                                        <InfoCard label="Birth Place" value={profile.horoscope?.birthPlace || "-"} />
                                    </div>
                                </section>

                                {/* Premium Contact Section */}
                                <section className="pt-2">
                                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex justify-between items-center">
                                        Contact Information
                                        {!currentUser?.is_premium && <span className="bg-amber-100 text-amber-700 text-[10px] px-2 py-0.5 rounded-full font-bold">PREMIUM</span>}
                                    </h3>

                                    {currentUser?.is_premium ? (
                                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl p-5 space-y-4">
                                            <ContactRow icon="📞" label="Phone" value={profile.phone || "Not Available"} />
                                            <ContactRow icon="✉️" label="Email" value={profile.email || "hidden@email.com"} />
                                        </div>
                                    ) : (
                                        <div className="relative overflow-hidden rounded-2xl bg-gray-50 border border-gray-100 p-8 text-center">
                                            <div className="absolute inset-0 blur-md opacity-40 bg-white/50 pointer-events-none p-6 space-y-4">
                                                <div className="h-4 bg-gray-300 rounded w-3/4 mx-auto" />
                                                <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto" />
                                            </div>
                                            <div className="relative z-10 flex flex-col items-center">
                                                <div className="w-14 h-14 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-full flex items-center justify-center mb-3 shadow-lg shadow-amber-500/30 text-white text-2xl">
                                                    👑
                                                </div>
                                                <h4 className="font-bold text-gray-900 text-lg mb-1">Unlock Contact Details</h4>
                                                <p className="text-sm text-gray-500 mb-5">See phone numbers & email instantly.</p>
                                                <Button onClick={onUpgrade} className="bg-gray-900 text-white hover:bg-black rounded-full px-8 shadow-xl">
                                                    Upgrade to Unlock
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </section>
                            </div>
                        )}

                        {activeTab === 'career' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm">💼</div>
                                        <div>
                                            <div className="font-bold text-gray-900 text-lg">{profile.career?.profession || "Professional"}</div>
                                            <div className="text-sm text-gray-500 flex items-center gap-2">
                                                {/* Show Company if Connected OR Premium */}
                                                {(profile.match_status === 'accepted' || currentUser?.id === profile.id || currentUser?.is_premium)
                                                    ? (
                                                        <>
                                                            {profile.career?.company || "Top Company"}
                                                            {currentUser?.is_premium && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-200">💎 UNLOCKED</span>}
                                                        </>
                                                    )
                                                    : "🔒 Connect to Unlock Company"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <InfoRow label="Education" value={profile.career?.education || "Masters"} />
                                        <InfoRow label="College" value={profile.career?.college || "Tier 1 Institute"} />
                                        <InfoRow
                                            label="Annual Income"
                                            value={(profile.match_status === 'accepted' || currentUser?.id === profile.id || currentUser?.is_premium) ? (profile.career?.income || "Hidden") : "🔒 Connect to Unlock"}
                                            highlight={(profile.match_status === 'accepted' || currentUser?.id === profile.id || currentUser?.is_premium)}
                                            premiumUnlocked={currentUser?.is_premium && !(profile.match_status === 'accepted' || currentUser?.id === profile.id)}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'family' && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="grid grid-cols-2 gap-4">
                                    <InfoCard label="Family Type" value={profile.family?.type || profile.family?.familyType || "Nuclear"} />
                                    <InfoCard label="Values" value={profile.family?.values || profile.family?.familyValues || "Moderate"} />
                                    <InfoCard label="Father" value={profile.family?.fatherOccupation || "Retired"} />
                                    <InfoCard label="Mother" value={profile.family?.motherOccupation || "Homemaker"} />
                                    <InfoCard label="Brothers" value={profile.family?.brothers || "0"} />
                                    <InfoCard label="Sisters" value={profile.family?.sisters || "0"} />
                                    <InfoCard label="Native Place" value={profile.family?.nativePlace || profile.location?.city || "City"} />
                                </div>
                            </div>
                        )}

                        {activeTab === 'vibe check' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                <div className="bg-gradient-to-r from-pink-50 to-purple-50 p-4 rounded-xl border border-purple-100 mb-4">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xl">✨</span>
                                        <h3 className="font-bold text-purple-900">Vibe Check</h3>
                                    </div>
                                    <p className="text-purple-700 text-sm">Watch short reels to get a sense of {profile.name}'s personality.</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    {displayReels.map((url: string, idx: number) => (
                                        <div
                                            key={idx}
                                            className="aspect-[9/16] bg-gray-900 rounded-xl overflow-hidden relative cursor-pointer group shadow-md hover:shadow-xl transition-all"
                                            onClick={() => setPlayingReel(url)}
                                        >
                                            <video src={url.startsWith('http') ? url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${url}`} className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity" muted />
                                            <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm border border-white/40 rounded-full flex items-center justify-center text-white scale-100 group-hover:scale-110 transition-transform shadow-lg">
                                                    <Play size={24} fill="white" />
                                                </div>
                                            </div>
                                            <div className="absolute bottom-2 left-2 right-2">
                                                <div className="bg-black/40 backdrop-blur text-white text-[10px] px-2 py-1 rounded-full w-max">
                                                    Reel #{idx + 1}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                    </div>

                    {/* Bottom Action Bar (Fixed on Mobile) */}
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-white border-t border-gray-100 md:static md:bg-gray-50 z-50">
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 h-12 rounded-xl border-gray-300 text-gray-600 font-bold" onClick={onClose}>
                                Skip
                            </Button>
                            <Button className="flex-[2] h-12 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-lg shadow-indigo-500/30" onClick={onConnect}>
                                Send Interest 💖
                            </Button>
                        </div>
                    </div>

                </div>

                {/* Full Screen Reel Player Overlay */}
                {playingReel && (
                    <div className="fixed inset-0 z-[150] bg-black flex items-center justify-center animate-in fade-in zoom-in-95 duration-200">
                        <button
                            className="absolute top-4 right-4 z-[80] text-white bg-black/50 p-4 rounded-full backdrop-blur-md hover:bg-black/70"
                            onClick={() => setPlayingReel(null)}
                        >
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>
                        <video
                            src={playingReel.startsWith('http') ? playingReel : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'}${playingReel}`}
                            className="w-full h-full md:w-auto md:h-[90vh] object-contain"
                            controls
                            autoPlay
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

// Sub-components for cleaner code
const InfoCard = ({ label, value, icon }: any) => (
    <div className="bg-gray-50 p-3 rounded-xl border border-gray-100">
        <div className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</div>
        <div className="font-semibold text-gray-900 text-sm truncate flex items-center gap-1">
            {icon && <span>{icon}</span>} {value}
        </div>
    </div>
);

const InfoRow = ({ label, value, highlight, premiumUnlocked }: any) => (
    <div className="flex justify-between items-center py-2 border-b border-slate-200 last:border-0">
        <span className="text-gray-500 text-sm">{label}</span>
        <div className="flex items-center gap-2">
            <span className={`font-medium text-sm ${highlight ? 'text-green-700 font-bold' : 'text-gray-900'}`}>{value}</span>
            {premiumUnlocked && <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-bold border border-amber-200">💎</span>}
        </div>
    </div>
);

const ContactRow = ({ icon, label, value }: any) => (
    <div className="flex items-center gap-4 bg-white p-3 rounded-xl border border-green-100/50 shadow-sm">
        <div className="w-10 h-10 bg-green-50 rounded-full flex items-center justify-center text-xl">{icon}</div>
        <div>
            <div className="text-[10px] text-green-800 font-bold uppercase tracking-wider">{label}</div>
            <div className="text-gray-900 font-mono font-medium">{value}</div>
        </div>
    </div>
);
