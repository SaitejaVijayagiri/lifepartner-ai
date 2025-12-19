'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { Eye, EyeOff, ArrowLeft, Sparkles } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        try {
            setError('');
            setLoading(true);
            const res = await api.auth.login(form);
            localStorage.setItem('token', res.token);
            localStorage.setItem('userId', res.userId);
            if (res.isNewUser) {
                router.push('/onboarding');
            } else {
                router.push('/dashboard');
            }
        } catch (err: any) {
            setError(err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row font-sans bg-slate-50 text-gray-900 overflow-hidden">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <style jsx global>{`
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }
            `}</style>

            {/* Left Panel: Image */}
            <div className="hidden lg:block w-full lg:w-5/12 h-64 lg:h-full relative flex-shrink-0 lg:border-r border-gray-200 overflow-hidden group">
                {/* Premium Overlay */}
                <div className="absolute inset-0 bg-indigo-900/10 mix-blend-multiply z-10 transition-opacity duration-700 group-hover:opacity-0"></div>
                <img
                    src="/images/login-hero-final.jpg"
                    alt="Royal Indian Wedding"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0%] group-hover:scale-105 transition-all duration-[20s]"
                />

                {/* Text Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-12 text-white z-20">
                    <div className="mb-8">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center mb-6 shadow-lg border border-white/20">
                            <Sparkles size={24} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4 drop-shadow-lg leading-tight">
                            Start Your Journey <br /> To Forever.
                        </h1>
                        <p className="text-lg text-indigo-100 font-light opacity-90 max-w-sm">
                            "The best thing to hold onto in life is each other."
                        </p>
                    </div>
                </div>

                <Link href="/" className="absolute top-8 left-8 z-30 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest backdrop-blur-sm px-4 py-2 rounded-full hover:bg-white/10">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </div>

            {/* Right Panel: Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-4 relative z-10 bg-slate-50">
                {/* Background Blobs for specific interest */}
                <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse delay-1000"></div>

                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl space-y-8 relative z-20 border border-gray-100 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Please enter your details to sign in.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email</label>
                            <Input
                                placeholder="name@example.com"
                                className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl font-medium"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all pr-10 rounded-xl font-medium"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600 focus:outline-none transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="flex justify-end pt-1">
                                <Link href="/forgot-password" className="text-xs font-bold text-indigo-600 hover:text-indigo-700 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-xl bg-red-50 border border-red-100 flex items-center gap-3 text-red-600 text-sm font-medium animate-in fade-in zoom-in duration-300">
                            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 text-lg font-bold tracking-wide shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] active:scale-[0.98] rounded-xl"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? (
                            <div className="flex items-center justify-center gap-2">
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Signing In...</span>
                            </div>
                        ) : 'Sign In'}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or Continue With</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
                                const redirectUri = `${process.env.NEXT_PUBLIC_FRONTEND_URL || window.location.origin}/auth/callback/google`;
                                const startUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile%20openid&access_type=offline&prompt=consent`;
                                window.location.href = startUrl;
                            }}
                            className="w-full flex items-center justify-center h-12 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all group shadow-sm hover:shadow-md hover:border-gray-300"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform" alt="Google" />
                            <span className="text-sm font-bold text-gray-600 group-hover:text-gray-900">Continue with Google</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 pt-2">
                        Don't have an account? <Link href="/register" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors hover:underline decoration-indigo-200 underline-offset-4">Create one for free</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
