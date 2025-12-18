'use client';

import StaticPageLayout from '@/components/StaticPageLayout';

export default function BlogPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Relationship Advice & Stories</h1>
                <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                    Expert tips on dating, psychology, and building lasting connections.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    <BlogCard
                        title="The Science of Compatibility: Why Opposites Don't Always Attract"
                        excerpt="Discover what research says about personality traits and long-term happiness."
                        date="Dec 15, 2024"
                        category="Psychology"
                        img="https://images.unsplash.com/photo-1516575334481-f85287c2c82d?auto=format&fit=crop&q=80&w=500"
                    />
                    <BlogCard
                        title="5 Red Flags to Watch Out For in Early Dating"
                        excerpt="Protect your heart by spotting these warning signs before you get too invested."
                        date="Dec 10, 2024"
                        category="Dating Tips"
                        img="https://images.unsplash.com/photo-1522529599102-193c0d76b5b6?auto=format&fit=crop&q=80&w=500"
                    />
                    <BlogCard
                        title="Success Story: How Priya and Rahul found love across continents"
                        excerpt="Read how our AI matched a couple who were 3,000 miles apart."
                        date="Dec 05, 2024"
                        category="Success Stories"
                        img="https://images.unsplash.com/photo-1511988617509-a57c8a288659?auto=format&fit=crop&q=80&w=500"
                    />
                </div>
            </div>
        </StaticPageLayout>
    );
}

function BlogCard({ title, excerpt, date, category, img }: any) {
    return (
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all cursor-pointer group">
            <div className="h-48 overflow-hidden">
                <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            </div>
            <div className="p-6">
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">{category}</span>
                <h3 className="font-bold text-xl mt-2 mb-3 group-hover:text-indigo-600 transition-colors">{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{excerpt}</p>
                <span className="text-xs text-gray-400">{date}</span>
            </div>
        </div>
    );
}
