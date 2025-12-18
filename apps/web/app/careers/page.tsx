'use client';

import StaticPageLayout from '@/components/StaticPageLayout';
import { Briefcase } from 'lucide-react';

export default function CareersPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-4xl mx-auto px-4 py-16">
                <div className="text-center mb-16">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-4">Join Our Team</h1>
                    <p className="text-xl text-gray-600">Help us rewrite the future of human connection.</p>
                </div>

                <div className="grid gap-6">
                    {/* Placeholder Job Listings */}
                    <JobCard
                        title="Senior AI Engineer"
                        dept="Engineering"
                        loc="Remote / Bangalore"
                        type="Full-time"
                    />
                    <JobCard
                        title="Product Designer"
                        dept="Design"
                        loc="Remote"
                        type="Full-time"
                    />
                    <JobCard
                        title="Community Manager"
                        dept="Operations"
                        loc="Mumbai"
                        type="Full-time"
                    />
                </div>

                <div className="mt-16 text-center bg-gray-50 rounded-2xl p-8">
                    <h3 className="text-xl font-bold mb-2">Don't see your role?</h3>
                    <p className="text-gray-600 mb-4">We're always looking for exceptional talent.</p>
                    <a href="mailto:careers@lifepartner.ai" className="text-indigo-600 font-semibold hover:underline">
                        Email us your resume &rarr;
                    </a>
                </div>
            </div>
        </StaticPageLayout>
    );
}

function JobCard({ title, dept, loc, type }: any) {
    return (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:shadow-md transition-shadow cursor-pointer group">
            <div>
                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors">{title}</h3>
                <div className="flex gap-3 text-sm text-gray-500 mt-1">
                    <span>{dept}</span>
                    <span>•</span>
                    <span>{loc}</span>
                </div>
            </div>
            <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap">
                {type}
            </span>
        </div>
    );
}
