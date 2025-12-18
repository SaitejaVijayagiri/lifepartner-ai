'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ProfileWizard from '@/components/ProfileWizard';

export default function OnboardingPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [authChecking, setAuthChecking] = useState(true);

    // Check if user is authenticated
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            // Not authenticated, redirect to register
            router.push('/register');
        } else {
            setAuthChecking(false);
        }
    }, [router]);

    const handleWizardComplete = async (data: any) => {
        try {
            setLoading(true);

            // Transform wizard data to API structure
            const payload = {
                name: data.name,
                age: parseInt(data.age),
                gender: data.gender,
                height: data.height,
                location: { city: data.city, country: data.country },

                religion: {
                    religion: data.religion,
                    caste: data.caste,
                    interCasteOpen: data.interCasteOpen,
                    gothra: data.gothra
                },

                horoscope: {
                    zodiacSign: data.zodiacSign,
                    nakshatra: data.nakshatra,
                    manglik: data.manglik,
                    birthTime: data.birthTime
                },

                career: {
                    profession: data.profession,
                    company: data.company,
                    education: data.education,
                    income: data.income
                },

                family: {
                    type: data.familyType,
                    values: data.familyValues,
                    fatherOccupation: data.fatherOccupation
                },

                lifestyle: {
                    diet: data.diet,
                    smoke: data.smoke,
                    drink: data.drink
                },

                prompt: data.prompt,
                partnerPreferences: {
                    ageRange: data.partnerAgeRange,
                    heightRange: data.partnerHeightRange,
                    income: data.partnerIncome
                },

                motherTongue: data.motherTongue,
                photos: data.photos,
                photoUrl: data.photos?.[0] || '' // Set primary
            };

            await api.profile.updateProfile(payload); // Updated to use correct endpoint

            // Simulate analysis delay
            await new Promise(r => setTimeout(r, 1000));
            router.push('/dashboard');
        } catch (error) {
            console.error(error);
            alert('Failed to save profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-6 font-sans">
            {authChecking ? (
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold">Loading...</h2>
                </div>
            ) : loading ? (
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                    <h2 className="text-xl font-bold">Building your Matrimony Profile...</h2>
                    <p className="text-gray-500">AI is analyzing your compatibility factors.</p>
                </div>
            ) : (
                <ProfileWizard onComplete={handleWizardComplete} />
            )}
        </div>
    );
}
