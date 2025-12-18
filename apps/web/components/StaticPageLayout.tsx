'use client';

import Link from 'next/link';
import Footer from '@/components/Footer';

export default function StaticPageLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
            {/* Shared Navbar */}
            <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-100 sticky top-0 z-50 backdrop-blur-md bg-white/90">
                <Link href="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
                    LifePartner AI
                </Link>
                <div className="space-x-4">
                    <Link href="/login" className="text-sm font-medium hover:text-indigo-600">Login</Link>
                    <Link href="/register">
                        <button className="bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2 rounded-lg text-sm font-semibold transition-colors shadow-sm">
                            Sign Up Free
                        </button>
                    </Link>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Shared Footer */}
            <Footer />
        </div>
    );
}
