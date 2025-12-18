import { MetadataRoute } from 'next';
import { BLOG_POSTS } from '@/lib/blog-data';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://lifepartner-ai.vercel.app';

    // Static Pages
    const routes = [
        '',
        '/about',
        '/contact',
        '/blog',
        '/login',
        '/register',
        '/privacy',
        '/terms',
    ].map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'monthly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    // Dynamic Blog Posts
    const blogRoutes = BLOG_POSTS.map((post) => ({
        url: `${baseUrl}/blog/${post.slug}`,
        lastModified: new Date(post.date), // Use post date or current date
        changeFrequency: 'weekly' as const,
        priority: 0.9, // High priority for content
    }));

    return [...routes, ...blogRoutes];
}
