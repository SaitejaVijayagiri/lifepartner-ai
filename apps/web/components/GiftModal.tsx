'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { X, Coins } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import CoinStoreModal from './CoinStoreModal';

const GIFTS = [
    { id: 'rose', name: 'Rose', icon: '🌹', cost: 10 },
    { id: 'coffee', name: 'Coffee', icon: '☕', cost: 25 },
    { id: 'chocolate', name: 'Chocolate', icon: '🍫', cost: 50 },
    { id: 'diamond', name: 'Diamond', icon: '💎', cost: 100 },
    { id: 'ring', name: 'Ring', icon: '💍', cost: 500 },
    { id: 'castle', name: 'Castle', icon: '🏰', cost: 1000 },
];

export default function GiftModal({
    isOpen,
    onClose,
    toUserId,
    toUserName
}: {
    isOpen: boolean;
    onClose: () => void;
    toUserId: string;
    toUserName: string;
}) {
    const [balance, setBalance] = useState<number | null>(null);
    const [sending, setSending] = useState<string | null>(null);
    const [showCoinStore, setShowCoinStore] = useState(false);
    const toast = useToast();

    useEffect(() => {
        if (isOpen) {
            fetchBalance();
        }
    }, [isOpen]);

    const fetchBalance = async () => {
        try {
            const res = await api.wallet.getBalance();
            setBalance(res.balance);
        } catch (e) {
            console.error(e);
        }
    };

    const handleSend = async (gift: typeof GIFTS[0]) => {
        if ((balance || 0) < gift.cost) {
            toast.error(`Insufficient coins! You need ${gift.cost} coins.`);
            return;
        }

        setSending(gift.id);
        try {
            await api.wallet.sendGift(toUserId, gift.id, gift.cost);
            toast.success(`Sent ${gift.name} to ${toUserName}!`);
            setBalance(prev => (prev || 0) - gift.cost);
            setTimeout(onClose, 1000);
        } catch (e) {
            toast.error("Failed to send gift.");
        } finally {
            setSending(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl scale-100 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-white flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg">Send a Gift</h3>
                        <p className="text-indigo-100 text-xs">to {toUserName}</p>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/20 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                {/* Balance */}
                <div className="bg-indigo-50 px-4 py-2 flex justify-between items-center border-b border-indigo-100">
                    <span className="text-sm text-indigo-900 font-medium">Your Balance</span>
                    <div className="flex items-center gap-1 font-bold text-yellow-600">
                        <Coins size={16} className="fill-yellow-500" />
                        <span>{balance !== null ? balance : '...'}</span>
                    </div>
                </div>

                {/* Grid */}
                <div className="p-4 grid grid-cols-3 gap-3">
                    {GIFTS.map((gift) => (
                        <button
                            key={gift.id}
                            onClick={() => handleSend(gift)}
                            disabled={!!sending}
                            className={`
                                flex flex-col items-center p-3 rounded-xl border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50 transition-all text-center
                                ${(balance || 0) < gift.cost ? 'opacity-50 grayscale' : 'hover:scale-105'}
                            `}
                        >
                            <span className="text-3xl mb-2 filter drop-shadow-sm">{gift.icon}</span>
                            <span className="text-xs font-semibold text-gray-800">{gift.name}</span>
                            <span className="text-[10px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                                <Coins size={8} /> {gift.cost}
                            </span>
                        </button>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 bg-gray-50 text-center">
                    <button
                        className="text-xs text-indigo-600 font-bold hover:underline"
                        onClick={() => setShowCoinStore(true)}
                    >
                        + Get More Coins
                    </button>
                </div>
            </div>

            <CoinStoreModal
                isOpen={showCoinStore}
                onClose={() => setShowCoinStore(false)}
                onSuccess={fetchBalance}
            />
        </div>
    );
}
