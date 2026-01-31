"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Star, Award, ChevronDown } from "lucide-react";

import Image from "next/image";

export function Hero() {
    return (
        <div className="relative min-h-[650px] md:min-h-screen w-full overflow-hidden flex items-start md:items-center justify-center">
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="https://i.ibb.co/fzvVwnjt/Chat-GPT-Image-Jan-25-2026-07-22-31-PM.png"
                    alt="Shyam Heritage Palace Exterior"
                    fill
                    priority
                    unoptimized
                    className="object-cover object-center md:object-center transition-transform duration-1000 scale-100 hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/50" />
            </div>

            {/* Content */}
            <div className="relative z-10 container mx-auto px-4 flex flex-col items-center text-center text-white pt-28 pb-12 md:pb-0 md:pt-32">

                {/* Badge */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="mb-6 inline-flex items-center gap-2 px-6 py-2 rounded-full border border-primary/50 bg-black/40 backdrop-blur-md text-sm font-medium text-white/90"
                >
                    <Award className="w-4 h-4 text-primary" />
                    <span>5-Star Heritage Hotel</span>
                </motion.div>

                {/* Title */}
                <motion.h1
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="font-serif text-4xl md:text-7xl lg:text-8xl font-bold mb-4 drop-shadow-2xl tracking-tight"
                >
                    Shyam Heritage <span className="block mt-2">Palace</span>
                </motion.h1>

                {/* Stars */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.4, staggerChildren: 0.1 }}
                    className="flex items-center gap-1 mb-6"
                >
                    {[...Array(5)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, scale: 0, rotate: -72 }}
                            animate={{ opacity: 1, scale: 1, rotate: 0 }}
                            transition={{
                                duration: 0.5,
                                delay: 0.4 + (i * 0.1), // Manual staggering to ensure it starts after container
                                type: "spring", stiffness: 200
                            }}
                        >
                            <Star className="w-6 h-6 fill-primary text-primary" />
                        </motion.div>
                    ))}
                </motion.div>

                {/* Subtitle */}
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    className="text-xl md:text-2xl font-medium text-white/90 mb-2"
                >
                    Where Divinity Meets Luxury
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    className="text-base md:text-lg text-white/80 mb-10 max-w-2xl font-light"
                >
                    Experience royal hospitality just steps away from Khatu Shyam Ji Temple
                </motion.p>

                {/* Buttons */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                    className="flex flex-col sm:flex-row gap-4 mb-16"
                >
                    <Button
                        size="lg"
                        className="bg-primary hover:bg-primary/90 text-white min-w-[200px] h-14 text-lg rounded-xl shadow-lg shadow-primary/20"
                        onClick={() => document.getElementById('booking-bar')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Book Your Stay
                    </Button>
                    <Button
                        size="lg"
                        variant="outline"
                        className="border-white/50 bg-white/5 backdrop-blur-sm text-white hover:bg-white/20 hover:border-white min-w-[200px] h-14 text-lg rounded-xl"
                        onClick={() => document.getElementById('rooms')?.scrollIntoView({ behavior: 'smooth' })}
                    >
                        Explore Rooms
                    </Button>
                </motion.div>

                {/* Stats Cards - Glassmorphism */}
                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    className="grid grid-cols-3 gap-2 md:gap-6 w-full max-w-4xl"
                >
                    {[
                        { label: "Luxury Rooms", value: "50+" },
                        { label: "Guest Rating", value: "4.9★" },
                        { label: "Happy Guests", value: "10K+" },
                    ].map((stat, index) => (
                        <div key={index} className="bg-black/30 backdrop-blur-md border border-white/10 p-2 md:p-6 rounded-xl md:rounded-2xl flex flex-col items-center justify-center hover:bg-black/40 transition-colors">
                            <span className="text-xl md:text-4xl font-serif font-bold text-white mb-1">
                                {stat.value}
                            </span>
                            <span className="text-[10px] md:text-sm text-white/70 uppercase tracking-wider text-center leading-tight">
                                {stat.label}
                            </span>
                        </div>
                    ))}
                </motion.div>
            </div>

            {/* Scroll Indicator */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2"
            >
                <ChevronDown className="w-8 h-8 text-white/50 animate-bounce" />
            </motion.div>
        </div>
    );
}
