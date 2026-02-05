"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { motion } from "framer-motion";
import Image from "next/image";
import { MapPin, Star, Utensils, Wifi, ShieldCheck, Clock } from "lucide-react";

export default function AboutPage() {
    return (
        <main className="min-h-screen bg-white">
            <Navbar />

            {/* Hero Section */}
            <section className="relative h-[60vh] flex items-center justify-center overflow-hidden">
                <Image
                    src="/images/hero-bg.jpg" // Fallback or use a relevant existing image path if known, otherwise typical pattern
                    alt="Hotel Lord Krishna"
                    fill
                    className="object-cover"
                    priority
                />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-4">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-4xl md:text-6xl font-serif font-bold mb-4"
                    >
                        About Us
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="text-lg md:text-xl text-white/90 font-light"
                    >
                        Experience Divine Hospitality at Hotel Lord Krishna
                    </motion.p>
                </div>
            </section>

            {/* Our Story */}
            <section className="py-20 container mx-auto px-6">
                <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="flex-1 space-y-6">
                        <h2 className="text-3xl font-serif font-bold text-slate-900">Our Story</h2>
                        <div className="w-20 h-1 bg-orange-500 rounded-full" />
                        <p className="text-slate-600 leading-relaxed">
                            Nestled in the heart of the city, Hotel Lord Krishna Palace is more than just a place to stay—it's a sanctuary of comfort and peace. Inspired by the divine grace of Lord Krishna, our hotel embodies the values of traditional Indian hospitality ("Atithi Devo Bhava") blended with modern luxury.
                        </p>
                        <p className="text-slate-600 leading-relaxed">
                            Whether you are here for a pilgrimage, a business trip, or a family vacation, we strictly ensure a serene environment. We take pride in being a <span className="font-bold text-orange-600">Pure Vegetarian</span> establishment, offering a spiritual and hygienic atmosphere for all our guests.
                        </p>
                        <div className="grid grid-cols-2 gap-6 pt-4">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <ShieldCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Safe & Secure</h4>
                                    <p className="text-sm text-slate-500">24/7 Security & CCTV</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                                    <Utensils className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">Pure Veg</h4>
                                    <p className="text-sm text-slate-500">Sattvic & Hygienic Food</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden shadow-2xl">
                        {/* Placeholder for About Image - using a color block if image missing */}
                        <div className="absolute inset-0 bg-slate-200 flex items-center justify-center text-slate-400">
                            <Image
                                src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop"
                                alt="Hotel Interior"
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* Why Choose Us */}
            <section className="py-20 bg-slate-50">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl font-serif font-bold text-slate-900 mb-4">Why Choose Us?</h2>
                        <p className="text-slate-500">We go the extra mile to make your stay memorable and comfortable.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            { icon: MapPin, title: "Prime Location", desc: "Located near major temples and transport hubs for your convenience." },
                            { icon: Clock, title: "24/7 Service", desc: "Our dedicated staff is available round the clock to assist you." },
                            { icon: Wifi, title: "Modern Amenities", desc: "Free Wi-Fi, AC Rooms, and Smart TVs for a comfortable stay." },
                        ].map((item, i) => (
                            <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                                <item.icon className="w-10 h-10 text-orange-500 mb-6" />
                                <h3 className="text-xl font-bold text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-500">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </main>
    );
}
