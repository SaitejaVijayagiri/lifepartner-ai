import { BLOG_POSTS } from '@/lib/blog-data';
import StaticPageLayout from '@/components/StaticPageLayout';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

export async function generateStaticParams() {
    return BLOG_POSTS.map((post) => ({
        slug: post.slug,
    }));
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);
    if (!post) return { title: 'Post Not Found' };

    return {
        title: `${post.title} | LifePartner AI`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image]
        }
    };
}

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = BLOG_POSTS.find((p) => p.slug === params.slug);

    if (!post) {
        notFound();
    }

    return (
        <StaticPageLayout>
            <article className="max-w-4xl mx-auto px-4 py-16">
                <div className="mb-8 text-center">
                    <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider bg-indigo-50 px-3 py-1 rounded-full">
                        {post.category}
                    </span>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mt-4 mb-6 leading-tight">
                        {post.title}
                    </h1>
                    <div className="flex items-center justify-center gap-4 text-gray-500 text-sm">
                        <span>{post.date}</span>
                        <span>•</span>
                        <span>5 min read</span>
                    </div>
                </div>

                <div className="rounded-2xl overflow-hidden mb-12 shadow-xl aspect-video relative">
                    <img
                        src={post.image}
                        alt={post.title}
                        className="w-full h-full object-cover"
                    />
                </div>

                <div
                    className="prose prose-lg prose-indigo mx-auto text-gray-700"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                />
            </article>
        </StaticPageLayout>
    );
}
