"use client";

import { motion } from "framer-motion";
import { Star, X, Quote } from "lucide-react";
import Image from "next/image";
import { ReviewData } from "./Testimonials";

interface AllReviewsModalProps {
    reviews: ReviewData[];
    onClose: () => void;
}

export function AllReviewsModal({ reviews, onClose }: AllReviewsModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <motion.div
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="bg-white w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
            >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                    <div>
                        <h3 className="font-serif text-3xl font-bold text-slate-900">All Reviews</h3>
                        <p className="text-slate-500 text-sm mt-1">{reviews.length} verifies stories</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-6 h-6 text-slate-500" />
                    </button>
                </div>

                {/* Scrollable List */}
                <div className="overflow-y-auto p-6 space-y-6">
                    {reviews.map((review) => (
                        <div key={review.id} className="bg-slate-50 p-6 rounded-2xl">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold overflow-hidden">
                                        {review.userImage ? (
                                            <Image src={review.userImage} alt={review.name} width={40} height={40} className="w-full h-full object-cover" />
                                        ) : (
                                            review.name.charAt(0)
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-slate-900">{review.name}</div>
                                        <div className="text-xs text-slate-500">{review.location}</div>
                                    </div>
                                </div>
                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className={`w-4 h-4 ${i < review.rating ? "fill-amber-400 text-amber-400" : "fill-slate-200 text-slate-200"}`}
                                        />
                                    ))}
                                </div>
                            </div>

                            <p className="text-slate-600 leading-relaxed mb-4 whitespace-pre-wrap">{review.text}</p>

                            {review.images && review.images.length > 0 && (
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {review.images.map((img, idx) => (
                                        <div key={idx} className="relative w-24 h-24 flex-shrink-0 cursor-pointer rounded-lg overflow-hidden border border-slate-200">
                                            <Image src={img} alt="Review" fill className="object-cover" unoptimized />
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="text-xs text-slate-400 mt-2 font-medium">
                                {review.date instanceof Object && 'seconds' in review.date
                                    ? new Date(review.date.seconds * 1000).toLocaleDateString()
                                    : review.date}
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
