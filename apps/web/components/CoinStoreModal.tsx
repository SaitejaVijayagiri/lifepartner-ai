'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { X, Coins } from 'lucide-react';
import { useToast } from '@/components/ui/Toast';
import { load } from '@cashfreepayments/cashfree-js';

const COIN_BUNDLES = [
    { id: 'starter', coins: 100, price: 99, label: 'Starter', popular: false },
    { id: 'popular', coins: 500, price: 399, label: 'Popular', popular: true },
    { id: 'pro', coins: 1000, price: 699, label: 'Pro', popular: false },
];

export default function CoinStoreModal({ isOpen, onClose, onSuccess }: { isOpen: boolean, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    if (!isOpen) return null;

    const handlePurchase = async (bundle: typeof COIN_BUNDLES[0]) => {
        setLoading(true);
        try {
            // 1. Create Order
            const orderRes = await api.payments.createOrder(
                bundle.price, // Amount
                'COINS',      // Type
                bundle.coins  // Coins count
            );

            if (!orderRes.payment_session_id) {
                throw new Error("Failed to create payment session");
            }

            // 2. Load Cashfree
            const cashfree = await load({
                mode: "sandbox" // TEST Mode
            });

            // 3. Checkout
            await cashfree.checkout({
                paymentSessionId: orderRes.payment_session_id,
                redirectTarget: "_self"
            });

            // Note: Cashfree usually redirects, so code below might not run immediately if redirecting.
            // If using popup (legacy/headless), we might need different handling.
            // Standard Cashfree v3 redirects.

        } catch (e: any) {
            console.error(e);
            toast.error("Failed to initiate payment: " + (e.message || "Unknown error"));
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
            <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
                <div className="p-4 bg-gradient-to-r from-yellow-500 to-amber-600 text-white flex justify-between items-center">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                        <Coins className="fill-white" /> Coin Store
                    </h3>
                    <button onClick={onClose}><X /></button>
                </div>

                <div className="p-6 space-y-4">
                    {COIN_BUNDLES.map((bundle) => (
                        <div
                            key={bundle.id}
                            onClick={() => handlePurchase(bundle)}
                            className={`
                                relative flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all hover:scale-[1.02]
                                ${bundle.popular ? 'border-amber-500 bg-amber-50' : 'border-gray-100 hover:border-indigo-100'}
                            `}
                        >
                            {bundle.popular && (
                                <div className="absolute -top-3 left-4 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                                    BEST VALUE
                                </div>
                            )}
                            <div className="flex items-center gap-4">
                                <div className="bg-yellow-100 p-3 rounded-full text-yellow-700">
                                    <Coins size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-xl text-gray-900">{bundle.coins} Coins</h4>
                                    <p className="text-gray-500 text-sm">{bundle.label} Pack</p>
                                </div>
                            </div>
                            <button className="bg-gray-900 text-white px-4 py-2 rounded-lg font-bold">
                                ₹{bundle.price}
                            </button>
                        </div>
                    ))}
                </div>

                <div className="p-4 bg-gray-50 text-center text-xs text-gray-500">
                    Secure payments via Cashfree.
                </div>
            </div>
        </div>
    );
}
