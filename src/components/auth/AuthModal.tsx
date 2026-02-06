"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Mail, Lock, User, Loader2, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, db } from "@/lib/firebase";
import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup,
    sendPasswordResetEmail,
    sendEmailVerification
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

interface AuthModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
    const [isLogin, setIsLogin] = useState(true); // Toggle between Login and Signup
    const [isForgotPassword, setIsForgotPassword] = useState(false); // Toggle Forgot Password
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<React.ReactNode>("");
    const [message, setMessage] = useState(""); // Success messages

    // Form State
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");

    if (!isOpen) return null;

    const googleProvider = new GoogleAuthProvider();

    const handleGoogleSignIn = async () => {
        setError("");
        setLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const user = result.user;
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                displayName: user.displayName,
                photoURL: user.photoURL,
                lastLogin: serverTimestamp(),
            }, { merge: true });
            onClose();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Google Sign-In failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);
        try {
            await sendPasswordResetEmail(auth, email);
            setMessage("Password reset email sent! Check your inbox.");
        } catch (err: any) {
            console.error(err);
            setError(err.message || "Failed to send reset email.");
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setMessage("");
        setLoading(true);

        try {
            if (isLogin) {
                // Sign In
                await signInWithEmailAndPassword(auth, email, password);
                onClose(); // Close modal on success
            } else {
                // Sign Up
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                // Update display name
                await updateProfile(userCredential.user, {
                    displayName: name
                });

                // Sync to Firestore
                await setDoc(doc(db, "users", userCredential.user.uid), {
                    email: email,
                    displayName: name,
                    createdAt: serverTimestamp(),
                    role: 'user'
                }, { merge: true });

                setMessage("Account created! Verification email sent.");

                // Optional: Wait a bit or let them close
                setTimeout(() => {
                    onClose();
                }, 2000);
            }
        } catch (err: unknown) {
            console.error(err);
            // Improve error messages
            const error = err as { code?: string; message?: string };
            if (error.code === 'auth/invalid-credential') {
                setError("Invalid email or password.");
            } else if (error.code === 'auth/email-already-in-use') {
                setError(
                    <>
                        Email in use. <span className="font-normal">Switch to </span>
                        <button
                            type="button"
                            onClick={() => { setIsLogin(true); setError(""); }}
                            className="underline font-semibold hover:text-orange-600 transition-colors"
                        >
                            Sign In?
                        </button>
                    </>
                );
            } else if (error.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.");
            } else {
                setError(error.message || "Authentication failed.");
            }
        } finally {
            setLoading(false);
        }
    };

    const resetView = () => {
        setIsLogin(true);
        setIsForgotPassword(false);
        setError("");
        setMessage("");
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

                                {isForgotPassword ? (
                                    // FORGOT PASSWORD VIEW
                                    <div className="text-center mb-8">
                                        <button
                                            onClick={resetView}
                                            className="absolute top-4 left-4 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                                        >
                                            <ArrowLeft className="w-5 h-5" />
                                        </button>
                                        <h2 className="text-2xl font-serif font-bold text-slate-900">
                                            Reset Password
                                        </h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            Enter your email to receive a reset link
                                        </p>
                                    </div>
                                ) : (
                                    // LOGIN / SIGNUP VIEW
                                    <div className="text-center mb-8">
                                        <h2 className="text-2xl font-serif font-bold text-slate-900">
                                            {isLogin ? "Welcome Back" : "Create Account"}
                                        </h2>
                                        <p className="text-slate-500 text-sm mt-1">
                                            {isLogin ? "Sign in to access your bookings" : "Join us to book your luxury stay"}
                                        </p>
                                    </div>
                                )}

                                {isForgotPassword ? (
                                    <form onSubmit={handleForgotPassword} className="space-y-4">
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
                                        {error && (
                                            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p>{error}</p>
                                            </div>
                                        )}
                                        {message && (
                                            <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 p-3 rounded-lg">
                                                <p>{message}</p>
                                            </div>
                                        )}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="w-full h-12 bg-slate-900 hover:bg-orange-600 text-white rounded-xl text-base shadow-lg transition-all"
                                        >
                                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Send Reset Link"}
                                        </Button>
                                    </form>
                                ) : (
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

                                        {/* Forgot Password Link */}
                                        {isLogin && (
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={() => setIsForgotPassword(true)}
                                                    className="text-xs font-medium text-slate-500 hover:text-orange-600 transition-colors"
                                                >
                                                    Forgot Password?
                                                </button>
                                            </div>
                                        )}

                                        {error && (
                                            <div className="flex items-center gap-2 text-red-600 text-xs bg-red-50 p-3 rounded-lg">
                                                <AlertCircle className="w-4 h-4 shrink-0" />
                                                <p>{error}</p>
                                            </div>
                                        )}
                                        {message && (
                                            <div className="flex items-center gap-2 text-green-600 text-xs bg-green-50 p-3 rounded-lg">
                                                <p>{message}</p>
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

                                        {/* OR Divider */}
                                        <div className="relative flex items-center gap-4 my-4">
                                            <div className="h-px bg-slate-200 flex-1" />
                                            <span className="text-xs text-slate-400 font-medium uppercase">Or</span>
                                            <div className="h-px bg-slate-200 flex-1" />
                                        </div>

                                        {/* Google Sign In */}
                                        <button
                                            type="button"
                                            onClick={handleGoogleSignIn}
                                            disabled={loading}
                                            className="w-full h-12 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2"
                                        >
                                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                                <path
                                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                                    fill="#4285F4"
                                                />
                                                <path
                                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                                    fill="#34A853"
                                                />
                                                <path
                                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z"
                                                    fill="#FBBC05"
                                                />
                                                <path
                                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                                    fill="#EA4335"
                                                />
                                            </svg>
                                            Continue with Google
                                        </button>
                                    </form>
                                )}

                                {!isForgotPassword && (
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
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

