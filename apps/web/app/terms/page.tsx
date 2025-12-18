export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white p-8 md:p-16 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
            <p className="text-gray-500 text-sm mb-8">Last Updated: Dec 16, 2025</p>

            <div className="prose prose-indigo max-w-none text-gray-700 space-y-6">
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">1. Agreement to Terms</h2>
                    <p>By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access the Service.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">2. Eligibility</h2>
                    <p>You must be at least 18 years old to use the Service. By using the Service, you represent and warrant that you have the right, authority, and capacity to enter into this Agreement.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">3. User Conduct</h2>
                    <ul className="list-disc pl-5 space-y-1 mt-2">
                        <li>You agree not to post any content that is hate speech, threatening, or pornographic.</li>
                        <li>You agree not to use the Service for any illegal or unauthorized purpose.</li>
                        <li>You accept full responsibility for any content you post.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">4. Account Termination</h2>
                    <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">5. Governing Law</h2>
                    <p>These Terms shall be governed and construed in accordance with the laws of India, without regard to its conflict of law provisions.</p>
                </section>
            </div>
        </div>
    );
}
