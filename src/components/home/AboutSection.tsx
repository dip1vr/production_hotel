"use client";

import { motion } from "framer-motion";
import Image from "next/image";


export function AboutSection() {
    return (
        <section id="about" className="pt-24 pb-24 md:pb-48 bg-orange-50/30 overflow-hidden">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* Text Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="space-y-8"
                    >
                        <div className="inline-block px-4 py-1.5 bg-orange-100 text-orange-700 text-xs font-bold tracking-widest uppercase rounded-full">
                            About The Deity
                        </div>
                        <h2 className="font-serif text-4xl md:text-6xl font-black text-slate-900 leading-tight">
                            The Divine <span className="text-orange-600 block">Lord of Kaliyuga</span>
                        </h2>

                        <div className="space-y-6 text-lg text-slate-600 leading-relaxed max-w-lg">
                            <p>
                                <strong className="text-slate-900">Khatu Shyam Ji</strong>, revered as the incarnation of Barbarika, is the beacon of hope for millions. Pilgrims from across the world visit this holy land to seek his blessings, believing that a mere glimpse (Darshan) can alter one&apos;s destiny.
                            </p>
                            <p>
                                Located just moments from the temple, <span className="text-orange-600 font-serif font-bold">Shyam Heritage Palace</span> serves as your spiritual oasis. We offer a serene retreat where you can prepare for your worship and relax in comfort after your prayers.
                            </p>
                        </div>


                    </motion.div>

                    {/* Image Grid - User Provided Images */}
                    <motion.div
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            {/* Main Tall Image */}
                            <div className="md:col-span-7 space-y-4 pt-0 md:pt-12">
                                <div className="relative h-64 md:h-80 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transform hover:-translate-y-2 transition-transform duration-500">
                                    <Image
                                        src="https://images.unsplash.com/photo-1657020440981-db8c7d1ae4df?q=80&w=986&auto=format&fit=crop"
                                        alt="Khatu Shyam Ji Temple"
                                        fill
                                        className="object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                                </div>
                                <div className="relative h-40 md:h-48 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white transform hover:-translate-y-2 transition-transform duration-500">
                                    <Image
                                        src="https://images.unsplash.com/photo-1701096804916-9161cac36cda?q=80&w=987&auto=format&fit=crop"
                                        alt="Divine Atmosphere"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>

                            {/* Secondary Column */}
                            <div className="md:col-span-5 space-y-4">
                                <div className="relative h-40 md:h-48 rounded-[2rem] overflow-hidden shadow-xl border-4 border-white transform hover:-translate-y-2 transition-transform duration-500">
                                    <Image
                                        src="https://images.unsplash.com/photo-1657020681754-6813dde5c34d?q=80&w=1172&auto=format&fit=crop"
                                        alt="Worship"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                <div className="relative h-56 md:h-64 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-white transform hover:-translate-y-2 transition-transform duration-500">
                                    <Image
                                        src="https://images.unsplash.com/photo-1657020440989-35fdb0aabac5?q=80&w=1172&auto=format&fit=crop"
                                        alt="Temple View"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                                {/* Floating Badge */}
                                <div className="p-4 bg-orange-600 rounded-2xl text-center text-white shadow-lg shadow-orange-200">
                                    <div className="text-2xl font-bold">300m</div>
                                    <div className="text-xs opacity-90">From Toran dwar</div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
