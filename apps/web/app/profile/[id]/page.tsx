'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { ArrowLeft, MapPin, Briefcase, GraduationCap, Heart, MessageCircle, Star, Calendar, Ruler, CheckCircle, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProfileView() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            // Mock fetch or real fetch
            // const data = await api.matches.getById(params.id);
            // setProfile(data);
            // Mocking for UI dev
            setTimeout(() => {
                setProfile({
                    id: params.id,
                    name: 'Aditi Rao',
                    age: 28,
                    role: 'Product Designer',
                    location: { city: 'Bangalore, India' },
                    height: "5'5\"",
                    photos: [
                        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80',
                        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800&q=80',
                        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80'
                    ],
                    bio: "Passionate about design and traveling. Looking for someone who values tradition but has a modern outlook. I love painting, classical music, and spending weekends exploring new cafes.",
                    about: {
                        religion: "Hindu",
                        caste: "Brahmin",
                        motherTongue: "Kannada",
                        maritalStatus: "Never Married",
                        diet: "Vegetarian"
                    },
                    education: "B.Des, NIFT Bangalore",
                    profession: "Senior UX Designer at Flipkart",
                    family: "Father is suitable for government service, Mother is a homemaker. 1 younger brother."
                });
                setLoading(false);
            }, 1000);
        };
        fetchProfile();
    }, [params.id]);

    if (loading) return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 pb-20 font-sans">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 py-3 flex items-center gap-4">
                <button onClick={() => router.back()} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ArrowLeft size={24} className="text-gray-700" />
                </button>
                <span className="font-heading font-bold text-lg text-gray-900">Profile Details</span>
            </div>

            <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">

                {/* 1. Hero Card (Biodata Style) */}
                <div className="bg-white rounded-[2rem] shadow-xl overflow-hidden border border-white">
                    <div className="grid md:grid-cols-2 gap-0">
                        {/* Photo Carousel (Simplified) */}
                        <div className="h-[500px] bg-gray-100 relative">
                            <img src={profile.photos[0]} className="w-full h-full object-cover" alt={profile.name} />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-8">
                                <div className="text-white">
                                    <h1 className="text-4xl font-heading font-bold mb-2">{profile.name}, {profile.age}</h1>
                                    <div className="flex items-center gap-2 text-sm font-medium opacity-90">
                                        <MapPin size={16} /> {profile.location.city}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Quick Specs */}
                        <div className="p-8 md:p-12 flex flex-col justify-center bg-white relative">
                            {/* Ornamental Corner */}
                            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                                <img src="https://www.svgrepo.com/show/486228/ornamental-design.svg" className="w-32 h-32" />
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 text-green-700 text-xs font-bold uppercase tracking-wider border border-green-100">
                                    <Shield size={14} /> ID Verified
                                </div>

                                <div className="space-y-4 text-gray-700">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><Briefcase size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Profession</p>
                                            <p className="font-semibold">{profile.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600"><GraduationCap size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Education</p>
                                            <p className="font-semibold">{profile.education}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600"><Ruler size={20} /></div>
                                        <div>
                                            <p className="text-xs text-gray-400 uppercase tracking-wide font-bold">Height</p>
                                            <p className="font-semibold">{profile.height}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 flex gap-4">
                                    <Button className="flex-1 h-12 bg-primary hover:bg-indigo-700 shadow-lg shadow-indigo-200 rounded-xl font-bold text-base">
                                        <Heart className="mr-2" size={20} /> Send Interest
                                    </Button>
                                    <Button variant="outline" className="h-12 w-12 rounded-xl border-gray-200">
                                        <Star size={20} />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. About & Family */}
                <div className="grid md:grid-cols-3 gap-8">
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-heading font-bold text-2xl text-gray-900 mb-6">About Me</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">{profile.bio}</p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-heading font-bold text-2xl text-gray-900 mb-6">Family Background</h3>
                            <p className="text-gray-600 leading-relaxed text-lg">{profile.family}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-4">Personal Details</h3>
                            <ul className="space-y-3">
                                {Object.entries(profile.about).map(([key, value]: any) => (
                                    <li key={key} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                                        <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="font-medium text-gray-900">{value}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
