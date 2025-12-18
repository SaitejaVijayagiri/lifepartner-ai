'use client';

import StaticPageLayout from '@/components/StaticPageLayout';

export default function GuidelinesPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-3xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-8">Community Guidelines</h1>
                <p className="text-xl text-gray-600 mb-12">
                    We are building a community rooted in respect, kindness, and authenticity.
                </p>

                <div className="prose prose-lg text-gray-700">
                    <h3>1. Be Respectful</h3>
                    <p>Treat everyone with dignity. Harassment, hate speech, and bullying are strictly prohibited and will result in an immediate ban.</p>

                    <h3>2. Be Authentic</h3>
                    <p>Use your real photos and share your honest interests. Impersonation or creating fake profiles undermines the trust of our community.</p>

                    <h3>3. No Solicitation</h3>
                    <p>Using the platform to sell products, services, or ask for money is not allowed.</p>

                    <h3>4. Respect Privacy</h3>
                    <p>Do not share other users' private information or photos without their explicit consent.</p>
                </div>
            </div>
        </StaticPageLayout>
    );
}
