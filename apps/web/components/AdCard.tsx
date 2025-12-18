'use client';

import { ExternalLink, Info } from 'lucide-react';

export interface AdItem {
    id: string;
    type: 'ad';
    title: string;
    description: string;
    ctaLink: string;
    ctaText: string;
    contentUrl: string; // Video URL
    advertiserName: string;
    advertiserAvatar: string;
}

export default function AdCard({ ad, isActive }: { ad: AdItem, isActive: boolean }) {
    return (
        <div className="h-full w-full snap-start relative bg-gray-900 border-y border-gray-800">
            {/* Ad Content (Video) */}
            <video
                src={ad.contentUrl}
                className="w-full h-full object-cover opacity-90"
                loop
                muted
                autoPlay={isActive}
                playsInline
            />

            {/* Sponsored Badge */}
            <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">Sponsored</span>
                <Info size={12} className="text-gray-400" />
            </div>

            {/* Ad Overlay */}
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-6 pb-12 flex flex-col items-center text-center">

                {/* Advertiser Info */}
                <div className="flex flex-col items-center mb-4">
                    <img src={ad.advertiserAvatar} alt={ad.advertiserName} className="w-16 h-16 rounded-full border-2 border-yellow-500 mb-2 shadow-lg" />
                    <h3 className="text-xl font-bold text-white">{ad.advertiserName}</h3>
                    <p className="text-sm text-gray-300 max-w-[80%]">{ad.description}</p>
                </div>

                {/* CTA Button */}
                <a
                    href={ad.ctaLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full max-w-[200px] bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-transform hover:scale-105 shadow-xl animate-pulse"
                >
                    {ad.ctaText}
                    <ExternalLink size={18} />
                </a>

                <p className="text-[10px] text-gray-500 mt-4 uppercase tracking-widest">Advertisement</p>
            </div>
        </div>
    );
}
