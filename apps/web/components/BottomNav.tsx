import React from 'react';
import { Heart, Video, Users, MessageCircle, User } from 'lucide-react';

interface NavItem {
    id: string;
    label: string;
    icon: any;
    badge?: number;
}

interface BottomNavProps {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    requestsCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab, requestsCount }) => {
    const navItems: NavItem[] = [
        { id: 'matches', label: 'Matches', icon: Heart },
        { id: 'reels', label: 'Vibe', icon: Video },
        { id: 'requests', label: 'Requests', icon: Users, badge: requestsCount },
        { id: 'connections', label: 'Chat', icon: MessageCircle },
        { id: 'profile', label: 'Profile', icon: User },
    ];

    return (
        <div className="md:hidden fixed bottom-6 left-4 right-4 z-50">
            <div className="bg-glass rounded-2xl shadow-2xl border border-white/40 flex justify-between items-center px-2 py-3 backdrop-blur-xl">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className="relative flex-1 flex flex-col items-center justify-center gap-1 group"
                    >
                        <div className={`
                            relative p-2 rounded-xl transition-all duration-500 ease-out
                            ${activeTab === item.id
                                ? 'bg-primary text-primary-foreground shadow-lg shadow-indigo-500/30 -translate-y-6 scale-110 ring-4 ring-white'
                                : 'text-muted-foreground hover:bg-slate-100'
                            }
                        `}>
                            <item.icon
                                size={activeTab === item.id ? 22 : 24}
                                strokeWidth={activeTab === item.id ? 2.5 : 2}
                                className="transition-transform duration-300"
                            />

                            {item.badge ? (
                                <span className={`absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white ${activeTab === item.id ? 'ring-primary' : ''}`}>
                                    {item.badge}
                                </span>
                            ) : null}
                        </div>

                        {activeTab === item.id && (
                            <span className="absolute -bottom-5 text-[10px] font-bold text-primary animate-in fade-in slide-in-from-top-1 duration-300">
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};
