import React, { useState } from 'react';
import Script from 'next/script';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Loader2, CheckCircle, Smartphone, MessageCircle, Star } from 'lucide-react';
import { load } from '@cashfreepayments/cashfree-js';

interface PremiumModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any;
    onSuccess: () => void;
}

export const PremiumModal = ({ isOpen, onClose, user, onSuccess }: PremiumModalProps) => {
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    if (!isOpen) return null;

    if (showSuccess) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-500 scale-100 p-8 text-center">
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-0 left-1/4 w-2 h-2 bg-red-400 rounded-full animate-ping" style={{ animationDuration: '1s' }} />
                        <div className="absolute top-10 right-1/4 w-3 h-3 bg-yellow-400 rounded-full animate-ping" style={{ animationDuration: '1.5s' }} />
                        <div className="absolute bottom-10 left-10 w-2 h-2 bg-blue-400 rounded-full animate-ping" style={{ animationDuration: '2s' }} />
                    </div>

                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl shadow-lg shadow-green-200 animate-bounce">
                        🎉
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Premium!</h2>
                    <p className="text-gray-500 mb-8">You've unlocked all exclusive features. Get ready to find your perfect match!</p>

                    <Button
                        onClick={() => { onClose(); setShowSuccess(false); }}
                        className="w-full h-12 text-lg bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-500/30"
                    >
                        Start Exploring 🚀
                    </Button>
                </div>
            </div>
        );
    }



    // ... imports

    const handlePayment = async () => {
        setLoading(true);
        try {
            // console.log("Starting Payment Flow...");
            // 1. Create Order (Amount in INR: 499)
            const orderRes = await api.payments.createOrder(499, 'PREMIUM');

            if (!orderRes.payment_session_id) {
                throw new Error("Failed to create session");
            }

            // 2. Load Cashfree
            const cashfree = await load({ mode: "sandbox" });

            // 3. Checkout
            await cashfree.checkout({
                paymentSessionId: orderRes.payment_session_id,
                redirectTarget: "_self"
            });

        } catch (err: any) {
            console.error("Payment Init failed", err);
            alert(`Failed to initialize payment: ${err.message || "Unknown Error"}`);
            setLoading(false);
        }
    };

    return (
        <>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                <div className="bg-white text-gray-900 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in-95 duration-300">

                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-center">
                        <h2 className="text-2xl font-bold text-white mb-2">Upgrade to Premium 👑</h2>
                        <p className="text-indigo-100 text-sm">Unlock the full potential of AI Matchmaking</p>
                    </div>

                    {/* Benefits */}
                    <div className="p-6 space-y-4">
                        <Benefit icon={Smartphone} title="View Contact Numbers" desc="Connect directly clearly." />
                        <Benefit icon={MessageCircle} title="Unlimited AI Chat" desc="Ask for relationship advice anytime." />
                        <Benefit icon={Star} title="Verified Badge" desc="Get trusted by more profiles." />
                        <Benefit icon={Smartphone} title="Share Stories" desc="Post 24h updates securely." />
                    </div>

                    {/* Price & Action */}
                    <div className="p-6 bg-gray-50 border-t border-gray-100 text-center">
                        <div className="mb-6">
                            <span className="text-3xl font-bold text-gray-900">₹499</span>
                            <span className="text-gray-500 text-sm"> / year</span>
                        </div>

                        <Button
                            onClick={handlePayment}
                            disabled={loading}
                            className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02]"
                        >
                            {loading ? (
                                <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing...</>
                            ) : (
                                "Get Premium Now"
                            )}
                        </Button>
                        <p className="mt-4 text-xs text-gray-400">Secure payment via Cashfree</p>
                    </div>

                    {/* Close X */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
            </div>
        </>
    );
};

const Benefit = ({ icon: Icon, title, desc }: any) => (
    <div className="flex items-start">
        <div className="p-2 bg-indigo-100 rounded-lg mr-4">
            <Icon className="w-5 h-5 text-indigo-600" />
        </div>
        <div>
            <h3 className="font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500">{desc}</p>
        </div>
    </div>
);
