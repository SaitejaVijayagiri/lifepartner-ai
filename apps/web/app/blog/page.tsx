'use client';

import StaticPageLayout from '@/components/StaticPageLayout';
import { BLOG_POSTS } from '@/lib/blog-data';
import Link from 'next/link';

export default function BlogPage() {
    return (
        <StaticPageLayout>
            <div className="max-w-6xl mx-auto px-4 py-16">
                <h1 className="text-4xl font-extrabold text-gray-900 mb-4 text-center">Relationship Advice & Stories</h1>
                <p className="text-xl text-gray-600 text-center mb-16 max-w-2xl mx-auto">
                    Expert tips on dating, psychology, and the future of finding love in India.
                </p>

                <div className="grid md:grid-cols-3 gap-8">
                    {BLOG_POSTS.map((post) => (
                        <Link href={`/blog/${post.slug}`} key={post.slug} className="group">
                            <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all h-full flex flex-col">
                                <div className="h-48 overflow-hidden">
                                    <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                <div className="p-6 flex-1 flex flex-col">
                                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider mb-2 block">{post.category}</span>
                                    <h3 className="font-bold text-xl mb-3 text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                                        {post.title}
                                    </h3>
                                    <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                                        {post.excerpt}
                                    </p>
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center text-xs text-gray-400">
                                        <span>{post.date}</span>
                                        <span>Read more →</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </StaticPageLayout>
    );
}
