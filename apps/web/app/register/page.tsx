'use client';
import { useToast } from '@/components/ui/Toast';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';

import { Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';

const TESTIMONIALS = [
    { quote: "I met my soulmate here. The AI just understood us.", author: "Priya & Rahul, Mumbai" },
    { quote: "Finally, a platform that values privacy and tradition.", author: "Dr. Arjun, Bangalore" },
    { quote: "Simple, elegant, and effective. Highly recommended.", author: "Sneha, Delhi" }
];

export default function RegisterPage() {
    const router = useRouter();
    const [form, setForm] = useState({ full_name: '', email: '', password: '', referralCode: '' });
    const [loading, setLoading] = useState(false);
    const [activeTestimonial, setActiveTestimonial] = useState(0);
    const [showPassword, setShowPassword] = useState(false);
    const toast = useToast();

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
                toast.error("Please fill in all fields.");
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
            toast.error(err.message || 'Registration failed.');
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
            toast.error('Invalid OTP');
        } finally {
            setLoading(false);
        }
    };

    if (showOtp) {
        return (
            <div className="h-screen flex items-center justify-center bg-slate-50 font-sans text-gray-900 relative overflow-hidden">
                {/* Background Blobs for OTP Screen - Light Mode */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                    <div className="absolute top-[20%] left-[30%] w-[50%] h-[50%] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-pulse"></div>
                </div>

                <div className="max-w-md w-full bg-white p-10 rounded-3xl shadow-xl text-center space-y-6 ring-1 ring-gray-100">
                    <div className="mb-4 flex justifying-center">
                        <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto text-indigo-600 shadow-sm">
                            <Sparkles size={32} />
                        </div>
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900">Verify Your Email</h2>
                    <p className="text-gray-500">We sent a 6-digit code to <br /><strong className="text-gray-900">{form.email}</strong></p>

                    <Input
                        value={otp}
                        onChange={e => setOtp(e.target.value)}
                        placeholder="000000"
                        className="text-center text-3xl tracking-[1em] font-mono h-16 bg-gray-50 border-gray-200 text-gray-900 focus:border-indigo-500 rounded-xl"
                        maxLength={6}
                    />

                    <Button
                        onClick={handleVerifyOtp}
                        className="w-full h-14 bg-indigo-600 text-white hover:bg-indigo-700 text-lg font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02]"
                        disabled={loading || otp.length < 6}
                    >
                        {loading ? 'Verifying...' : 'Verify & Continue'}
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row font-sans bg-slate-50 text-gray-900 relative overflow-hidden">
            {/* Noise Texture Overlay */}
            <div className="fixed inset-0 opacity-[0.03] pointer-events-none z-50 mix-blend-multiply"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}>
            </div>

            <style jsx global>{`
                @keyframes blob {
                  0% { transform: translate(0px, 0px) scale(1); }
                  33% { transform: translate(30px, -50px) scale(1.1); }
                  66% { transform: translate(-20px, 20px) scale(0.9); }
                  100% { transform: translate(0px, 0px) scale(1); }
                }
                .animate-blob {
                  animation: blob 10s infinite alternate;
                }
                @keyframes scroll-up {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(-50%); }
                }
                .animate-scroll-vertical {
                    animation: scroll-up 20s linear infinite;
                }
                .animate-scroll-vertical:hover {
                    animation-play-state: paused;
                }
                input::-ms-reveal,
                input::-ms-clear {
                    display: none;
                }
            `}</style>

            {/* Background Aurora - Light Mode */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-50">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-200/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-60 animate-blob animation-delay-2000"></div>
            </div>

            {/* Left Panel: Real Matrimony Image */}
            <div className="hidden lg:block w-full lg:w-5/12 h-64 lg:h-full relative flex-shrink-0 lg:border-r border-gray-200 overflow-hidden group">
                <div className="absolute inset-0 bg-purple-900/10 mix-blend-multiply z-10"></div>
                <img
                    src="/images/register-hero-wiki.jpg"
                    alt="Wedding Promise"
                    className="absolute inset-0 w-full h-full object-cover grayscale-[0%] group-hover:scale-105 transition-all duration-[20s]"
                />

                {/* Gradient Overlay for Text Readability */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex flex-col justify-end p-8 lg:p-12 text-white z-20">
                    <div className="mb-4 lg:mb-8">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center mb-4 border border-white/30">
                            <Sparkles size={20} className="text-white" />
                        </div>
                        <h1 className="text-2xl lg:text-4xl font-extrabold tracking-tight mb-2 lg:mb-4 drop-shadow-md">LifePartner AI</h1>
                        <p className="text-sm lg:text-xl text-indigo-100 font-light mb-6 opacity-90 hidden lg:block">
                            "Where tradition meets technology. Find your perfect match today."
                        </p>

                        {/* Scrolling Testimonials - Vertical Marquee */}
                        <div className="h-48 overflow-hidden relative mask-linear-gradient">
                            <div className="animate-scroll-vertical space-y-4">
                                {[...TESTIMONIALS, ...TESTIMONIALS].map((t, i) => (
                                    <div key={i} className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 shadow-lg">
                                        <p className="text-sm italic font-medium mb-2 opacity-95 leading-relaxed">"{t.quote}"</p>
                                        <div className="flex items-center gap-2">
                                            <div className="w-4 h-1 bg-indigo-400 rounded-full"></div>
                                            <p className="text-xs font-bold uppercase tracking-wider text-indigo-200">{t.author}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <Link href="/" className="absolute top-8 left-8 z-30 flex items-center gap-2 text-white/70 hover:text-white transition-colors text-sm font-bold uppercase tracking-widest bg-black/20 px-3 py-1.5 rounded-full backdrop-blur-sm hover:bg-black/30">
                    <ArrowLeft size={16} /> Back to Home
                </Link>
            </div>

            {/* Right Panel: Clean Form */}
            <div className="w-full lg:w-7/12 flex items-center justify-center p-4 relative z-10">
                <div className="max-w-sm w-full bg-white p-8 rounded-3xl shadow-2xl space-y-6 animate-in fade-in slide-in-from-right-8 duration-700 ring-1 ring-gray-100">
                    <div className="text-center">
                        <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h2>
                        <p className="text-gray-500 mt-2 text-sm font-medium">Begin your journey to a happy marriage.</p>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Full Name</label>
                            <Input
                                placeholder="e.g. Aditi Rao"
                                className="h-12 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl font-medium"
                                value={form.full_name}
                                onChange={e => setForm({ ...form, full_name: e.target.value })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Email Address</label>
                            <Input
                                type="email"
                                placeholder="aditi@example.com"
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
                                    placeholder="Min 8 characters"
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
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">Referral Code (Optional)</label>
                            <Input
                                placeholder="Have a code?"
                                className="h-12 bg-indigo-50 border-indigo-100 text-indigo-700 placeholder:text-indigo-300 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all rounded-xl font-bold uppercase tracking-widest text-sm"
                                value={form.referralCode}
                                onChange={e => setForm({ ...form, referralCode: e.target.value })}
                            />
                            {form.referralCode && <p className="text-[10px] text-green-600 font-bold animate-pulse mt-1 ml-1">🎁 +20 Coins Bonus Applied!</p>}
                        </div>
                    </div>

                    <Button
                        className="w-full h-12 bg-indigo-600 text-white hover:bg-indigo-700 text-lg font-bold tracking-wide shadow-lg shadow-indigo-200 transition-all hover:scale-[1.02] rounded-xl"
                        onClick={handleRegister}
                        disabled={loading}
                    >
                        {loading ? 'Creating Profile...' : 'Sign Up Free'}
                    </Button>

                    <div className="relative flex py-2 items-center">
                        <div className="flex-grow border-t border-gray-200"></div>
                        <span className="flex-shrink-0 mx-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">Or Continue With</span>
                        <div className="flex-grow border-t border-gray-200"></div>
                    </div>

                    <div>
                        <button
                            onClick={() => {
                                const clientId = "326304538770-5tskm10njnb8e5kkh1gdp4as7sb7km9b.apps.googleusercontent.com";
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
                        Already have an account? <Link href="/login" className="text-indigo-600 font-bold hover:text-indigo-800 transition-colors hover:underline decoration-indigo-200 underline-offset-4">Log in</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
