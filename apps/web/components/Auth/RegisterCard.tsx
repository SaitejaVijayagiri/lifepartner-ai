'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/Toast';

interface RegisterCardProps {
    onRegister: (data: any) => Promise<void>;
    onGoogle: () => Promise<void>;
}

export default function RegisterCard({ onRegister, onGoogle }: RegisterCardProps) {
    const toast = useToast();
    const [method, setMethod] = useState<'mobile' | 'email'>('mobile');
    const [step, setStep] = useState<'details' | 'otp'>('details');
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        fullName: '',
        identifier: '', // email or phone
        password: '',
        otp: ''
    });

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleContinue = async () => {
        setLoading(true);
        // Simulate OTP Send
        if (step === 'details') {
            if (formData.fullName && formData.identifier && formData.password) {
                setTimeout(() => {
                    setStep('otp');
                    setLoading(false);
                }, 1000);
            } else {
                setLoading(false);
                toast.error("Please fill all fields properly.");
            }
        } else {
            // Verify OTP
            await onRegister({
                method,
                ...formData
            });
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden font-sans">
            {/* Header */}
            <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-6 text-white text-center">
                <h2 className="text-2xl font-bold">Create Account</h2>
                <p className="text-indigo-100 text-sm opacity-90">Join the premium matrimony network</p>
            </div>

            <div className="p-8">
                {/* Tabs */}
                {step === 'details' && (
                    <div className="flex bg-gray-100 p-1 rounded-lg mb-6">
                        <button
                            onClick={() => setMethod('mobile')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'mobile' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Mobile Number
                        </button>
                        <button
                            onClick={() => setMethod('email')}
                            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${method === 'email' ? 'bg-white shadow text-indigo-700' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Email Address
                        </button>
                    </div>
                )}

                {/* Body */}
                <div className="space-y-5">
                    {step === 'details' ? (
                        <>
                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Full Name</label>
                                <Input
                                    className="h-11 bg-gray-50"
                                    placeholder="e.g. Rahul Verma"
                                    value={formData.fullName}
                                    onChange={(e) => handleChange('fullName', e.target.value)}
                                />
                            </div>

                            {method === 'mobile' ? (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Mobile Number</label>
                                    <div className="flex">
                                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-200 bg-gray-100 text-gray-500 font-medium">+91</span>
                                        <Input
                                            className="rounded-l-none h-11 bg-gray-50"
                                            placeholder="98765 43210"
                                            value={formData.identifier}
                                            onChange={(e) => handleChange('identifier', e.target.value)}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-400">We will send an OTP for verification.</p>
                                </div>
                            ) : (
                                <div className="space-y-1">
                                    <label className="text-sm font-semibold text-gray-700">Email Address</label>
                                    <Input
                                        className="h-11 bg-gray-50"
                                        type="email"
                                        placeholder="rahul@example.com"
                                        value={formData.identifier}
                                        onChange={(e) => handleChange('identifier', e.target.value)}
                                    />
                                </div>
                            )}

                            <div className="space-y-1">
                                <label className="text-sm font-semibold text-gray-700">Password</label>
                                <Input
                                    className="h-11 bg-gray-50"
                                    type="password"
                                    placeholder="Min 8 characters"
                                    value={formData.password}
                                    onChange={(e) => handleChange('password', e.target.value)}
                                />
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-4 space-y-4">
                            <div className="bg-indigo-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-2xl">📱</div>
                            <div>
                                <h3 className="text-lg font-bold">Verify {method === 'mobile' ? 'Mobile' : 'Email'}</h3>
                                <p className="text-sm text-gray-500">Enter the 4-digit code sent to {formData.identifier}</p>
                            </div>
                            <Input
                                className="text-center text-2xl tracking-[1em] h-14 font-bold uppercase"
                                maxLength={4}
                                placeholder="0000"
                                value={formData.otp}
                                onChange={(e) => handleChange('otp', e.target.value)}
                            />
                            <button onClick={() => setStep('details')} className="text-sm text-indigo-600 hover:underline">Change Number?</button>
                        </div>
                    )}

                    <Button
                        onClick={handleContinue}
                        className="w-full h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-500/30 transition-all font-semibold"
                        disabled={loading}
                    >
                        {loading ? 'Processing...' : (step === 'details' ? 'Continue' : 'Verify & Create Account')}
                    </Button>

                    {/* Divider */}
                    {step === 'details' && (
                        <>
                            <div className="relative flex py-2 items-center">
                                <div className="flex-grow border-t border-gray-200"></div>
                                <span className="flex-shrink-0 mx-4 text-gray-400 text-xs font-bold uppercase">Or Register With</span>
                                <div className="flex-grow border-t border-gray-200"></div>
                            </div>

                            <button onClick={onGoogle} className="w-full flex items-center justify-center h-11 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 transition-colors">
                                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-5 h-5 mr-3" alt="Google" />
                                <span className="text-sm font-medium text-gray-700">Continue with Google</span>
                            </button>
                        </>
                    )}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 p-4 text-center border-t border-gray-100">
                <p className="text-xs text-gray-500">
                    By confirming, you agree to our <a href="#" className="underline">Terms</a> & <a href="#" className="underline">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
