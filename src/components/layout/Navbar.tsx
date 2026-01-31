"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { Instagram, Phone, Mail, ArrowRight, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import dynamic from "next/dynamic";
const AuthModal = dynamic(() => import("@/components/auth/AuthModal").then(mod => mod.AuthModal));

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Rooms", href: "/#rooms" },
    { name: "Amenities", href: "/#amenities" },
    { name: "Dining", href: "/#dining" },
    { name: "Gallery", href: "/#gallery" },
    { name: "Contact", href: "/#contact" },
    { name: "Reviews", href: "/#reviews" },
];

export function Navbar() {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const isHome = pathname === "/";

    // Auth State
    const { user, logout } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Prevent scrolling when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [isMobileMenuOpen]);

    const showSolidNav = isScrolled || isMobileMenuOpen || !isHome;

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={cn(
                    "fixed top-0 left-0 right-0 z-[60] transition-all duration-300 border-b border-transparent",
                    showSolidNav
                        ? "bg-white/90 backdrop-blur-md border-slate-200 shadow-sm py-4"
                        : "bg-transparent py-6"
                )}
            >
                <div className="container mx-auto px-6 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group relative z-50">
                        <div className={cn(
                            "p-2 rounded-full border transition-colors",
                            showSolidNav
                                ? "bg-orange-50 border-orange-200"
                                : "bg-white/10 border-white/20"
                        )}>
                            <span className="text-2xl">🕉️</span>
                        </div>
                        <div className="flex flex-col">
                            <span className={cn(
                                "font-serif text-xl font-bold leading-none tracking-tight transition-colors",
                                showSolidNav ? "text-slate-900" : "text-white"
                            )}>
                                Shyam Heritage
                            </span>
                            <span className={cn(
                                "text-[0.65rem] tracking-[0.2em] uppercase font-semibold mt-1",
                                showSolidNav ? "text-orange-600" : "text-white/80"
                            )}>
                                Palace
                            </span>
                        </div>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <Link
                                key={link.name}
                                href={link.href}
                                className={cn(
                                    "text-sm font-medium hover:text-orange-500 transition-colors relative after:content-[''] after:absolute after:left-0 after:-bottom-1 after:w-0 after:h-0.5 after:bg-orange-500 after:transition-all hover:after:w-full",
                                    showSolidNav ? "text-slate-600" : "text-white/90"
                                )}
                            >
                                {link.name}
                            </Link>
                        ))}
                        {user ? (
                            <div className="flex items-center gap-4">
                                <div className={cn(
                                    "hidden lg:flex items-center gap-2",
                                    showSolidNav ? "text-slate-700" : "text-white/90"
                                )}>
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center transition-colors",
                                        showSolidNav ? "bg-orange-100 text-orange-600" : "bg-white/20 text-white backdrop-blur-sm"
                                    )}>
                                        <User className="w-4 h-4" />
                                    </div>
                                    <span className="text-sm font-medium">{user.displayName || "User"}</span>
                                </div>
                                <Link
                                    href="/my-bookings"
                                    className={cn(
                                        "text-sm font-medium transition-colors hover:text-orange-500",
                                        showSolidNav ? "text-slate-600" : "text-white/90"
                                    )}
                                >
                                    My Bookings
                                </Link>
                                <Button
                                    onClick={() => logout()} variant="ghost" size="sm"
                                    className={cn(
                                        "hover:text-red-500 transition-colors",
                                        showSolidNav ? "text-slate-500" : "text-white/70 hover:bg-white/10"
                                    )}
                                >
                                    <LogOut className="w-4 h-4 mr-2" />
                                    Sign Out
                                </Button>
                            </div>
                        ) : (
                            <Button
                                onClick={() => setIsAuthModalOpen(true)}
                                className="bg-slate-900 hover:bg-orange-600 text-white rounded-full px-6"
                            >
                                Sign In
                            </Button>
                        )}
                    </nav>

                    {/* Mobile Toggle */}
                    <button
                        className="md:hidden p-2 relative z-50 focus:outline-none"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <div className={cn(
                            "w-6 h-6 flex flex-col justify-center gap-1.5 transition-all text-current",
                            isMobileMenuOpen ? "rotate-45" : ""
                        )}>
                            <span className={cn(
                                "block w-6 h-0.5 rounded-full transition-all duration-300 bg-current",
                                showSolidNav ? "bg-slate-900" : "bg-white",
                                isMobileMenuOpen ? "absolute top-1/2 rotate-90" : ""
                            )} />
                            <span className={cn(
                                "block w-6 h-0.5 rounded-full transition-all duration-300 bg-current",
                                showSolidNav ? "bg-slate-900" : "bg-white",
                                isMobileMenuOpen ? "absolute top-1/2" : ""
                            )} />
                            <span className={cn(
                                "block w-4 h-0.5 rounded-full transition-all duration-300 ml-auto bg-current",
                                showSolidNav ? "bg-slate-900" : "bg-white",
                                isMobileMenuOpen ? "opacity-0" : ""
                            )} />
                        </div>
                    </button>
                </div>
            </motion.header>

            {/* Mobile Menu Overlay - Premium Light Drawer */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                        />

                        {/* Drawer */}
                        <motion.div
                            initial={{ x: "100%" }}
                            animate={{ x: 0 }}
                            exit={{ x: "100%" }}
                            transition={{ type: "spring", damping: 30, stiffness: 300 }}
                            className="fixed top-0 right-0 bottom-0 z-[50] w-[85%] max-w-sm bg-white text-slate-900 shadow-2xl md:hidden flex flex-col border-l border-slate-100"
                        >
                            {/* Decorative Pattern Background */}
                            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

                            <div className="flex flex-col h-full relative z-10 overflow-y-auto py-8 px-8 pt-28">

                                {/* Links */}
                                <nav className="flex flex-col gap-2">
                                    {navLinks.map((link, i) => (
                                        <motion.div
                                            key={link.name}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + (i * 0.05) }}
                                        >
                                            <Link
                                                href={link.href}
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="group flex items-center justify-between py-4 border-b border-slate-50 hover:border-orange-100 transition-colors"
                                            >
                                                <span className="font-serif text-2xl font-medium text-slate-800 group-hover:text-orange-600 transition-colors">
                                                    {link.name}
                                                </span>
                                                <ArrowRight className="w-5 h-5 text-orange-400 opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                                            </Link>
                                        </motion.div>
                                    ))}
                                </nav>

                                {/* Bottom Actions */}
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="mt-auto pt-10 space-y-6"
                                >
                                    {user ? (
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-500">Welcome,</p>
                                                    <p className="text-slate-900 font-bold">{user.displayName || "User"}</p>
                                                </div>
                                            </div>
                                            <Link
                                                href="/my-bookings"
                                                onClick={() => setIsMobileMenuOpen(false)}
                                                className="flex items-center justify-center w-full h-12 text-slate-700 font-medium bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors"
                                            >
                                                My Bookings
                                            </Link>
                                            <Button
                                                onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                                                variant="outline"
                                                className="w-full h-12 border-red-100 text-red-600 hover:bg-red-50 hover:border-red-200 rounded-xl"
                                            >
                                                Sign Out
                                            </Button>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => { setIsAuthModalOpen(true); setIsMobileMenuOpen(false); }}
                                            className="w-full h-14 text-lg rounded-xl bg-slate-900 hover:bg-orange-600 text-white shadow-lg shadow-slate-200"
                                        >
                                            Sign In
                                        </Button>
                                    )}

                                    <div className="grid grid-cols-2 gap-4 text-sm text-slate-500">
                                        <a href="tel:+919876543210" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                            <Phone className="w-4 h-4 text-orange-500" />
                                            <span>Call Us</span>
                                        </a>
                                        <a href="mailto:hotellordkrishna5@gmail.com" className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-orange-50 hover:text-orange-600 transition-colors">
                                            <Mail className="w-4 h-4 text-orange-500" />
                                            <span>Email</span>
                                        </a>
                                    </div>

                                    <div className="flex gap-4 justify-center pt-6 border-t border-slate-100">
                                        <a href="https://www.instagram.com/hotel_lord_krishna_0212?igsh=MTM1b3o3cm91NGoyZA==" target="_blank" rel="noopener noreferrer" aria-label="Follow us on Instagram" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-400 hover:text-orange-600 hover:border-orange-200 hover:bg-orange-50 transition-all">
                                            <Instagram className="w-4 h-4" />
                                        </a>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
            <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
        </>
    );
}
