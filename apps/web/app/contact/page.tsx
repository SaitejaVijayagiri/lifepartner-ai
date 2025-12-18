'use client';

import StaticPageLayout from '@/components/StaticPageLayout';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/Toast';

export default function ContactPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-4xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-12 text-center">Get in Touch</h1>

                <div className="grid md:grid-cols-2 gap-12">
                    {/* Contact Info */}
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">We'd love to hear from you</h3>
                            <p className="text-gray-600">
                                Whether you have a question about features, pricing, or need support, our team is ready to answer all your questions.
                            </p>
                        </div>

                        <div className="space-y-4">
                            <ContactItem icon={<Mail />} title="Email" desc="support@lifepartner.ai" />
                            <ContactItem icon={<MapPin />} title="Office" desc="Hitech City, Hyderabad, India" />
                            <ContactItem icon={<MessageCircle />} title="Live Chat" desc="Available 9am - 6pm IST" />
                        </div>
                    </div>

                    {/* Form */}
                    <ContactForm />
                </div>
            </div>
        </StaticPageLayout>
    );
}

function ContactForm() {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        const form = e.currentTarget; // Capture reference
        setLoading(true);
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            message: formData.get('message')
        };

        try {
            await api.interactions.contact(data);
            toast.success("Message sent! We'll get back to you soon.");
            form.reset(); // Use stable reference
        } catch (err) {
            toast.error("Failed to send message.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <input name="name" required type="text" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="Your Name" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input name="email" required type="email" className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="you@example.com" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
                    <textarea name="message" required className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none h-32" placeholder="How can we help?"></textarea>
                </div>
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? 'Sending...' : 'Send Message'}
                </Button>
            </form>
        </div>
    );
}

function ContactItem({ icon, title, desc }: any) {
    return (
        <div className="flex items-start gap-4">
            <div className="bg-indigo-50 p-3 rounded-lg text-indigo-600">
                {icon}
            </div>
            <div>
                <h4 className="font-bold text-gray-900">{title}</h4>
                <p className="text-gray-600">{desc}</p>
            </div>
        </div>
    );
}
