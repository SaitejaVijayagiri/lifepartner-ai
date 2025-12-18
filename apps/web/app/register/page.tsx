'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

import { Eye, EyeOff } from 'lucide-react';

const TESTIMONIALS = [
    { quote: "I met my soulmate here. The AI just understood us.", author: "Priya & Rahul, Mumbai" },
    { quote: "Finally, a platform that values privacy and tradition.", author: "Dr. Arjun, Bangalore" },
    { quote: "Simple, elegant, and effective. Highly recommended.", author: "Sneha, Delhi" }
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ full_name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            setActiveTestimonial(prev => (prev + 1) % TESTIMONIALS.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const [showOtp, setShowOtp] = useState(false);
    const [otp, setOtp] = useState('');

    const handleRegister = async () => {
        try {
            if (!form.full_name || !form.email || !form.password) {
                alert("Please fill in all fields.");
                return;
            }
            setLoading(true);
            const res = await api.auth.register(form);

            if (res.requiresVerification) {
                setShowOtp(true);
            } else if (res.token) {
                // Fallback for old flow
                localStorage.setItem('token', res.token);
                localStorage.setItem('userId', res.userId);
                router.push('/onboarding');
            }
        } catch (err: any) {
            alert(err.message || 'Registration failed.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const res = await api.auth.verifyOtp({ email: form.email, otp });
            if (res.token) {
                localStorage.setItem('token', res.token);
                localStorage.setItem('userId', res.userId);
                router.push('/onboarding');
            }
        } catch (err: any) {
            alert('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (showOtp) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl text-center space-y-6">
                    <h2 className="text-2xl font-bold">Check your Email</h2>
                    <p className="text-gray-600">We sent a 6-digit code to <strong>{form.email}</strong></p>

                    <Input
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="Enter 6-digit OTP"
                        className="text-center text-2xl tracking-widest"
                        maxLength={6}
                    />

                    <Button
                        onClick={handleVerifyOtp}
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold"
                        disabled={loading || otp.length < 6}
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex font-sans bg-white overflow-hidden">
            {/* Left Panel: Real Matrimony Image */}
            <div className="hidden lg:block w-5/12 relative h-full">
                <img
                    src="/assets/signup-couple.jpg"
                    alt="Indian Couple Holding Hands"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-[20s] hover:scale-110" // Subtle zoom effect
                />
                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-indigo-900/40 to-transparent flex flex-col justify-end p-12 text-white">
                    <div className="mb-8">
                        <h1 className="text-4xl font-extrabold tracking-tight mb-4">LifePartner AI</h1>
                        <p className="text-xl text-indigo-100 font-light mb-8 opacity-90">
                            "Where tradition meets technology. Find your perfect match today."
                        </p>

                        {/* Testimonial Quote */}
                        <div className="border-l-4 border-indigo-500 pl-4 py-2">
                            <p className="text-lg italic font-medium mb-2 opacity-95">"{TESTIMONIALS[activeTestimonial].quote}"</p>
                            <p className="text-sm font-bold uppercase tracking-wider text-indigo-300">{TESTIMONIALS[activeTestimonial].author}</p>
                        </div>
                    </div>

                    <div className="flex space-x-2">
                        {TESTIMONIALS.map((_, i) => (
                            <div key={i} className={`h-1 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-white' : 'w-2 bg-white/40'}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel: Clean Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-8 bg-slate-50 relative">
                <div className="max-w-md w-full bg-white p-10 rounded-2xl shadow-xl space-y-8 animate-in fade-in slide-in-from-right-8 duration-700">
                    <div className="text-center">
                        <h2 className="text-3xl font-bold text-gray-900">Create Account</h2>
                        <p className="text-gray-500 mt-2">Begin your journey to a happy marriage.</p>
                    </div>

                    <div className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Full Name</label>
                            <Input
                                placeholder="e.g. Aditi Rao"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Email Address</label>
                            <Input
                                type="email"
                                placeholder="aditi@example.com"
                                className="h-12 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                                value={form.email}
                                onChange={e => setForm({ ...form, email: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-gray-700">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min 8 characters"
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

                    <Button
                        className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-lg font-bold tracking-wide shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? 'Creating Profile...' : 'Sign Up Free'}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or Continue With</span>
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

                    <p className="text-center text-sm text-gray-600 pt-4">
                        Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
