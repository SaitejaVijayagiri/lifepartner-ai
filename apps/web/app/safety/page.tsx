'use client';

import StaticPageLayout from '@/components/StaticPageLayout';
import { Shield, Eye, Lock, MapPin } from 'lucide-react';

export default function SafetyPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Dating Safety Tips</h1>
                <p className="text-xl text-gray-600 mb-12">
                    Your safety is our top priority. Please read these guidelines to stay safe while interacting with others.
                </p>

                <div className="space-y-8">
                    <SafetyItem
                        icon={<Lock />}
                        title="Keep Personal Info Private"
                        desc="Never share your financial details, Aadhar/SSN, or home address securely until you have established significant trust."
                    />
                    <SafetyItem
                        icon={<MapPin />}
                        title="Meet in Public Places"
                        desc="For your first few dates, always meet in a busy, public location like a coffee shop or mall. Arranging your own transportation is also recommended."
                    />
                    <SafetyItem
                        icon={<Eye />}
                        title="Watch for Red Flags"
                        desc="Be wary of anyone who asks for money, pushes for a serious relationship immediately, or refuses to video call."
                    />
                    <SafetyItem
                        icon={<Shield />}
                        title="Report Suspicious Behavior"
                        desc="If someone makes you uncomfortable or violates our guidelines, prioritize your safety and report them immediately using the in-app reporting tools."
                    />
                </div>

                <div className="mt-12 bg-red-50 p-6 rounded-xl border border-red-100 text-red-800">
                    <h4 className="font-bold mb-2">Emergency Assistance</h4>
                    <p className="text-sm">
                        If you are in immediate danger, please contact your local emergency services (100 or 112 in India) immediately.
                    </p>
                </div>
            </div>
        </StaticPageLayout>
    );
}

function SafetyItem({ icon, title, desc }: any) {
    return (
        <div className="flex gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                {icon}
            </div>
            <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 leading-relaxed">{desc}</p>
            </div>
        </div>
    );
}
