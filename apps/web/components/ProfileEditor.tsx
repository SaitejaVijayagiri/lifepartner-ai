'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

interface ProfileEditorProps {
    initialData: any;
    onSave: (newData: any) => void;
    onCancel: () => void;
}

export default function ProfileEditor({ initialData, onSave, onCancel }: ProfileEditorProps) {
    const toast = useToast();
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);

    const handleChange = (section: string, field: string, value: any) => {
        if (section === 'root') {
            setFormData({ ...formData, [field]: value });
        } else {
            setFormData({
                ...formData,
                [section]: {
                    ...formData[section],
                    [field]: value
                }
            });
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const res = await api.profile.updateProfile(formData);
            if (res.success) {
                onSave(formData);
            }
        } catch (err) {
            toast.error("Failed to save profile.");
            // alert("Failed to save profile.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-indigo-600 px-4 py-3 md:px-6 md:py-4 flex justify-between items-center text-white sticky top-0 z-10">
                <h3 className="text-base md:text-lg font-bold">Edit Profile</h3>
                <button onClick={onCancel} className="bg-white/20 hover:bg-white/30 p-2 rounded-full text-white transition-colors">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>

            <div className="p-6 space-y-8 max-h-[70vh] overflow-y-auto">
                {/* Photo Upload Section */}
                {/* Photo Gallery Upload Section */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Profile Photos</h4>

                    <div className="border-2 border-dashed border-indigo-200 rounded-xl bg-indigo-50/50 p-6 flex flex-col items-center justify-center text-center hover:bg-indigo-50 transition-colors relative group">
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={async (e) => {
                                const files = e.target.files;
                                if (!files || files.length === 0) return;

                                const newPhotos: string[] = [];
                                // Convert all to Base64
                                for (let i = 0; i < files.length; i++) {
                                    const file = files[i];
                                    if (file.size > 5 * 1024 * 1024) {
                                        toast.error(`File ${file.name} is too large (>5MB)`);
                                        continue;
                                    }

                                    const reader = new FileReader();
                                    newPhotos.push(await new Promise((resolve) => {
                                        reader.onload = (ev) => resolve(ev.target?.result as string);
                                        reader.readAsDataURL(file);
                                    }));
                                }

                                // Update State
                                const currentPhotos = formData.photos || [];
                                const updatedPhotos = [...currentPhotos, ...newPhotos];

                                setFormData((prev: any) => ({
                                    ...prev,
                                    photos: updatedPhotos,
                                    // Set primary if missing
                                    photoUrl: prev.photoUrl || updatedPhotos[0]
                                }));
                            }}
                        />
                        <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-3 text-2xl group-hover:scale-110 transition-transform">
                            📸
                        </div>
                        <h5 className="font-semibold text-gray-900">Upload Photos</h5>
                        <p className="text-xs text-gray-500 mt-1">Drag & drop or Click to browse (Multiple allowed)</p>
                    </div>

                    {/* Preview Gallery */}
                    {formData.photos?.length > 0 && (
                        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300">
                            {formData.photos.map((photo: string, idx: number) => (
                                <div key={idx} className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 shadow-sm group">
                                    <img src={photo} alt="Upload" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => {
                                            const newPhotos = formData.photos.filter((_: any, i: number) => i !== idx);
                                            setFormData((prev: any) => ({
                                                ...prev,
                                                photos: newPhotos,
                                                photoUrl: idx === 0 ? (newPhotos[0] || '') : prev.photoUrl // Update primary if first deleted
                                            }));
                                        }}
                                        className="absolute top-1 right-1 bg-red-500 text-white w-5 h-5 rounded-full text-xs flex items-center justify-center shadow-md transition-transform active:scale-95"
                                    >
                                        ✕
                                    </button>
                                    {/* Star for Primary */}
                                    {formData.photoUrl === photo && (
                                        <div className="absolute bottom-1 left-1 bg-yellow-400 text-white text-[10px] px-1 rounded shadow-sm font-bold">
                                            Main
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* About Me */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">About Me</h4>
                    <textarea
                        className="w-full p-3 border rounded-md text-sm text-gray-900 bg-white focus:ring-1 focus:ring-indigo-500"
                        rows={3}
                        placeholder="Describe your personality, hobbies, and what you are looking for..."
                        value={formData.aboutMe || ''}
                        onChange={e => handleChange('root', 'aboutMe', e.target.value)}
                    />
                </div>

                {/* Section 1: Basic Info */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Basic Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Full Name" value={formData.name || ''} onChange={e => handleChange('root', 'name', e.target.value)} />
                        {/* Gender Selector */}
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Gender</label>
                            <select
                                className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                                value={formData.gender || ''}
                                onChange={e => handleChange('root', 'gender', e.target.value)}
                            >
                                <option value="">Select Gender</option>
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        {/* Date of Birth (Calculates Age) */}
                        <Input
                            label="Date of Birth"
                            type="date"
                            value={formData.dob ? new Date(formData.dob).toISOString().split('T')[0] : ''}
                            onChange={e => {
                                const dob = e.target.value;
                                // Calculate Age
                                if (dob) {
                                    const birthDate = new Date(dob);
                                    const today = new Date();
                                    let age = today.getFullYear() - birthDate.getFullYear();
                                    const m = today.getMonth() - birthDate.getMonth();
                                    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                                        age--;
                                    }
                                    handleChange('root', 'age', age);
                                    handleChange('root', 'dob', dob);
                                }
                            }}
                        />
                        <Input label="Height (e.g. 5'9)" value={formData.height || ''} onChange={e => handleChange('root', 'height', e.target.value)} />
                        <div className="md:col-span-2 space-y-2 border p-3 rounded-md bg-slate-50 relative group">
                            <label className="text-sm font-medium text-gray-700 flex justify-between">
                                <span>Current Location</span>
                                <button
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (navigator.geolocation) {
                                            const btn = e.currentTarget;
                                            btn.innerText = "📍 Locating...";
                                            navigator.geolocation.getCurrentPosition(async (position) => {
                                                try {
                                                    const { latitude, longitude } = position.coords;
                                                    // Free Reverse Geocoding
                                                    const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                                                    const data = await res.json();

                                                    // Better Address Parsing
                                                    const addr = data.address;
                                                    const detectedCity = addr.city || addr.town || addr.village || addr.suburb || addr.county || addr.state_district || "Unknown City";
                                                    const detectedCountry = addr.country || "Unknown Country";

                                                    // console.log("GPS Address Found:", addr); // Debug hint

                                                    handleChange('location', 'city', detectedCity);
                                                    handleChange('location', 'country', detectedCountry);

                                                    btn.innerText = "✅ Detected";
                                                    setTimeout(() => btn.innerText = "📍 Use GPS", 2000);
                                                } catch (err) {
                                                    toast.error("Could not fetch address details. Please enter manually.");
                                                    btn.innerText = "📍 Use GPS";
                                                }
                                            }, () => {
                                                toast.error("Permission denied or unavailable.");
                                                btn.innerText = "📍 Use GPS";
                                            });
                                        }
                                    }}
                                    className="text-xs text-indigo-600 hover:text-indigo-800 font-bold bg-indigo-50 px-2 py-0.5 rounded transition-colors"
                                >
                                    📍 Use GPS
                                </button>
                            </label>
                            <div className="grid grid-cols-2 gap-2">
                                <Input
                                    placeholder="City (e.g. Mumbai)"
                                    value={formData.location?.city || (typeof formData.location === 'string' ? formData.location : '')}
                                    onChange={e => handleChange('location', 'city', e.target.value)}
                                />
                                <Input
                                    placeholder="Country (e.g. India)"
                                    value={formData.location?.country || ''}
                                    onChange={e => handleChange('location', 'country', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information (New) */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Contact Information</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Email Address" value={formData.email || ''} onChange={e => handleChange('root', 'email', e.target.value)} />
                        <Input label="Phone Number" value={formData.phone || ''} onChange={e => handleChange('root', 'phone', e.target.value)} />
                    </div>
                </div>

                {/* Horoscope (New) */}


                {/* Partner Preferences (New) */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Partner Preferences</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Preferred Age Range" placeholder="e.g. 24-28" value={formData.partnerPreferences?.ageRange || ''} onChange={e => handleChange('partnerPreferences', 'ageRange', e.target.value)} />
                        <Input label="Preferred Height" placeholder="e.g. 5'2 - 5'6" value={formData.partnerPreferences?.heightRange || ''} onChange={e => handleChange('partnerPreferences', 'heightRange', e.target.value)} />
                        <Input label="Preferred Income" placeholder="e.g. > 10 LPA" value={formData.partnerPreferences?.income || ''} onChange={e => handleChange('partnerPreferences', 'income', e.target.value)} />
                    </div>
                </div>

                {/* Section: Lifestyle (New) */}
                <div>
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Lifestyle</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Diet</label>
                            <select
                                className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                                value={formData.lifestyle?.diet || ''}
                                onChange={e => handleChange('lifestyle', 'diet', e.target.value)}
                            >
                                <option value="">Select Diet</option>
                                <option value="Veg">Veg</option>
                                <option value="Non-Veg">Non-Veg</option>
                                <option value="Vegan">Vegan</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Smoking</label>
                            <select
                                className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                                value={formData.lifestyle?.smoking || ''}
                                onChange={e => handleChange('lifestyle', 'smoking', e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                                <option value="Occasionally">Occasionally</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium text-gray-700">Drinking</label>
                            <select
                                className="w-full h-10 px-3 py-2 rounded-md border border-gray-200 bg-white text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500"
                                value={formData.lifestyle?.drinking || ''}
                                onChange={e => handleChange('lifestyle', 'drinking', e.target.value)}
                            >
                                <option value="">Select</option>
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                                <option value="Occasionally">Occasionally</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Section 2: Career */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Career & Education</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Profession" value={formData.career?.profession || ''} onChange={(e) => handleChange('career', 'profession', e.target.value)} />
                        <Input label="Company" value={formData.career?.company || ''} onChange={(e) => handleChange('career', 'company', e.target.value)} />
                        <Input label="College / Univ" value={formData.career?.college || ''} onChange={(e) => handleChange('career', 'college', e.target.value)} />
                        <Input label="Degree Details" value={formData.career?.degree || ''} onChange={(e) => handleChange('career', 'degree', e.target.value)} />
                        <Input label="Annual Income" value={formData.career?.income || ''} onChange={(e) => handleChange('career', 'income', e.target.value)} />
                    </div>
                </div>

                {/* Section 3: Religion & Horoscope */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Religion & Horoscope</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Religion</label>
                            <select
                                className="w-full h-10 px-3 border rounded-md"
                                value={formData.religion?.religion || 'Hindu'}
                                onChange={(e) => handleChange('religion', 'religion', e.target.value)}
                            >
                                <option>Hindu</option><option>Muslim</option><option>Christian</option><option>Sikh</option><option>Jain</option><option>Other</option>
                            </select>
                        </div>
                        <Input label="Caste" value={formData.religion?.caste || ''} onChange={(e) => handleChange('religion', 'caste', e.target.value)} />

                        <Input label="Zodiac Sign" placeholder="e.g. Libra" value={formData.horoscope?.zodiacSign || ''} onChange={e => handleChange('horoscope', 'zodiacSign', e.target.value)} />
                        <Input label="Nakshatra" value={formData.horoscope?.nakshatra || ''} onChange={(e) => handleChange('horoscope', 'nakshatra', e.target.value)} />

                        <div className="space-y-1">
                            <label className="text-sm font-medium">Manglik</label>
                            <select
                                className="w-full h-10 px-3 border rounded-md"
                                value={formData.horoscope?.manglik || 'No'}
                                onChange={(e) => handleChange('horoscope', 'manglik', e.target.value)}
                            >
                                <option>No</option><option>Yes</option><option>Don't Know</option>
                            </select>
                        </div>

                        <Input label="Gothra" value={formData.horoscope?.gothra || ''} onChange={(e) => handleChange('horoscope', 'gothra', e.target.value)} />
                        <Input label="Birth Place" value={formData.horoscope?.birthPlace || ''} onChange={(e) => handleChange('horoscope', 'birthPlace', e.target.value)} />
                        <Input label="Time of Birth" value={formData.horoscope?.birthTime || ''} onChange={(e) => handleChange('horoscope', 'birthTime', e.target.value)} />
                    </div>
                </div>

                {/* Section 4: Family Details */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Family Background</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Father's Job" value={formData.family?.fatherOccupation || ''} onChange={(e) => handleChange('family', 'fatherOccupation', e.target.value)} />
                        <Input label="Mother's Job" value={formData.family?.motherOccupation || ''} onChange={(e) => handleChange('family', 'motherOccupation', e.target.value)} />
                        <Input label="Brothers" type="number" value={formData.family?.brothers || ''} onChange={(e) => handleChange('family', 'brothers', e.target.value)} />
                        <Input label="Sisters" type="number" value={formData.family?.sisters || ''} onChange={(e) => handleChange('family', 'sisters', e.target.value)} />
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Family Type</label>
                            <select
                                className="w-full h-10 px-3 border rounded-md"
                                value={formData.family?.familyType || formData.family?.type || 'Nuclear'}
                                onChange={(e) => handleChange('family', 'familyType', e.target.value)}
                            >
                                <option>Nuclear</option>
                                <option>Joint</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-sm font-medium">Family Values</label>
                            <select
                                className="w-full h-10 px-3 border rounded-md"
                                value={formData.family?.familyValues || 'Moderate'}
                                onChange={(e) => handleChange('family', 'familyValues', e.target.value)}
                            >
                                <option>Moderate</option>
                                <option>Traditional</option>
                                <option>Orthodox</option>
                                <option>Liberal</option>
                            </select>
                        </div>
                        <Input label="Native Place" value={formData.family?.nativePlace || ''} onChange={(e) => handleChange('family', 'nativePlace', e.target.value)} />
                    </div>
                </div>

                {/* Section 5: Hobbies */}
                <div className="space-y-4">
                    <h4 className="text-sm font-bold text-gray-900 border-b pb-2 mb-4 uppercase tracking-wide">Interests</h4>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Hobbies (Comma separated)</label>
                        <textarea
                            className="w-full h-20 p-3 border rounded-md"
                            value={formData.lifestyle?.hobbies || ''}
                            onChange={(e) => handleChange('lifestyle', 'hobbies', e.target.value)}
                        />
                    </div>
                </div>
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t">
                    <Button variant="outline" onClick={onCancel}>Cancel</Button>
                    <Button onClick={handleSave} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
                        {loading ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
