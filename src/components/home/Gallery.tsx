    "use client";

    import { motion } from "framer-motion";
    import Image from "next/image";
    import { useState, useEffect } from "react";
    import { collection, getDocs, query, orderBy } from "firebase/firestore";
    import { db } from "@/lib/firebase";

    interface GalleryImage {
        id: string;
        src: string;
        category: string;
        alt?: string;
    }

    export function Gallery() {
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
            <section id="gallery" className="py-24 bg-white relative overflow-hidden">
                {/* Decorative background visual */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-orange-50/50 rounded-full blur-3xl -z-10 translate-x-1/3 -translate-y-1/2" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-blue-50/50 rounded-full blur-3xl -z-10 -translate-x-1/3 translate-y-1/2" />

                <div className="container mx-auto px-4">

                    {/* Header */}
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <motion.h2
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            className="font-serif text-5xl md:text-6xl font-bold mb-4 text-slate-900"
                        >
                            Gallery
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.1 }}
                            className="text-slate-600 text-lg"
                        >
                            Explore the beauty and elegance of Shyam Heritage Palace
                        </motion.p>
                    </div>

                    {/* Gallery Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map((n) => (
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
                                    viewport={{ once: true, amount: 0.3 }}
                                    transition={{ delay: index * 0.1, duration: 0.5 }}
                                    whileHover={{ y: -10 }}
                                    className="relative aspect-[4/3] rounded-2xl overflow-hidden group cursor-pointer shadow-lg"
                                >
                                    <Image
                                        src={image.src}
                                        alt={image.alt || "Gallery Image"}
                                        fill
                                        unoptimized
                                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    {/* Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    {/* Badge */}
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1 rounded-full text-xs font-medium text-white opacity-0 md:opacity-100 md:translate-y-0 translate-y-[-10px] group-hover:translate-y-0 transition-all duration-300">
                                        {image.category}
                                    </div>

                                    {/* Mobile/Hover Text */}
                                    <div className="absolute bottom-4 left-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-4 group-hover:translate-y-0">
                                        <span className="text-lg font-serif tracking-wide">{image.category}</span>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    )}

                    <div className="mt-16 text-center">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-900 font-medium hover:bg-slate-50 hover:shadow-md transition-all"
                        >
                            View Full Gallery
                        </motion.button>
                    </div>
                </div>
            </section>
        );
    }
