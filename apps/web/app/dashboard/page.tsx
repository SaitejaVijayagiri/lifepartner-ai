'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Bell, Search, Sparkles, Filter, Briefcase, MapPin, Ruler } from 'lucide-react';

/* Components */
import MatchCard from '@/components/MatchCard';
import { BottomNav } from '@/components/BottomNav';
import StoryModal from '@/components/StoryModal';
import { NotificationBell } from '@/components/NotificationBell'; // Ensure default export or named

/* Mock Data for Stories */
const STORIES = [
    { id: '1', user: 'Ananya', img: 'https://i.pravatar.cc/150?u=1' },
    { id: '2', user: 'Rahul', img: 'https://i.pravatar.cc/150?u=2' },
    { id: '3', user: 'Vikram', img: 'https://i.pravatar.cc/150?u=3' },
    { id: '4', user: 'Sneha', img: 'https://i.pravatar.cc/150?u=4', hasStory: true },
    { id: '5', user: 'Priya', img: 'https://i.pravatar.cc/150?u=5', hasStory: true },
];

/* Mock Data for Events */
const EVENTS = [
    { id: 1, title: 'Speed Dating: Bangalore', date: 'Sat, 14 Dec', time: '6:00 PM', image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80' },
    { id: 2, title: 'Astrology Workshop', date: 'Sun, 15 Dec', time: '11:00 AM', image: 'https://images.unsplash.com/photo-1533285962792-0c3c5e9cb0d7?w=800&q=80' },
];

export default function Dashboard() {
    const router = useRouter();
    const [matches, setMatches] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('matches'); // matches, reels, requests, chat, profile
    const [requestsCount, setRequestsCount] = useState(0);

    /* Story State */
    const [currentStoryIndex, setCurrentStoryIndex] = useState<number | null>(null);

    useEffect(() => {
        const checkAuth = async () => {
            // Basic Auth Check
            const token = localStorage.getItem('token');
            if (!token) {
                router.push('/login');
                return;
            }
            fetchMatches();
            // Mock Requests Count
            setRequestsCount(3);
        };
        checkAuth();
    }, [router]);

    const fetchMatches = async () => {
        try {
            const data = await api.matches.getAll();
            setMatches(data.matches || []);
        } catch (err) {
            console.error('Failed to load matches', err);
        } finally {
            setLoading(false);
        }
    };

    // --- RENDERERS ---

    const renderHeader = () => (
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border transition-all duration-300">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg shadow-indigo-500/20">
                        <Sparkles size={16} fill="white" />
                    </div>
                    <span className="text-xl font-heading font-bold text-foreground tracking-tight hidden sm:block">LifePartner AI</span>
                </div>

                {/* Search Bar (Desktop) */}
                <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search by ID, Name or Profession..."
                        className="w-full h-10 pl-10 pr-4 rounded-full bg-secondary/10 border border-transparent focus:bg-background focus:border-input focus:ring-2 focus:ring-primary/20 transition-all text-sm font-medium"
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="relative w-10 h-10 rounded-full hover:bg-secondary/20 flex items-center justify-center transition-colors">
                        <Filter size={20} className="text-foreground" />
                    </button>
                    <NotificationBell />
                    {/* User Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 to-orange-500 p-[2px] cursor-pointer" onClick={() => setActiveTab('profile')}>
                        <img src="https://i.pravatar.cc/150?img=32" className="rounded-full w-full h-full border-2 border-background" alt="Profile" />
                    </div>
                </div>
            </div>
        </header>
    );

    const renderStories = () => (
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar px-4 pt-2">
            {/* My Story */}
            <div className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer group">
                <div className="w-16 h-16 rounded-full p-[2px] border-2 border-dashed border-gray-300 group-hover:border-primary transition-colors relative">
                    <div className="w-full h-full rounded-full bg-secondary/10 flex items-center justify-center text-primary">
                        +
                    </div>
                </div>
                <span className="text-xs font-medium text-gray-500">Your Story</span>
            </div>

            {/* Other Stories */}
            {STORIES.map((story, i) => (
                <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0 cursor-pointer" onClick={() => setCurrentStoryIndex(i)}>
                    <div className={`w-16 h-16 rounded-full p-[2px] ${story.hasStory ? 'bg-gradient-to-tr from-yellow-400 to-fuchsia-600' : 'bg-gray-200'} transition-transform hover:scale-105`}>
                        <div className="w-full h-full rounded-full p-[2px] bg-background">
                            <img src={story.img} className="w-full h-full rounded-full object-cover" alt={story.user} />
                        </div>
                    </div>
                    <span className="text-xs font-medium text-foreground">{story.user}</span>
                </div>
            ))}
        </div>
    );

    const renderEventsSidebar = () => (
        <div className="hidden lg:block w-80 flex-shrink-0 space-y-6">
            <div className="bg-card rounded-2xl p-5 border border-border/50 shadow-sm sticky top-24">
                <h3 className="font-heading font-bold text-lg mb-4 text-foreground flex items-center gap-2">
                    Coming Up <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-sans">Events</span>
                </h3>
                <div className="space-y-4">
                    {EVENTS.map(event => (
                        <div key={event.id} className="group cursor-pointer">
                            <div className="relative h-32 rounded-xl overflow-hidden mb-3">
                                <img src={event.image} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt={event.title} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-3">
                                    <span className="text-white text-xs font-bold bg-black/50 backdrop-blur-md px-2 py-1 rounded-md">{event.date} • {event.time}</span>
                                </div>
                            </div>
                            <h4 className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">{event.title}</h4>
                            <button className="mt-2 w-full py-1.5 rounded-lg border border-primary/20 text-primary text-xs font-bold hover:bg-primary hover:text-white transition-all">RSVP Now</button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderDiscoveryFeed = () => {
        if (loading) {
            return (
                <div className="max-w-2xl mx-auto space-y-8 pt-10">
                    {[1, 2].map(i => (
                        <div key={i} className="h-[500px] w-full bg-secondary/10 rounded-3xl animate-pulse"></div>
                    ))}
                </div>
            );
        }

        return (
            <div className="max-w-xl mx-auto space-y-8 pb-32">
                {/* Header for Feed */}
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-2xl font-heading font-bold text-foreground">Daily Recommendations</h2>
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{matches.length} matches</span>
                </div>

                {matches.map((match) => (
                    <div key={match.id} className="animate-in fade-in slide-in-from-bottom-8 duration-700">
                        <MatchCard
                            match={match}
                            onConnect={() => {
                                // Refresh matches or remove card locally
                                setMatches(prev => prev.map(m => m.id === match.id ? { ...m, match_status: 'pending' } : m));
                            }}
                            onViewProfile={() => router.push(`/profile/${match.id}`)}
                            onStoryClick={() => {
                                // Open story logic for the match if they have updates
                            }}
                        />
                        {/* Inline Actions for Quick Access on Mobile */}
                        <div className="flex items-center justify-between px-4 mt-3 md:hidden">
                            <div className="flex gap-4 text-xs font-medium text-gray-500">
                                <span className="flex items-center gap-1"><Briefcase size={14} /> {match.role}</span>
                                <span className="flex items-center gap-1"><MapPin size={14} /> {match.location?.city}</span>
                                <span className="flex items-center gap-1"><Ruler size={14} /> {match.height}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {matches.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Search className="text-gray-400" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">No New Matches</h3>
                        <p className="text-gray-500">Check back later or adjust your preferences.</p>
                    </div>
                )}
            </div>
        );
    };


    return (
        <div className="min-h-screen bg-background font-sans text-foreground pb-safe">
            {renderHeader()}

            <main className="max-w-7xl mx-auto pt-6 px-4 lg:px-8 flex gap-8">
                {/* Main Feed Column */}
                <div className="flex-1 min-w-0">

                    {/* Stories Bar */}
                    <div className="mb-8">
                        {renderStories()}
                    </div>

                    {activeTab === 'matches' && renderDiscoveryFeed()}

                    {/* Other Tabs (Placeholder for now) */}
                    {activeTab === 'reels' && <div className="text-center py-20 text-gray-500">Reels Feed (Coming Soon)</div>}
                    {activeTab === 'requests' && <div className="text-center py-20 text-gray-500">Requests (Coming Soon)</div>}
                    {activeTab === 'connections' && <div className="text-center py-20 text-gray-500">Chat (Coming Soon)</div>}
                    {activeTab === 'profile' && <div className="text-center py-20 text-gray-500">Profile (Coming Soon)</div>}
                </div>

                {renderEventsSidebar()}
            </main>

            <BottomNav
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                requestsCount={requestsCount}
            />

            {/* Modals */}
            {currentStoryIndex !== null && (
                <StoryModal
                    initialIndex={0}
                    stories={[{
                        id: STORIES[currentStoryIndex].id,
                        url: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
                        type: 'video',
                        createdAt: new Date().toISOString()
                    }]}
                    user={{
                        id: STORIES[currentStoryIndex].id,
                        name: STORIES[currentStoryIndex].user,
                        photoUrl: STORIES[currentStoryIndex].img
                    }}
                    currentUser={{ id: 'me' }}
                    onClose={() => setCurrentStoryIndex(null)}
                    onDelete={() => { }}
                />
            )}
        </div>
    );
}
