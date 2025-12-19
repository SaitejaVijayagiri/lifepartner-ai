'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/Toast';
import VoiceRecorder from './VoiceRecorder';
import { api } from '@/lib/api';

const STEPS = [
    { id: 'welcome', title: 'Welcome' },
    { id: 'basics', title: 'Personal Details' },
    { id: 'horoscope', title: 'Horoscope' },
    { id: 'career', title: 'Career & Education' },
    { id: 'family', title: 'Family Background' },
    { id: 'lifestyle', title: 'Lifestyle & Habits' },
    { id: 'partner', title: 'Partner Preferences' },
    { id: 'voice', title: 'Voice Bio (New)' },
    { id: 'photos', title: 'Upload Photos' },
];

const QUOTES = {
    welcome: "Your journey to finding the perfect life partner begins here.",
    basics: "Tell us about yourself. Honesty is the foundation of a great relationship.",
    horoscope: "Stars align for those who believe. Share your astrological details.",
    career: "Ambition meets compatibility. Share your professional journey.",
    family: "Family is where life begins and love never ends.",
    lifestyle: " Habits shape our lives. Let's find someone who matches your rhythm.",
    partner: "Describe your soulmate. We'll use AI to find them.",
    voice: "Don't just be a photo. Let them fall in love with your voice.",
    photos: "A picture is worth a thousand words. Add your best moments."
};

// Gradient BGs for Left Panel
const GRADIENTS = {
    welcome: "from-indigo-600 to-purple-700",
    basics: "from-blue-600 to-cyan-600",
    horoscope: "from-violet-600 to-fuchsia-700",
    career: "from-emerald-600 to-teal-700",
    family: "from-orange-500 to-red-600",
    lifestyle: "from-lime-600 to-green-700",
    partner: "from-pink-600 to-rose-600",
    voice: "from-indigo-600 to-violet-800",
    photos: "from-indigo-500 to-blue-600",
};

export default function ProfileWizard({ onComplete }: { onComplete: (data: any) => void }) {
    const toast = useToast();
    const [currentStep, setCurrentStep] = useState(0);
    const [vibeResult, setVibeResult] = useState<any>(null); // For AI Feedback
    const [direction, setDirection] = useState('forward');
    const [data, setData] = useState<any>({
        // Basics
        name: '', age: '', gender: 'Male', height: '', city: '', country: 'India',
        // Horoscope
        zodiacSign: '', nakshatra: '', manglik: 'No', birthTime: '',
        // Religion
        religion: 'Hindu', caste: '', interCasteOpen: false,
        // Career
        education: 'Bachelors', profession: '', income: '', company: '',
        // Family
        familyType: 'Nuclear', familyValues: 'Moderate', fatherOccupation: '', motherTongue: 'English',
        // Lifestyle
        diet: 'Veg', smoke: 'No', drink: 'No',
        // Partner
        partnerAgeRange: '', partnerHeightRange: '', partnerIncome: '', prompt: '',
        // Photos
        photos: [],
        voiceBioUrl: ''
    });

    const update = (field: string, val: any) => setData((prev: any) => ({ ...prev, [field]: val }));

    const handleNext = () => {
        if (!validateStep()) return;
        setDirection('forward');
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(s => s + 1);
        } else {
            onComplete(data);
        }
    };

    const handleBack = () => {
        setDirection('backward');
        setCurrentStep(s => s - 1);
    };

    const validateStep = () => {
        const stepId = STEPS[currentStep].id;
        if (stepId === 'basics') {
            if (!(data.name && data.age && data.height && data.city)) {
                toast.error("Please fill in required fields (*)");
                return false;
            }
        }
        if (stepId === 'career') {
            if (!(data.profession && data.education)) {
                toast.error("Please fill in required fields (*)");
                return false;
            }
        }
        if (stepId === 'photos') {
            if (!(data.photos && data.photos.length > 0)) {
                toast.error("Please upload at least one photo");
                return false;
            }
        }
        return true; // Others optional or handled
    };

    const stepId = STEPS[currentStep].id;

    return (
        <div className="flex w-full h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
            {/* LEFT PANEL: Visual & Quote */}
            <div className={`w-1/3 text-white p-12 flex flex-col justify-between relative transition-all duration-700 bg-gradient-to-br ${GRADIENTS[stepId as keyof typeof GRADIENTS] || "from-gray-700 to-gray-900"}`}>
                <div className="z-10">
                    <h1 className="text-3xl font-bold mb-2">LifePartner AI</h1>
                    <div className="h-1 w-12 bg-white/50 rounded-full"></div>
                </div>

                <div className="z-10">
                    <h2 className="text-4xl font-bold mb-4 capitalize animate-in slide-in-from-left duration-700 key={stepId}">{STEPS[currentStep].title}</h2>
                    <p className="text-lg text-white/90 leading-relaxed font-light italic">"{QUOTES[stepId as keyof typeof QUOTES]}"</p>
                </div>

                <div className="z-10 flex gap-2">
                    {STEPS.map((_, idx) => (
                        <div key={idx} className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-8 bg-white' : 'w-2 bg-white/30'}`} />
                    ))}
                </div>

                {/* Decorative Circles */}
                <div className="absolute top-[-20%] right-[-20%] w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
            </div>

            {/* RIGHT PANEL: Form */}
            <div className="w-2/3 p-12 flex flex-col relative overflow-y-auto">
                <div className="flex-1 max-w-2xl mx-auto w-full">
                    {/* STEP 0: WELCOME */}
                    {stepId === 'welcome' && (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-4xl mb-4">💍</div>
                            <h2 className="text-3xl font-bold text-gray-900">Let's Create Your Profile</h2>
                            <p className="text-gray-500 max-w-md">We need a few details to find your perfect match. The process takes about 2 minutes.</p>
                            <Button onClick={handleNext} className="w-48 h-12 text-lg bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-xl transition-all">Get Started</Button>
                        </div>
                    )}

                    {/* STEP 1: BASICS */}
                    {stepId === 'basics' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <Input label="Full Name *" value={data.name} onChange={e => update('name', e.target.value)} />
                                <Input label="Age *" type="number" value={data.age} onChange={e => update('age', e.target.value)} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Gender</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.gender} onChange={e => update('gender', e.target.value)}>
                                        <option>Male</option><option>Female</option>
                                    </select>
                                </div>
                                <Input label="Height (e.g. 5'9) *" value={data.height} onChange={e => update('height', e.target.value)} />
                                <Input label="Current City *" value={data.city} onChange={e => update('city', e.target.value)} />
                                <Input label="Country" value={data.country} onChange={e => update('country', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP 2: HOROSCOPE (Detailed) */}
                    {stepId === 'horoscope' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Religion</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.religion} onChange={e => update('religion', e.target.value)}>
                                        <option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option><option>Jain</option><option>Other</option>
                                    </select>
                                </div>
                                <Input label="Caste / Community" placeholder="e.g. Brahmin - Iyer" value={data.caste} onChange={e => update('caste', e.target.value)} />
                                <Input label="Gothra (Optional)" placeholder="e.g. Bharadwaj" value={data.gothra} onChange={e => update('gothra', e.target.value)} />
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Manglik</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.manglik} onChange={e => update('manglik', e.target.value)}>
                                        <option>No</option><option>Yes</option><option>Don't Know</option>
                                    </select>
                                </div>
                                <Input label="Birth Place" placeholder="e.g. Chennai, TN" value={data.birthPlace} onChange={e => update('birthPlace', e.target.value)} />
                                <Input label="Time of Birth" placeholder="e.g. 10:30 AM" value={data.birthTime} onChange={e => update('birthTime', e.target.value)} />
                                <Input label="Zodiac & Nakshatra" placeholder="e.g. Libra, Rohini" value={data.nakshatra} onChange={e => update('nakshatra', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP 3: CAREER & EDU */}
                    {stepId === 'career' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-1 gap-6">
                                <Input label="Profession / Job Title *" value={data.profession} onChange={e => update('profession', e.target.value)} />
                                <Input label="Company Name" value={data.company} onChange={e => update('company', e.target.value)} />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Highest Education</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.education} onChange={e => update('education', e.target.value)}>
                                        <option>Bachelors</option><option>Masters</option><option>Doctorate</option><option>High School</option>
                                    </select>
                                </div>
                                <Input label="College / University" placeholder="e.g. IIT Bombay" value={data.college} onChange={e => update('college', e.target.value)} />
                                <Input label="Degree Details" placeholder="e.g. B.Tech CS" value={data.degree} onChange={e => update('degree', e.target.value)} />
                                <Input label="Annual Income" placeholder="e.g. 15 LPA" value={data.income} onChange={e => update('income', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP: FAMILY */}
                    {stepId === 'family' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Family Type</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.familyType} onChange={e => update('familyType', e.target.value)}>
                                        <option>Nuclear</option><option>Joint</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Family Values</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.familyValues} onChange={e => update('familyValues', e.target.value)}>
                                        <option>Moderate</option><option>Traditional</option><option>Orthodox</option><option>Liberal</option>
                                    </select>
                                </div>
                                <Input label="Father's Occupation" value={data.fatherOccupation} onChange={e => update('fatherOccupation', e.target.value)} />
                                <Input label="Mother's Occupation" value={data.motherOccupation} onChange={e => update('motherOccupation', e.target.value)} />
                                <Input label="Brothers (Count)" placeholder="e.g. 1" type="number" value={data.brothers} onChange={e => update('brothers', e.target.value)} />
                                <Input label="Sisters (Count)" placeholder="e.g. 0" type="number" value={data.sisters} onChange={e => update('sisters', e.target.value)} />
                                <Input label="Mother Tongue" value={data.motherTongue} onChange={e => update('motherTongue', e.target.value)} />
                                <Input label="Native Place / Ancestral Origin" placeholder="e.g. Kanchipuram" value={data.nativePlace} onChange={e => update('nativePlace', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP: LIFESTYLE & INTERESTS */}
                    {stepId === 'lifestyle' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="grid grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Diet</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.diet} onChange={e => update('diet', e.target.value)}>
                                        <option>Veg</option><option>Non-Veg</option><option>Eggetarian</option><option>Vegan</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Smoking</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.smoke} onChange={e => update('smoke', e.target.value)}>
                                        <option>No</option><option>Yes</option><option>Occasionally</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Drinking</label>
                                    <select className="w-full h-10 px-3 border rounded-md" value={data.drink} onChange={e => update('drink', e.target.value)}>
                                        <option>No</option><option>Yes</option><option>Socially</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Hobbies & Interests</label>
                                <textarea
                                    className="w-full h-24 p-3 border rounded-md bg-white"
                                    placeholder="e.g. Classical Dance, Cricket, Reading Novels, Traveling..."
                                    value={data.hobbies}
                                    onChange={e => update('hobbies', e.target.value)}
                                />
                                <p className="text-xs text-gray-400">Separate with commas</p>
                            </div>
                        </div>
                    )}

                    {/* STEP: PARTNER PREF */}
                    {stepId === 'partner' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500">
                            <div className="space-y-2">
                                <h3 className="font-semibold text-gray-900">Partner Expectations</h3>
                                <textarea
                                    className="w-full h-32 p-4 border rounded-md focus:ring-2 focus:ring-indigo-600 bg-gray-50"
                                    placeholder="Describe your ideal partner... (e.g. Someone who is ambitious, loves travel, and respects family values. Should be willing to settle in Bangalore.)"
                                    value={data.prompt}
                                    onChange={e => update('prompt', e.target.value)}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Pref Age Range" placeholder="24-29" value={data.partnerAgeRange} onChange={e => update('partnerAgeRange', e.target.value)} />
                                <Input label="Pref Height" placeholder="5'2 - 5'8" value={data.partnerHeightRange} onChange={e => update('partnerHeightRange', e.target.value)} />
                                <Input label="Min Income" placeholder="e.g. 10 LPA" value={data.partnerIncome} onChange={e => update('partnerIncome', e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* STEP: VOICE BIO */}
                    {stepId === 'voice' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500 text-center">
                            <h3 className="text-xl font-bold text-gray-900">Record an Audio Intro 🎙️</h3>
                            <p className="text-gray-500">Profiles with voice bios get 3x more responses.</p>

                            <VoiceRecorder
                                onRecordingComplete={async (blob) => {
                                    // Auto-upload on recording completion
                                    const formData = new FormData();
                                    formData.append('audio', blob, 'voice-bio.webm');
                                    try {
                                        // Ideally show "Analyzing" loading state here if upload is seemingly fast but analysis takes time.
                                        // Our VoiceRecorder likely handles loading state for upload, but we can add a local one for "AI Processing".

                                        const res = await api.profile.uploadVoiceBio(formData);
                                        if (res.audioUrl) {
                                            update('voiceBioUrl', res.audioUrl);
                                        }
                                        if (res.vibe) {
                                            // Store vibe in data or local state to show it.
                                            // Let's use a local state for the wizard to show the "Wow" factor.
                                            setVibeResult(res.vibe);
                                            toast.success("Voice Bio & AI Analysis Complete! ✨");
                                        }
                                    } catch (e) {
                                        console.error("Voice Upload Failed", e);
                                        toast.error("Failed to upload voice bio");
                                    }
                                }}
                                existingAudioUrl={data.voiceBioUrl}
                            />

                            {/* AI Vibe Result Display */}
                            {vibeResult && (
                                <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 p-4 rounded-xl border border-indigo-100 shadow-sm animate-in zoom-in-50 duration-500">
                                    <h4 className="text-sm font-bold text-indigo-600 uppercase tracking-wide mb-2">✨ AI Vibe Check</h4>
                                    <div className="text-2xl font-bold text-gray-900 mb-1">{vibeResult.vibe}</div>
                                    <p className="text-sm text-gray-600 mb-3">{vibeResult.summary}</p>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {vibeResult.tags.map((tag: string, i: number) => (
                                            <span key={i} className="px-3 py-1 bg-white text-indigo-600 text-xs font-bold rounded-full border border-indigo-200 shadow-sm">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* STEP: PHOTOS */}
                    {stepId === 'photos' && (
                        <div className="space-y-6 animate-in slide-in-from-right duration-500 text-center">
                            <div className="border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/30 p-10 flex flex-col items-center justify-center relative hover:bg-indigo-50 transition-all group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                                    onChange={async (e) => {
                                        const files = e.target.files;
                                        if (!files) return;
                                        const newPhotos: string[] = [];
                                        for (let i = 0; i < files.length; i++) {
                                            const file = files[i];
                                            const reader = new FileReader();
                                            const base64 = await new Promise((resolve) => {
                                                reader.onload = (ev) => resolve(ev.target?.result);
                                                reader.readAsDataURL(file);
                                            });
                                            newPhotos.push(base64 as string);
                                        }
                                        update('photos', [...(data.photos || []), ...newPhotos]);
                                    }}
                                />
                                <div className="w-20 h-20 bg-white shadow-md rounded-full flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform">📸</div>
                                <h3 className="text-xl font-bold text-gray-900">Upload Your Best Photos</h3>
                                <p className="text-gray-500 mt-2">Profiles with photos get 10x more matches.</p>
                            </div>

                            {/* Preview */}
                            {data.photos && data.photos.length > 0 && (
                                <div className="grid grid-cols-4 gap-4 mt-4">
                                    {data.photos.map((p: string, i: number) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden shadow-sm border group">
                                            <img src={p} className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => {
                                                    const newP = data.photos.filter((_: any, idx: number) => idx !== i);
                                                    update('photos', newP);
                                                }}
                                                className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            >✕</button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Buttons */}
                {stepId !== 'welcome' && (
                    <div className="mt-8 pt-4 border-t flex justify-between">
                        <Button variant="outline" onClick={handleBack} className="w-32">Back</Button>
                        <Button
                            onClick={handleNext}
                            className="w-32 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                            disabled={!validateStep()}
                        >
                            {currentStep === STEPS.length - 1 ? "Finish" : "Next"}
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

