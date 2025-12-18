'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await api.auth.login(form);
            if (res.token) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('userId', res.userId);
                router.push('/dashboard');
            }
        } catch (err: any) {
            console.error("Login failed", err);
            setError(err.message || 'Invalid email or password.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-white font-sans lg:overflow-hidden">
            {/* Left: Matrimony Image (Banner on Mobile, Sidebar on Desktop) */}
            <div className="w-full lg:w-5/12 h-64 lg:h-full relative flex-shrink-0">
                <style jsx global>{`
                    input::-ms-reveal,
                    input::-ms-clear {
                        display: none;
                    }
                `}</style>
                <img
                    src="https://images.unsplash.com/photo-1621252179027-94459d27d3ee?q=80&w=2070&auto=format&fit=crop"
                    alt="Happy Indian Couple"
                    className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-indigo-900/20 to-transparent flex items-end p-8 lg:p-12">
                    <div className="text-white mb-6 lg:mb-10">
                        <h2 className="text-2xl lg:text-4xl font-extrabold mb-2 lg:mb-4 leading-tight">Welcome Back to <br />Your Journey</h2>
                        <div className="w-16 h-1 bg-indigo-500 mb-4 lg:mb-6"></div>
                        <p className="text-sm lg:text-xl opacity-90 font-light hidden lg:block">
                            "Marriage is a mosaic you build with your spouse. Millions of tiny moments that create your love story."
                        </p>
                    </div>
                </div>
            </div>

            {/* Right: Login Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 lg:p-12 bg-slate-50">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                    <div className="text-center lg:text-left">
                        <h1 className="text-3xl font-extrabold text-gray-900">Sign In</h1>
                        <p className="mt-2 text-gray-600">Please enter your details to continue.</p>
                    </div>

                    <div className="space-y-6 mt-8">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <div className="flex justify-between">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <Link href="/forgot-password" className="text-sm text-indigo-600 font-semibold hover:underline">Forgot Password?</Link>
                            </div>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all pr-10"
                                    value={form.password}
                                    onChange={e => setForm({ ...form, password: e.target.value })}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                                >
                                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 rounded-md bg-red-50 text-red-600 text-sm font-medium flex items-center">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" /></svg>
                            {error}
                        </div>
                    )}

                    <Button
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                        onClick={handleLogin}
                        disabled={loading}
                    >
                        {loading ? 'Authenticating...' : 'Sign In'}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or Sign In With</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={() => {
                                const clientId = "326304538770-5tskm10njnb8e5kkh1gdp4as7sb7km9b.apps.googleusercontent.com";
                                const redirectUri = "http://localhost:3005/auth/callback/google";
                                const startUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=email%20profile%20openid&access_type=offline&prompt=consent`;
                                window.location.href = startUrl;
                            }}
                            className="w-full flex items-center justify-center h-12 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-2" alt="Google" />
                            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-600 mt-8">
                        Don't have an account? <Link href="/register" className="text-indigo-600 font-bold hover:underline">Create an account</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
