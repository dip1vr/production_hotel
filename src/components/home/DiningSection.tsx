"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { Utensils, Clock, Star, ChefHat, Leaf } from "lucide-react";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

export function DiningSection() {
    const [content, setContent] = useState({
        // Images
        main: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=2070&auto=format&fit=crop",
        food: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?q=80&w=2067&auto=format&fit=crop",
        drink: "https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?q=80&w=1740&auto=format&fit=crop",
        // Text
        title: "Dining Experience",
        subtitle: "Culinary Delights",
        description: "Savor the authentic flavors of Rajasthan and global cuisines crafted by master chefs",
        openingHours: "Breakfast: 7AM - 11AM • Dinner: 7PM - 11PM",
        signatureDishes: "Dal Baati Churma • Laal Maas • Gatte ki Sabzi"
    });

    useEffect(() => {
        const fetchContent = async () => {
            try {
                const docRef = doc(db, "content", "dining");
                const docSnap = await getDoc(docRef);

                if (docSnap.exists()) {
                    const data = docSnap.data();
                    setContent(prev => ({
                        ...prev,
                        main: data.main || prev.main,
                        food: data.food || prev.food,
                        drink: data.drink || prev.drink,
                        title: data.title || prev.title,
                        subtitle: data.subtitle || prev.subtitle,
                        description: data.description || prev.description,
                        openingHours: data.openingHours || prev.openingHours,
                        signatureDishes: data.signatureDishes || prev.signatureDishes
                    }));
                }
            } catch (error) {
                console.error("Error fetching dining content:", error);
            }
        };

        fetchContent();
    }, []);

    return (
        <section id="dining" className="py-24 bg-[#FFF9F3]">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true, amount: 0.5 }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100/80 text-orange-600 text-sm font-medium mb-6"
                    >
                        <Utensils className="w-4 h-4" />
                        <span>{content.subtitle}</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-5xl font-bold mb-4 text-slate-900"
                    >
                        {content.title}
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-600 text-lg max-w-2xl mx-auto"
                    >
                        {content.description}
                    </motion.p>
                </div>

                {/* Content Card */}
                <div className="flex flex-col lg:flex-row gap-8 items-stretch max-w-6xl mx-auto">
                    {/* Image Side - Collage */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 relative min-h-[500px]"
                    >
                        {/* Main Image - Dining Hall */}
                        <div className="absolute top-0 left-0 w-[85%] h-[85%] rounded-3xl overflow-hidden shadow-2xl z-10 border-[6px] border-white">
                            <Image
                                src={content.main}
                                alt="Dining Hall Ambience"
                                fill
                                unoptimized
                                className="object-cover hover:scale-105 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-black/10" />
                        </div>

                        {/* Floating Image 1 - Food Close up (Updated URL) */}
                        <div className="absolute bottom-6 right-6 w-[55%] h-[40%] rounded-2xl overflow-hidden shadow-xl border-4 border-white z-20 hover:scale-105 transition-transform duration-500 bg-gray-100">
                            <Image
                                src={content.food}
                                alt="Delicious Food"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>

                        {/* Floating Image 2 - Detail/Drink */}
                        <div className="absolute top-12 right-2 md:-right-4 w-[35%] h-[30%] rounded-2xl overflow-hidden shadow-lg border-4 border-white z-30 hover:scale-105 transition-transform duration-500 bg-gray-100">
                            <Image
                                src={content.drink}
                                alt="Signature Drink"
                                fill
                                unoptimized
                                className="object-cover"
                            />
                        </div>

                        {/* Floating Badge */}
                        <div className="absolute bottom-16 left-12 w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg animate-bounce-slow z-30 ring-4 ring-white">
                            <ChefHat className="w-8 h-8" />
                        </div>
                    </motion.div>

                    {/* Details Side */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="lg:w-1/2 bg-white rounded-3xl p-8 lg:p-12 shadow-sm border border-orange-50/50 flex flex-col justify-center relative overflow-hidden"
                    >
                        {/* Decorative Background */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-50 rounded-full blur-3xl -z-10 opacity-50" />

                        <h3 className="font-serif text-4xl font-bold text-slate-900 mb-2">Shyam Dining Hall</h3>
                        <p className="text-orange-500 font-medium mb-6 uppercase tracking-wider text-sm">Traditional Rajasthani & North Indian</p>

                        <p className="text-slate-600 mb-8 leading-relaxed text-lg">
                            Experience the royal tastes of Rajasthan. Our culinary experts bring you authentic recipes passed down through generations, served in an ambience that reflects the grandeur of heritage.
                        </p>

                        <div className="space-y-6 mb-10">
                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50/50 transition-colors">
                                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                                    <Clock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Opening Hours</h4>
                                    <p className="text-slate-500">{content.openingHours}</p>
                                </div>
                            </div>

                            <div className="flex items-start gap-4 p-4 rounded-xl hover:bg-orange-50/50 transition-colors">
                                <div className="p-3 rounded-lg bg-orange-100 text-orange-600">
                                    <Utensils className="w-6 h-6" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800">Signature Dishes</h4>
                                    <p className="text-slate-500">{content.signatureDishes}</p>
                                </div>
                            </div>
                        </div>

                        {/* Features Row */}
                        <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                            <div className="text-center group cursor-default">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-amber-100 text-amber-600 mb-2 group-hover:scale-110 transition-transform">
                                    <Star className="w-5 h-5 fill-current" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">5-Star Rated</span>
                            </div>
                            <div className="text-center group cursor-default">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-orange-100 text-orange-600 mb-2 group-hover:scale-110 transition-transform">
                                    <ChefHat className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Master Chefs</span>
                            </div>
                            <div className="text-center group cursor-default">
                                <div className="mx-auto w-10 h-10 flex items-center justify-center rounded-full bg-green-100 text-green-600 mb-2 group-hover:scale-110 transition-transform">
                                    <Leaf className="w-5 h-5" />
                                </div>
                                <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Fresh Food</span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
