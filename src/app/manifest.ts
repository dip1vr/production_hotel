import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Shyam Heritage Palace',
        short_name: 'Shyam Heritage',
        description: 'Luxury Hotel in Khatu Shyam Ji',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#ea580c', // Orange-600
        icons: [
            {
                src: '/icon-192.png', // We don't have this yet, but good to define
                sizes: '192x192',
                type: 'image/png',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
            },
        ],
    };
}
