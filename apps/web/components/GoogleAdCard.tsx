'use client';

import { useEffect, useRef } from 'react';

declare global {
    interface Window {
        adsbygoogle: any[];
    }
}

interface GoogleAdCardProps {
    isActive: boolean;
    slotId?: string; // Optional: Allow passing specific slots
}

export default function GoogleAdCard({ isActive, slotId = "8536302476" }: GoogleAdCardProps) {
    // Default slot '8536302476' is an example. In real app, you create units in AdSense console.
    // Using a generic responsive slot here.

    const adRef = useRef<HTMLDivElement>(null);
    const initialized = useRef(false);

    useEffect(() => {
        // Only push the ad when it becomes active or viewed to ensure viewability stats
        // But for simplicity/performance in a feed, we might want to load it slightly before.
        // AdSense script is already in layout.tsx.

        if (typeof window !== 'undefined' && !initialized.current) {
            try {
                // Check if ad container is empty to avoid double insertion
                if (adRef.current && adRef.current.innerHTML === "") {
                    (window.adsbygoogle = window.adsbygoogle || []).push({});
                    initialized.current = true;
                }
            } catch (err) {
                console.error("AdSense Error", err);
            }
        }
    }, [isActive]);

    return (
        <div className="h-full w-full snap-start relative bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="absolute top-4 right-4 bg-gray-800 px-2 py-1 rounded text-[10px] text-gray-400 font-bold z-10 border border-gray-700">
                Sponsored
            </div>

            {/* Ad Container */}
            <div className="w-full h-full flex flex-col items-center justify-center p-4">
                <div className="text-center mb-4">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                        Partner Offer
                    </h3>
                    <p className="text-sm text-gray-400">Discover something new</p>
                </div>

                <div ref={adRef} className="w-full max-w-[300px] min-h-[250px] bg-white/5 rounded-lg overflow-hidden flex items-center justify-center">
                    {/* Responsive Display Ad Unit */}
                    <ins className="adsbygoogle"
                        style={{ display: 'block', width: '100%', height: '100%' }}
                        data-ad-client="ca-pub-1408290775036355"
                        data-ad-slot={slotId}
                        data-ad-format="auto"
                        data-full-width-responsive="true"></ins>
                </div>

                <div className="mt-8 text-xs text-gray-600">
                    Advertisement
                </div>
            </div>
        </div>
    );
}
