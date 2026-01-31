"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            if (isLogin) {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name
                await updateProfile(userCredential.user, {
                    displayName: name
                });
            }
            onClose(); // Close modal on success
        } catch (err: unknown) {
            console.error(err);
            // Improve error messages
            const error = err as { code?: string; message?: string };
            if (error.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else if (error.code === 'auth/email-already-in-use') {
                setError("Email is already in use.");
            } else if (error.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError(error.message || "Authentication failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-[110] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl pointer-events-auto overflow-hidden">
                            <div className="p-6 relative">
                                <button
                                    onClick={onClose}
                                    className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                >
                                    <X className="w-5 h-5" />
                                </button>

                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-serif font-bold text-slate-900">
                                        {isLogin ? "Welcome Back" : "Create Account"}
                                    </h2>
                                    <p className="text-slate-500 text-sm mt-1">
                                        {isLogin ? "Sign in to access your bookings" : "Join us to book your luxury stay"}
                                    </p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!isLogin && (
                                        <div className="space-y-1.5">
                                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                <input
                                                    required
                                                    type="text"
                                                    value={name}
                                                    onChange={(e) => setName(e.target.value)}
                                                    placeholder="John Doe"
                                                    className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all border border-transparent focus:border-orange-200"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                placeholder="john@example.com"
                                                className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all border border-transparent focus:border-orange-200"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Password</label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input
                                                required
                                                type="password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                placeholder="••••••••"
                                                className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium text-slate-900 outline-none focus:ring-2 focus:ring-orange-500/20 focus:bg-white transition-all border border-transparent focus:border-orange-200"
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                            <AlertCircle className="w-4 h-4 shrink-0" />
                                            <p>{error}</p>
                                        </div>
                                    )}

                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-base shadow-lg transition-all"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            isLogin ? "Sign In" : "Create Account"
                                        )}
                                    </Button>
                                </form>

                                <div className="mt-6 text-center">
                                    <p className="text-slate-500 text-sm">
                                        {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                        <button
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="text-orange-600 font-bold hover:underline"
                                        >
                                            {isLogin ? "Sign Up" : "Sign In"}
                                        </button>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
