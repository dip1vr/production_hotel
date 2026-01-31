"use client";

import { motion, Variants, AnimatePresence } from "framer-motion";
import { Star, Quote, Plus, X, ZoomIn, Pencil, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { collection, query, orderBy, onSnapshot, Timestamp, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import Image from "next/image";
import { AddReview } from "./AddReview";
import { AllReviewsModal } from "./AllReviewsModal";
import { Button } from "@/components/ui/button";

export interface ReviewData {
    id: string;
    userId: string;
    name: string;
    location: string;
    rating: number;
    text: string;
    date: any; // Firestore Timestamp or string
    images?: string[];
    userImage?: string;
}

const cardVariants: Variants = {
    hidden: { opacity: 0, y: 40 },
    visible: {
        opacity: 1,
        y: 0,
        transition: {
            duration: 0.6,
            ease: "easeOut",
            staggerChildren: 0.2
        }
    }
};

const iconVariants: Variants = {
    hidden: { scale: 0, opacity: 0, rotate: -45 },
    visible: {
        scale: 1,
        opacity: 1,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 200,
            damping: 15
        }
    }
};

const starsContainerVariants: Variants = {
    hidden: { opacity: 1 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

const starVariants: Variants = {
    hidden: { opacity: 0, scale: 0, rotate: -72 },
    visible: {
        opacity: 1,
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 300, damping: 20 }
    }
};

export function Testimonials() {
    const [reviews, setReviews] = useState<ReviewData[]>([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const [showAddReview, setShowAddReview] = useState(false);
    const [showAllReviews, setShowAllReviews] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [editingReview, setEditingReview] = useState<ReviewData | undefined>(undefined);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, (u) => setUser(u));
        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        const q = query(collection(db, "reviews"), orderBy("createdAt", "desc"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const fetchedReviews: ReviewData[] = [];
            snapshot.forEach((doc) => {
                const data = doc.data();
                fetchedReviews.push({
                    id: doc.id,
                    userId: data.userId,
                    name: data.userName || "Guest",
                    location: data.location || "",
                    rating: data.rating || 5,
                    text: data.text || "",
                    date: data.createdAt || "Recently",
                    images: data.images || [],
                    userImage: data.userImage
                });
            });
            setReviews(fetchedReviews);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDelete = async (reviewId: string) => {
        if (!confirm("Are you sure you want to delete this review?")) return;
        try {
            await deleteDoc(doc(db, "reviews", reviewId));
        } catch (error) {
            console.error("Error deleting review:", error);
            alert("Failed to delete review.");
        }
    };

    // Sorting Logic: Current User First, then Rating High -> Low
    const sortedReviews = [...reviews].sort((a, b) => {
        if (user && a.userId === user.uid) return -1;
        if (user && b.userId === user.uid) return 1;
        return b.rating - a.rating;
    });

    const displayReviews = sortedReviews.slice(0, 3); // Show top 3

    return (
        <section id="reviews" className="py-24 bg-orange-50/30 relative">
            <div className="container mx-auto px-4">
                {/* Header */}
                <div className="text-center max-w-2xl mx-auto mb-16">
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-orange-100 text-orange-600 text-sm font-medium mb-6"
                    >
                        <Star className="w-4 h-4 fill-current" />
                        <span>Guest Reviews</span>
                    </motion.div>
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="font-serif text-5xl font-bold mb-4 text-slate-900"
                    >
                        What Our Guests Say
                    </motion.h2>

                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-8"
                    >
                        <Button
                            onClick={() => {
                                setEditingReview(undefined);
                                setShowAddReview(true);
                            }}
                            className="bg-slate-900 text-white hover:bg-slate-800 rounded-full px-8 py-6 text-lg shadow-lg hover:shadow-xl transition-all"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Write a Review
                        </Button>
                    </motion.div>
                </div>

                {/* Adding Review Modal Overlay */}
                <AnimatePresence>
                    {showAddReview && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                            <AddReview
                                onClose={() => {
                                    setShowAddReview(false);
                                    setEditingReview(undefined);
                                }}
                                onReviewAdded={() => {
                                    // Optional: Scroll to top or show success toast
                                }}
                                initialData={editingReview}
                            />
                        </div>
                    )}
                </AnimatePresence>

                {/* All Reviews Modal Overlay */}
                <AnimatePresence>
                    {showAllReviews && (
                        <AllReviewsModal
                            reviews={sortedReviews}
                            onClose={() => setShowAllReviews(false)}
                        />
                    )}
                </AnimatePresence>

                {/* Lightbox Overlay */}
                <AnimatePresence>
                    {selectedImage && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedImage(null)}
                            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer"
                        >
                            <button
                                onClick={() => setSelectedImage(null)}
                                className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <motion.div
                                initial={{ scale: 0.9 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0.9 }}
                                className="relative w-full max-w-5xl h-[80vh]"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Image
                                    src={selectedImage}
                                    alt="Full View"
                                    fill
                                    className="object-contain"
                                    unoptimized
                                />
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Reviews Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[1, 2, 3].map(i => <div key={i} className="h-80 bg-slate-200 animate-pulse rounded-2xl" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {displayReviews.map((review, i) => (
                            <motion.div
                                key={review.id}
                                variants={cardVariants}
                                initial="hidden"
                                whileInView="visible"
                                viewport={{ once: true, margin: "-50px" }}
                                custom={i}
                                className={`relative bg-white p-8 rounded-2xl shadow-sm border ${user && review.userId === user.uid ? "border-orange-400 ring-4 ring-orange-100" : "border-slate-100"} hover:shadow-xl transition-shadow duration-300 pt-12 flex flex-col`}
                            >
                                {/* Floating Quote Icon */}
                                <motion.div
                                    variants={iconVariants}
                                    className="absolute -top-6 -left-2 w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center text-white shadow-lg border-4 border-white"
                                >
                                    <Quote className="w-6 h-6 fill-current" />
                                </motion.div>

                                {user && review.userId === user.uid && (
                                    <>
                                        <div className="absolute top-4 right-4 flex gap-2">
                                            <button
                                                onClick={() => {
                                                    setEditingReview(review);
                                                    setShowAddReview(true);
                                                }}
                                                className="p-2 bg-slate-100 hover:bg-orange-100 rounded-full text-slate-500 hover:text-orange-600 transition-colors"
                                                title="Edit Review"
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(review.id)}
                                                className="p-2 bg-slate-100 hover:bg-red-100 rounded-full text-slate-500 hover:text-red-600 transition-colors"
                                                title="Delete Review"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="absolute top-4 right-20 bg-orange-100 text-orange-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                                            Your Review
                                        </div>
                                    </>
                                )}

                                {/* Stars */}
                                <motion.div
                                    variants={starsContainerVariants}
                                    className="flex gap-1 mb-6"
                                >
                                    {[...Array(5)].map((_, i) => (
                                        <motion.div key={i} variants={starVariants}>
                                            <Star
                                                className={`w-5 h-5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                                            />
                                        </motion.div>
                                    ))}
                                </motion.div>

                                {/* Text */}
                                <blockquote className="text-slate-600 italic leading-relaxed mb-6 flex-grow line-clamp-4">
                                    &quot;{review.text}&quot;
                                </blockquote>

                                {/* Images Preview (Small) */}
                                {review.images && review.images.length > 0 && (
                                    <div className="flex gap-3 mb-6 overflow-hidden">
                                        {review.images.slice(0, 3).map((img, idx) => (
                                            <div
                                                key={idx}
                                                onClick={() => setSelectedImage(img)}
                                                className="relative w-24 h-24 rounded-xl overflow-hidden border border-slate-100 group cursor-zoom-in"
                                            >
                                                <Image
                                                    src={img}
                                                    alt="Review"
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                    unoptimized
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Line */}
                                <div className="w-full h-px bg-slate-100 mb-6" />

                                {/* Author */}
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden relative">
                                            {review.userImage ? (
                                                <Image src={review.userImage} alt={review.name} fill className="object-cover" unoptimized />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-slate-400 font-bold bg-slate-200">
                                                    {review.name.charAt(0)}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-serif text-lg font-bold text-slate-900 leading-none mb-1">
                                                {review.name}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {review.location}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-xs text-slate-400 font-medium">
                                        {review.date instanceof Object && 'seconds' in review.date
                                            ? new Date(review.date.seconds * 1000).toLocaleDateString()
                                            : "Recently"}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* View All Button */}
                {sortedReviews.length > 3 && (
                    <div className="mt-16 text-center">
                        <motion.button
                            onClick={() => setShowAllReviews(true)}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-8 py-3 bg-white border border-slate-200 rounded-full shadow-sm text-slate-900 font-medium hover:bg-slate-50 hover:shadow-md transition-all"
                        >
                            View All {reviews.length} Reviews
                        </motion.button>
                    </div>
                )}
            </div>
        </section>
    );
}
