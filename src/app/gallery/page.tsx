"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useState, useEffect } from "react";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Footer } from "@/components/layout/Footer";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface GalleryImage {
    id: string;
    src: string;
    category: string;
    alt?: string;
}

export default function GalleryPage() {
    const [images, setImages] = useState<GalleryImage[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const q = query(collection(db, "gallery"), orderBy("createdAt", "desc"));
                const querySnapshot = await getDocs(q);
                const fetchedImages: GalleryImage[] = [];
                querySnapshot.forEach((doc) => {
                    const data = doc.data();
                    fetchedImages.push({
                        id: doc.id,
                        src: data.src,
                        category: data.category || "Gallery",
                        alt: data.alt || "Gallery Image"
                    });
                });
                setImages(fetchedImages);
            } catch (error) {
                console.error("Error fetching gallery:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchGallery();
    }, []);

    return (
        <main className="min-h-screen bg-background">
            <section className="py-24 bg-white relative min-h-screen">
                {/* Back Button */}
                <div className="absolute top-8 left-4 md:left-8 z-20">
                    <Link href="/">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-md text-slate-800 hover:text-primary transition-colors border border-slate-200"
                        >
                            <ArrowLeft className="w-6 h-6" />
                        </motion.button>
                    </Link>
                </div>

                {/* Decorative background visual */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/2" />

                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-16 pt-12">
                        <motion.h1
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="font-serif text-5xl md:text-6xl font-bold mb-4 text-slate-900"
                        >
                            Our Full Gallery
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-600 text-lg"
                        >
                            A complete visual journey through Hotel Lord Krishna
                        </motion.p>
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                                <div key={n} className="aspect-[4/3] bg-slate-100 rounded-2xl animate-pulse" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {images.map((image, index) => (
                                <motion.div
                                    key={image.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true, amount: 0.1 }}
                                    transition={{ delay: index * 0.05, duration: 0.5 }}
                                    whileHover={{ y: -10 }}
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt || "Gallery Image"}
                                        fill
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Badge */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-medium text-white opacity-0 md:opacity-100 md:translate-y-0 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                                        {image.category}
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </section>
            <Footer />
        </main>
    );
}
