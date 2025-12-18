export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white p-8 md:p-16 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
            <p className="text-gray-500 text-sm mb-8">Last Updated: Dec 16, 2025</p>

            <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">1. Introduction</h2>
                    <p>Welcome to LifePartner AI. We respect your privacy and are committed to protecting your personal data. This privacy policy will inform you as to how we look after your personal data when you visit our website or use our application.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">2. Data We Collect</h2>
                    <p>We may collect, use, store and transfer different kinds of personal data about you which we have grouped together follows:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li><strong>Identity Data:</strong> Name, Gender, Date of Birth.</li>
                        <li><strong>Contact Data:</strong> Email address and telephone numbers.</li>
                        <li><strong>Profile Data:</strong> Your interests, preferences, biometric data (photos/videos for verification) and feedback.</li>
                        <li><strong>Usage Data:</strong> Information about how you use our website, products and services.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">3. How We Use Your Data</h2>
                    <p>We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:</p>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>To provide the matchmaking service to you (AI Matching).</li>
                        <li>To manage your relationship with us.</li>
                        <li>To improve our website, products/services, marketing or customer relationships.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">4. Data Security</h2>
                    <p>We have put in place appropriate security measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorized way, altered or disclosed.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">5. Contact Us</h2>
                    <p>If you have any questions about this privacy policy or our privacy practices, please contact us at: <a href="mailto:support@lifepartner.ai" className="text-indigo-600 hover:underline">support@lifepartner.ai</a></p>
                </section>
            </div>
        </div>
    );
}
