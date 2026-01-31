"use client";

import Link from "next/link";
import { Instagram, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
    return (
        <footer className="bg-primary/5 pt-16 pb-8 border-t border-primary/10">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
                    {/* Brand */}
                    <div className="space-y-4">
                        <div className="flex flex-col">
                            <span className="font-serif text-2xl font-bold text-primary">
                                Shyam Heritage
                            </span>
                            <span className="text-xs tracking-widest uppercase text-muted-foreground">
                                Palace
                            </span>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            Experience the divine grace of Khatu Shyam Ji combined with royal hospitality and modern luxury.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="font-serif font-bold text-lg mb-4">Quick Links</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/" className="hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="#rooms" className="hover:text-primary transition-colors">Rooms & Suites</Link></li>
                            <li><Link href="#amenities" className="hover:text-primary transition-colors">Amenities</Link></li>
                            <li><Link href="#gallery" className="hover:text-primary transition-colors">Gallery</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="font-serif font-bold text-lg mb-4">Contact Us</h3>
                        <ul className="space-y-3 text-sm text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <MapPin className="w-5 h-5 text-primary shrink-0" />
                                <span>52, Bawan Bigha road, Behind Nagar Palika, Khatoo, Raj.</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="w-5 h-5 text-primary shrink-0" />
                                <span>+91 99503 03198</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="w-5 h-5 text-primary shrink-0" />
                                <span>hotellordkrishna5@gmail.com</span>
                            </li>
                        </ul>
                    </div>

                    {/* Social */}
                    <div>
                        <h3 className="font-serif font-bold text-lg mb-4">Follow Us</h3>
                        <div className="flex gap-4">
                            <Link href="https://www.instagram.com/hotel_lord_krishna_0212?igsh=MTM1b3o3cm91NGoyZA==" aria-label="Follow us on Instagram" className="p-2 bg-background rounded-full hover:text-primary shadow-sm transition-all hover:-translate-y-1">
                                <Instagram className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="border-t border-primary/10 pt-8 text-center text-sm text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} Shyam Heritage Palace. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
