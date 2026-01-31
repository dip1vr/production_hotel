"use client";

import { motion } from "framer-motion";
import { Wifi, Utensils, Car, MapPin, Shield, Clock, Coffee, Droplets } from "lucide-react";

// Updated data with specific color classes for each icon background
const amenities = [
    { icon: Wifi, title: "High-Speed WiFi", description: "Complimentary high-speed internet access throughout the property.", color: "bg-pink-500" },
    { icon: Utensils, title: "Fine Dining", description: "Multi-cuisine restaurant with authentic Rajasthani flavors.", color: "bg-orange-500" },
    { icon: Car, title: "Secure Parking", description: "Ample secure parking facility for your vehicles.", color: "bg-slate-700" },
    { icon: MapPin, title: "Temple Guide", description: "Assistance with darshan and local sightseeing.", color: "bg-blue-500" },
    { icon: Shield, title: "24/7 Security", description: "CCTV surveillance and round-the-clock security.", color: "bg-emerald-500" },
    { icon: Clock, title: "24-Hour Room Service", description: "Round-the-clock service at your convenience.", color: "bg-amber-600" },
    { icon: Coffee, title: "Coffee Shop", description: "Relax with a hot cup of tea or freshly brewed coffee.", color: "bg-amber-700" },
    { icon: Droplets, title: "Hot & Cold Water", description: "24-hour hot and cold water supply in all rooms.", color: "bg-cyan-500" },
];

export function Amenities() {
    return (
        <section id="amenities" className="py-24 bg-gray-50/50">
            <div className="container mx-auto px-4">
                {/* Section Header */}
                <div className="text-center max-w-2xl mx-auto mb-20">
                    <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-primary font-medium tracking-widest text-sm uppercase mb-3 block"
                    >
                        Our Services
                    </motion.span>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-4xl md:text-5xl font-bold mb-6 text-slate-800"
                    >
                        Hotel Amenities
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-slate-500 text-lg"
                    >
                        Experience comfort and convenience with our comprehensive range of facilities.
                    </motion.p>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                    {amenities.map((item, index) => (
                        <motion.div
                            key={item.title}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, amount: 0.3 }}
                            transition={{ delay: index * 0.05 }}
                            className="group flex flex-col items-start text-left p-6 md:p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                        >
                            <div className={`p-4 rounded-2xl ${item.color} text-white mb-6 shadow-md transition-transform duration-300 group-hover:scale-105`}>
                                <item.icon className="w-7 h-7 stroke-[1.5]" />
                            </div>
                            <h3 className="font-sans text-lg font-bold mb-3 text-slate-800">
                                {item.title}
                            </h3>
                            <p className="text-sm text-slate-500 leading-relaxed">
                                {item.description}
                            </p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
