"use client";

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { FileText, Shield, Ban, Clock, Info } from "lucide-react";

export default function PoliciesPage() {
    return (
        <main className="min-h-screen bg-slate-50">
            <Navbar />

            <div className="container mx-auto px-6 pt-32 pb-20 max-w-4xl">
                <div className="mb-12">
                    <h1 className="text-4xl font-serif font-bold text-slate-900 mb-4">Hotel Policies & Privacy</h1>
                    <p className="text-slate-500 text-lg">Please read our terms and conditions carefully to ensure a smooth stay.</p>
                </div>

                <div className="space-y-8">

                    {/* General Rules */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                <FileText className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">General House Rules</h2>
                        </div>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span><strong>Check-in:</strong> 12:00 PM | <strong>Check-out:</strong> 11:00 AM. Early check-in or late check-out is subject to availability.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Government-issued photo ID (Aadhar Card, Driving License, Passport, or Voter ID) is mandatory for all guests.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                                <span className="text-red-600 font-medium">Original PAN Card is NOT accepted as valid ID proof.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Unmarried couples are allowed only with valid ID proof for both guests (18+).</span>
                            </li>
                        </ul>
                    </section>

                    {/* Food Policy */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-orange-50 text-orange-600 rounded-xl">
                                <Ban className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Food Policy</h2>
                        </div>
                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 text-orange-800 flex items-start gap-3">
                            <Info className="w-5 h-5 mt-0.5 shrink-0" />
                            <p>We are a <strong className="font-bold">Strictly Pure Vegetarian</strong> establishment.</p>
                        </div>
                        <ul className="space-y-4 text-slate-600 mt-4">
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Consumption or cooking of non-vegetarian food (meat, eggs, fish) is strictly prohibited within the hotel premises.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Outside food delivery is allowed, provided it adheres to our vegetarian policy.</span>
                            </li>
                        </ul>
                    </section>

                    {/* Privacy Policy */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                                <Shield className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Privacy & Data Protection</h2>
                        </div>
                        <div className="space-y-4 text-slate-600">
                            <p>
                                At Hotel Lord Krishna, we value your trust and are committed to protecting your personal information.
                            </p>
                            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <h4 className="font-bold text-slate-900 mb-2">How we use your data:</h4>
                                <ul className="space-y-2">
                                    <li className="flex items-start gap-2">
                                        <div className="text-green-500 font-bold">✓</div>
                                        <span>Your Name, Phone Number, and Email are used <strong>strictly for room booking and confirmation purposes only</strong>.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="text-green-500 font-bold">✓</div>
                                        <span>We <strong>never</strong> share, sell, or disclose your personal data to any third parties.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <div className="text-green-500 font-bold">✓</div>
                                        <span>Copies of IDs collected during check-in are stored securely as per government regulations and are not used for any other purpose.</span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </section>

                    {/* Cancellation Policy */}
                    <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                                <Clock className="w-6 h-6" />
                            </div>
                            <h2 className="text-2xl font-serif font-bold text-slate-900">Cancellation Policy</h2>
                        </div>
                        <ul className="space-y-4 text-slate-600">
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Free cancellation if cancelled 24 hours prior to the check-in time.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>Bookings cancelled within 24 hours of check-in may attract a retention charge equivalent to one night's stay.</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-slate-400 shrink-0" />
                                <span>In case of No-Show, the full booking amount will be charged.</span>
                            </li>
                        </ul>
                    </section>

                </div>
            </div>

            <Footer />
        </main>
    );
}
