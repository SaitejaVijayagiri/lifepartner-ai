'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Gift } from 'lucide-react';

export default function ReferPage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        api.profile.getMe().then(res => {
            setUser(res);
            setLoading(false);
        });
    }, []);

    const handleShare = async () => {
        const text = `Join me on LifePartner AI! Use my code ${user?.referral_code} or click here: https://lifepartner.ai/register?code=${user?.referral_code}`;

        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Find your Life Partner',
                    text: text,
                    url: `https://lifepartner.ai/register?code=${user?.referral_code}`
                });
            } catch (err) {
                // console.log('Share canceled');
            }
        } else {
            navigator.clipboard.writeText(text);
            alert("Link copied to clipboard!");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-8 pb-16 rounded-b-[40px] shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 opacity-10 pointer-events-none">
                    <Gift size={200} />
                </div>
                <div className="max-w-md mx-auto text-center relative z-10">
                    <h1 className="text-3xl font-bold mb-2">Invite Friends</h1>
                    <p className="text-indigo-100 text-lg">Earn Free Coins together!</p>
                </div>
            </div>

            {/* Card */}
            <div className="max-w-md mx-auto -mt-12 px-4">
                <div className="bg-white rounded-3xl shadow-xl p-6 text-center space-y-6">
                    <div className="w-20 h-20 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-2 animate-bounce">
                        <Gift size={40} />
                    </div>

                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Give 20, Get 50</h2>
                        <p className="text-gray-500 mt-2 text-sm leading-relaxed">
                            Invite a friend to LifePartner AI.<br />
                            They get <span className="font-bold text-indigo-600">20 Coins</span> instantly.<br />
                            You get <span className="font-bold text-green-600">50 Coins</span> when they join.
                        </p>
                    </div>

                    <div className="bg-gray-50 border border-dashed border-gray-300 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold mb-1">Your Referral Code</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black text-gray-800 tracking-wider font-mono">{user?.referral_code || "LOADING"}</span>
                            <button
                                onClick={() => { navigator.clipboard.writeText(user?.referral_code); alert("Code copied!"); }}
                                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <Copy size={16} className="text-gray-500" />
                            </button>
                        </div>
                    </div>

                    <Button
                        onClick={handleShare}
                        className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold rounded-2xl shadow-lg shadow-indigo-200"
                    >
                        <Share2 className="mr-2" size={20} />
                        Invite Friends
                    </Button>

                    <p className="text-xs text-gray-400">
                        * Referral bonuses are credited instantly to your wallet. Max 10 invites/day.
                    </p>
                </div>
            </div>
        </div>
    );
}
