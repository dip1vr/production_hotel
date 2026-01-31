import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://shyamheritage.com'; // Replace with your actual domain

    // Define your routes here
    const routes = [
        '',
        '/my-bookings',
        // Add other static pages if you create them, e.g., '/about', '/contact'
    ];

    return routes.map((route) => ({
        url: `${baseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly',
        priority: route === '' ? 1 : 0.8,
    }));
}
