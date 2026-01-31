"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Star, Upload, X, Loader2 } from "lucide-react";
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { onAuthStateChanged, User } from "firebase/auth";
import { ReviewData } from "./Testimonials";

function useUser() {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribe();
    }, []);
    return user;
}

interface AddReviewProps {
    onClose: () => void;
    onReviewAdded: () => void;
    initialData?: ReviewData;
}

export function AddReview({ onClose, onReviewAdded, initialData }: AddReviewProps) {
    const user = useUser();
    const [rating, setRating] = useState(initialData?.rating || 5);
    const [text, setText] = useState(initialData?.text || "");
    const [location, setLocation] = useState(initialData?.location || "");
    const [images, setImages] = useState<string[]>(initialData?.images || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;

        Array.from(files).forEach(file => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setImages(prev => [...prev, base64String]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return alert("Please login to submit a review");
        if (!text.trim()) return;

        setIsSubmitting(true);
        try {
            if (initialData) {
                // Update existing review
                const reviewRef = doc(db, "reviews", initialData.id);
                await updateDoc(reviewRef, {
                    rating,
                    text,
                    location: location || "Verified Guest",
                    images,
                    updatedAt: serverTimestamp(),
                });
            } else {
                // Create new review
                await addDoc(collection(db, "reviews"), {
                    userId: user.uid,
                    userName: user.displayName || "Guest Guest",
                    userImage: user.photoURL || "",
                    rating,
                    text,
                    location: location || "Verified Guest",
                    images,
                    createdAt: serverTimestamp(),
                });
            }
            onReviewAdded();
            onClose();
        } catch (error) {
            console.error("Error submitting review:", error);
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-2xl shadow-xl border border-slate-100 p-6 md:p-8 w-full max-w-2xl relative overflow-hidden"
        >
            <button onClick={onClose} className="absolute top-4 right-4 p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-5 h-5 text-slate-500" />
            </button>

            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-6">
                {initialData ? "Edit Your Review" : "Write a Review"}
            </h3>

            {/* Rating */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">Your Rating</label>
                <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                        <button
                            key={star}
                            type="button"
                            onClick={() => setRating(star)}
                            className="transition-transform hover:scale-110 focus:outline-none"
                        >
                            <Star
                                className={`w-8 h-8 ${star <= rating ? "fill-amber-400 text-amber-400" : "fill-slate-100 text-slate-300"}`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Location (Optional)</label>
                        <input
                            type="text"
                            placeholder="e.g. Delhi, Jaipur"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="flex h-10 w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Your Experience</label>
                    <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder="Tell us about your stay..."
                        className="flex min-h-[120px] w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:cursor-not-allowed disabled:opacity-50 transition-all resize-y"
                        required
                    />
                </div>

                {/* Image Upload */}
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Add Photos</label>
                    <div className="flex flex-wrap gap-4">
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-colors text-slate-500 hover:text-orange-600"
                        >
                            <Upload className="w-6 h-6 mb-1" />
                            <span className="text-xs font-medium">Upload</span>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            multiple
                            accept="image/*"
                            className="hidden"
                        />

                        <AnimatePresence>
                            {images.map((img, index) => (
                                <motion.div
                                    key={index}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0 }}
                                    className="relative w-24 h-24 rounded-xl overflow-hidden shadow-sm border border-slate-200"
                                >
                                    <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => removeImage(index)}
                                        className="absolute top-1 right-1 p-1 bg-black/50 hover:bg-red-500 rounded-full text-white transition-colors"
                                    >
                                        <X className="w-3 h-3" />
                                    </button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>

                {!user && (
                    <div className="p-3 bg-amber-50 text-amber-700 text-sm rounded-lg">
                        You must be logged in to submit a review.
                    </div>
                )}

                <div className="pt-4 flex justify-end">
                    <Button
                        type="submit"
                        disabled={isSubmitting || !user}
                        className="bg-orange-600 hover:bg-orange-700 text-white min-w-[150px]"
                    >
                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        {initialData ? "Update Review" : "Submit Review"}
                    </Button>
                </div>
            </form>
        </motion.div>
    );
}
