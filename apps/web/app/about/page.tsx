'use client';

import StaticPageLayout from '@/components/StaticPageLayout';

export default function AboutPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-6">About Us</h1>

                <div className="prose prose-lg text-gray-600">
                    <p className="text-xl mb-8">
                        LifePartner AI was born from a simple frustration: <strong>modern dating apps are broken.</strong>
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Our Mission</h3>
                    <p className="mb-6">
                        We believe that finding a life partner shouldn't be about swiping left or right on a face.
                        It should be about shared values, compatible life visions, and deep emotional connection.
                    </p>
                    <p className="mb-6">
                        Our mission is to use advanced Artificial Intelligence to look beyond the surface level,
                        connecting people based on who they truly are, not just what they look like in a filtered photo.
                    </p>

                    <h3 className="text-2xl font-bold text-gray-800 mb-4">Why AI?</h3>
                    <p className="mb-6">
                        Traditional matchmaking relies on rigid filters (height, income, caste) or superficial attraction.
                        Our AI analyzes thousands of data points—from your communication style to your long-term goals—to
                        predict compatibility with unprecedented accuracy.
                    </p>

                    <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100 my-8">
                        <h4 className="text-lg font-bold text-indigo-900 mb-2">Our Promise</h4>
                        <p className="text-indigo-800">
                            We are committed to building a safe, respectful, and authentic community for people serious about finding love.
                        </p>
                    </div>
                </div>
            </div>
        </StaticPageLayout>
    );
}
