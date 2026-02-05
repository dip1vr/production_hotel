"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar as CalendarIcon, User, Phone, Users, Minus, Plus, Loader2, CheckCircle, ArrowRight, CreditCard, Smartphone, QrCode, Download } from "lucide-react";
import { toJpeg } from 'html-to-image';
import { TicketCard } from "./TicketCard";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { setDoc, doc, serverTimestamp, increment, updateDoc, collection, getDocs, getDoc } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";
import { AuthModal } from "@/components/auth/AuthModal";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Room {
    id: number | string;
    name: string;
    price: string;
    image: string;
    images?: string[];
    totalStock?: number; // Added to interface if not present in main types
}

interface BookingModalProps {
    room: Room | null;
    isOpen: boolean;
    onClose: () => void;
}

export function BookingModal({ room, isOpen, onClose }: BookingModalProps) {
    const { user } = useAuth();
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

    // Initial state derived from room details
    const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [roomsCount, setRoomsCount] = useState(1);
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [totalNights, setTotalNights] = useState(0);

    // Availability State
    const [bookedDates, setBookedDates] = useState<Record<string, number>>({});
    const [roomStock, setRoomStock] = useState(10);

    // Payment & Flow State
    const [step, setStep] = useState(1); // 1: Details, 2: Payment, 3: Ticket
    const [paymentMethod, setPaymentMethod] = useState("upi");
    const [paymentType, setPaymentType] = useState<'full' | 'advance'>('advance'); // 'full' or 'advance'
    const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
    const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [bookingId, setBookingId] = useState("");
    const [isDownloading, setIsDownloading] = useState(false);
    const ticketRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            setStep(1);
            setBookingId("");
            setError("");
            setIsDownloading(false);
            setPaymentMethod("upi");
            setPaymentType('advance');
            setScreenshotFile(null);
            setScreenshotPreview(null);
            // Optional: retain dates/guests if desired, or reset them too.
            // For now, keeping dates/guests as they might be pre-filled from context or previous selection logic.
        }
    }, [isOpen]);

    // Fetch Availability for specific room
    useEffect(() => {
        if (isOpen && room) {
            const fetchAvailability = async () => {
                try {
                    // Get room stock
                    // Ideally fetch fresh, but room prop might have it or default
                    // Let's assume passed room has stock or default 10
                    // Or fetch fresh doc?
                    // const roomDoc = await getDoc(doc(db, "rooms", room.id.toString()));
                    // const stock = roomDoc.exists() ? (roomDoc.data().totalStock || 10) : 10;
                    const stock = room.totalStock || 10;
                    setRoomStock(stock);

                    // Fetch bookings
                    const availSnap = await getDocs(collection(db, "rooms", room.id.toString(), "availability"));
                    const map: Record<string, number> = {};
                    availSnap.forEach(d => {
                        map[d.id] = d.data().bookedCount || 0;
                    });
                    setBookedDates(map);
                } catch (e) {
                    console.error("Error fetching room availability:", e);
                }
            };
            fetchAvailability();
        }
    }, [isOpen, room]);

    useEffect(() => {
        if (checkIn && checkOut) {
            const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            setTotalNights(diffDays > 0 ? diffDays : 0);
        } else {
            setTotalNights(0);
        }
    }, [checkIn, checkOut]);

    const handleAdultsChange = (increment: boolean) => {
        const newAdults = increment ? adults + 1 : Math.max(1, adults - 1);
        setAdults(newAdults);
        // Auto-adjust rooms: 1 room for every 3 adults
        const requiredRooms = Math.ceil(newAdults / 3);
        if (roomsCount < requiredRooms) {
            setRoomsCount(requiredRooms);
        }
    };

    // Payment Calculations
    const parsePrice = (priceStr: string) => {
        return parseInt(priceStr.replace(/[^0-9]/g, '')) || 0;
    };

    const pricePerNight = room ? parsePrice(room.price) : 0;
    const basePrice = pricePerNight * roomsCount * (totalNights || 1);

    // GST Slabs (As per Govt of India Rules)
    let gstRate = 0;
    if (pricePerNight <= 1000) {
        gstRate = 0;
    } else if (pricePerNight <= 7500) {
        gstRate = 0.12; // Keeping 12% as it's the standard widely known rate for hotels in this slab.
    } else {
        gstRate = 0.18;
    }

    const taxAmount = Math.round(basePrice * gstRate);
    const totalPrice = basePrice + taxAmount;

    // Advance Payment Calculation (20%)
    // Advance Payment Calculation (20%)
    const advanceAmount = Math.round(totalPrice * 0.20);

    // Dynamic Amounts based on Selection
    const payableAmount = paymentType === 'full' ? totalPrice : advanceAmount;
    const pendingAmount = totalPrice - payableAmount;

    if (!isOpen || !room) return null;

    const generateBookingId = () => {
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        const randomStr = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
        return `BK-${randomStr}`;
    };

    const handleNextStep = (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        // Authentication Check
        if (!user) {
            setIsAuthModalOpen(true);
            return;
        }

        if (step === 1) {
            // Validate Step 1
            if (!checkIn || !checkOut || !name || !phone) {
                setError("Please fill in all details");
                return;
            }

            // Validate Availability
            if (checkIn && checkOut) {
                const start = new Date(checkIn);
                const end = new Date(checkOut);

                // Iterate through dates to check availability
                const date = new Date(start);
                while (date < end) {
                    const dateStr = format(date, "yyyy-MM-dd");
                    const bookedCount = bookedDates[dateStr] || 0;
                    const available = Math.max(0, roomStock - bookedCount);

                    if (available < roomsCount) {
                        setError(`Only ${available} room${available !== 1 ? 's' : ''} available on ${format(date, "dd MMM yyyy")}. You requested ${roomsCount}.`);
                        return;
                    }
                    date.setDate(date.getDate() + 1);
                }
            }

            setStep(2);
        } else if (step === 2) {
            handleFinalPayment();
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setScreenshotFile(file);
            setScreenshotPreview(URL.createObjectURL(file));
        }
    };

    const handleFinalPayment = async () => {
        if (!screenshotFile) {
            setError("Please upload the payment screenshot.");
            return;
        }

        setIsSubmitting(true);
        setIsUploading(true);

        try {
            // 1. Upload to ImgBB
            const formData = new FormData();
            formData.append('image', screenshotFile);

            // Use environment variable for key
            const apiKey = process.env.NEXT_PUBLIC_IMGBB_API_KEY || '87ac08b1fe96f1eec8ec5a764548dd56';
            const uploadRes = await fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
                method: 'POST',
                body: formData
            });

            const uploadData = await uploadRes.json();

            if (!uploadData.success) {
                throw new Error("Failed to upload screenshot: " + (uploadData.error?.message || "Unknown error"));
            }

            const screenshotUrl = uploadData.data.url;
            setIsUploading(false);

            // 2. Create Booking
            const newBookingId = generateBookingId();

            // Simulate Payment Delay
            await new Promise(resolve => setTimeout(resolve, 2000));

            // Create user profile reference (update with analysis data)
            if (user) {
                const userRef = doc(db, "users", user.uid);
                await setDoc(userRef, {
                    email: user.email,
                    lastBookingAt: serverTimestamp(),
                    bookingsCount: increment(1),
                    totalSpend: increment(totalPrice)
                }, { merge: true });
            }

            // Save structured booking
            await setDoc(doc(db, "bookings", newBookingId), {
                bookingId: newBookingId,
                userId: user?.uid,
                userEmail: user?.email,
                guest: {
                    userId: user?.uid,
                    name: name,
                    email: user?.email,
                    phone: phone
                },
                stay: {
                    checkIn: checkIn ? format(checkIn, "yyyy-MM-dd") : "",
                    checkOut: checkOut ? format(checkOut, "yyyy-MM-dd") : "",
                    totalNights: totalNights || 1,
                    adults,
                    children,
                    roomsCount
                },
                room: {
                    id: room.id,
                    name: room.name,
                    image: room.image,
                    basePricePerNight: parsePrice(room.price)
                },
                payment: {
                    method: "upi_qr_manual",
                    baseAmount: basePrice,
                    taxAmount: taxAmount,
                    totalAmount: totalPrice,
                    advanceAmount: advanceAmount,
                    paidAmount: payableAmount,
                    pendingAmount: pendingAmount,
                    paymentType: paymentType,
                    currency: "INR",
                    status: "verification_pending",
                    screenshotUrl: screenshotUrl
                },
                status: "pending", // Pending Admin Approval
                createdAt: serverTimestamp(),
            });

            // Manage Invitation by Date
            if (room && room.id && checkIn && checkOut) {
                const getDatesInRange = (startDate: Date, endDate: Date) => {
                    const date = new Date(startDate.getTime());
                    const dates = [];
                    while (date < endDate) {
                        dates.push(format(date, "yyyy-MM-dd"));
                        date.setDate(date.getDate() + 1);
                    }
                    return dates;
                };

                const dates = getDatesInRange(checkIn, checkOut);
                const updatePromises = dates.map(dateStr => {
                    const availabilityRef = doc(db, "rooms", room.id.toString(), "availability", dateStr);
                    return setDoc(availabilityRef, {
                        bookedCount: increment(roomsCount)
                    }, { merge: true });
                });

                await Promise.all(updatePromises);
            }

            setBookingId(newBookingId);
            setStep(3);
        } catch (err: any) {
            console.error("Error adding booking: ", err);
            setError("Payment failed. Please try again. " + (err.message || ''));
        } finally {
            setIsSubmitting(false);
            setIsUploading(false);
        }
    };
    const handleDownloadTicket = async () => {
        // Element from ref or search by ID (TicketCard sets ID as `ticket-${bookingId}`)
        const element = ticketRef.current || document.getElementById(`ticket-${bookingId}`);
        if (!element) {
            console.error("Ticket element not found");
            alert("Error: Ticket element not found!");
            return;
        }

        setIsDownloading(true);
        try {


            // Get accurate dimensions
            const width = element.offsetWidth;
            const height = element.offsetHeight;

            const dataUrl = await toJpeg(element as HTMLElement, {
                quality: 0.95,
                backgroundColor: "#0f172a",
                width: width,
                height: height,
                style: {
                    margin: '0', // Reset any margins that might cause offsets
                    transform: 'none', // Reset transforms
                    borderRadius: "1.5rem",
                }
            });

            const link = document.createElement('a');
            link.download = `Booking-${bookingId}.jpg`;
            link.href = dataUrl;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);


        } catch (err: any) {
            console.error("Download failed", err);
            alert(`Download failed: ${err.message || err}`);
        } finally {
            setIsDownloading(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={step === 3 ? onClose : undefined}
                        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Header - Hidden on Ticket Step for immersive look */}
                            {step !== 3 && (
                                <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-white mb-1">
                                            {step === 1 ? "Confirm Details" : "Payment"}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            {step === 1 ? "Step 1 of 2" : ""}
                                        </p>
                                    </div>
                                    <button onClick={onClose} className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            )}

                            {/* Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {step === 1 && (
                                    <form id="booking-form" onSubmit={handleNextStep} className="space-y-6">

                                        {/* Dates */}
                                        <div className="grid grid-cols-2 gap-4">
                                            {/* Check In */}
                                            <div className="space-y-1.5 ">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Check In</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className={cn(
                                                            "w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none text-left flex items-center gap-2 relative",
                                                            !checkIn && "text-slate-500"
                                                        )}>
                                                            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                                                            <span className="ml-5">
                                                                {checkIn ? format(checkIn, "dd MMM yyyy") : "Select Date"}
                                                            </span>
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[70]" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={checkIn}
                                                            onSelect={setCheckIn}
                                                            disabled={(date) => {
                                                                const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
                                                                const dateStr = format(date, "yyyy-MM-dd");
                                                                const bookedCount = bookedDates[dateStr] || 0;
                                                                const isFull = (roomStock - bookedCount) <= 0;
                                                                return isPast || isFull;
                                                            }}
                                                            formatters={{
                                                                formatDay: (date) => {
                                                                    const dateStr = format(date, "yyyy-MM-dd");
                                                                    const bookedCount = bookedDates[dateStr] || 0;
                                                                    const left = Math.max(0, roomStock - bookedCount);
                                                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                                                    if (isPast) return <div className="opacity-50">{date.getDate()}</div>;

                                                                    return (
                                                                        <div className="flex flex-col items-center justify-center relative py-1">
                                                                            <span>{date.getDate()}</span>
                                                                            {!isPast && (
                                                                                <span className={cn(
                                                                                    "text-[9px] font-bold leading-none mt-0.5 whitespace-nowrap",
                                                                                    left === 0 ? "text-red-500 line-through" : "text-green-600"
                                                                                )}>
                                                                                    {left === 0 ? "Full" : `${left} left`}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>

                                            {/* Check Out */}
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Check Out</label>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <button className={cn(
                                                            "w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none text-left flex items-center gap-2 relative",
                                                            !checkOut && "text-slate-500"
                                                        )}>
                                                            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                                                            <span className="ml-5">
                                                                {checkOut ? format(checkOut, "dd MMM yyyy") : "Select Date"}
                                                            </span>
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0 z-[70]" align="start">
                                                        <Calendar
                                                            mode="single"
                                                            selected={checkOut}
                                                            onSelect={setCheckOut}
                                                            disabled={(date) => {
                                                                const isPast = date < (checkIn || new Date(new Date().setHours(0, 0, 0, 0)));
                                                                const dateStr = format(date, "yyyy-MM-dd");
                                                                const bookedCount = bookedDates[dateStr] || 0;
                                                                // For checkout, if previous night was full, can we check out today? 
                                                                // Usually yes, availability is for the NIGHT. 
                                                                // But if we simply disable "Full" days, user can't select checkout if that day is full?
                                                                // Valid Logic: CheckOut date itself doesn't need availability, the NIGHTS before it do.
                                                                // However, simpler to just disable full days to avoid confusion, 
                                                                // OR better: check range validity on submit.
                                                                // Disabling the specific day is good UX.
                                                                const isFull = (roomStock - bookedCount) <= 0;
                                                                return isPast || isFull;
                                                            }}
                                                            formatters={{
                                                                formatDay: (date) => {
                                                                    const dateStr = format(date, "yyyy-MM-dd");
                                                                    const bookedCount = bookedDates[dateStr] || 0;
                                                                    const left = Math.max(0, roomStock - bookedCount);
                                                                    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

                                                                    if (isPast) return <div className="opacity-50">{date.getDate()}</div>;

                                                                    return (
                                                                        <div className="flex flex-col items-center justify-center relative py-1">
                                                                            <span>{date.getDate()}</span>
                                                                            {!isPast && (
                                                                                <span className={cn(
                                                                                    "text-[9px] font-bold leading-none mt-0.5 whitespace-nowrap",
                                                                                    left === 0 ? "text-red-500" : "text-green-600"
                                                                                )}>
                                                                                    {left === 0 ? "Full" : `${left} left`}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )
                                                                }
                                                            }}
                                                        />
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </div>

                                        {/* Date Info */}
                                        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                                            <div className="flex gap-4">
                                                <span>Check-in: <strong className="text-slate-900">12:00 PM</strong></span>
                                                <span>Check-out: <strong className="text-slate-900">11:00 AM</strong></span>
                                            </div>
                                            {totalNights > 0 && (
                                                <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded-full font-bold">
                                                    {totalNights} Night{totalNights > 1 ? 's' : ''}
                                                </span>
                                            )}
                                        </div>

                                        {/* Counters */}
                                        <div className="space-y-3 bg-slate-50 p-4 rounded-xl">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Adults</p>
                                                        <p className="text-xs text-slate-500">Max 3 per room</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                    <button type="button" onClick={() => handleAdultsChange(false)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-sm font-bold w-4 text-center">{adults}</span>
                                                    <button type="button" onClick={() => handleAdultsChange(true)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-slate-600 shadow-sm">
                                                        <Users className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Children</p>
                                                        <p className="text-xs text-orange-600">Under 5 years allowed</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><Minus className="w-3 h-3" /></button>
                                                    <span className="text-sm font-bold w-4 text-center">{children}</span>
                                                    <button type="button" onClick={() => setChildren(children + 1)} className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"><Plus className="w-3 h-3" /></button>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                                                <div className="flex items-center gap-2">
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-900">Rooms</p>
                                                        <p className="text-xs text-slate-500">Auto-adjusted based on adults</p>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col items-end gap-1">
                                                    <div className="flex items-center gap-3 bg-white px-2 py-1 rounded-lg border border-slate-200">
                                                        <button
                                                            type="button"
                                                            onClick={() => setRoomsCount(Math.max(1, roomsCount - 1))}
                                                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"
                                                        >
                                                            <Minus className="w-3 h-3" />
                                                        </button>
                                                        <span className="text-sm font-bold w-4 text-center">{roomsCount}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => setRoomsCount(roomsCount + 1)}
                                                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-600"
                                                        >
                                                            <Plus className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                    {/* Availability Warning Helper */}
                                                    {(() => {
                                                        if (checkIn && checkOut) {
                                                            let minAvailable = roomStock;
                                                            const d = new Date(checkIn);
                                                            const end = new Date(checkOut);
                                                            while (d < end) {
                                                                const dateStr = format(d, "yyyy-MM-dd");
                                                                const booked = bookedDates[dateStr] || 0;
                                                                minAvailable = Math.min(minAvailable, Math.max(0, roomStock - booked));
                                                                d.setDate(d.getDate() + 1);
                                                            }

                                                            if (roomsCount > minAvailable) {
                                                                return <span className="text-[10px] text-red-500 font-bold">Only {minAvailable} available</span>
                                                            }
                                                        }
                                                        return null;
                                                    })()}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Personal Info */}
                                        <div className="space-y-4">
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="text"
                                                        required
                                                        placeholder="Enter your full name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                    <input
                                                        type="tel"
                                                        required
                                                        placeholder="+91 98765 43210"
                                                        value={phone}
                                                        onChange={(e) => setPhone(e.target.value)}
                                                        className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-orange-500/20"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4">
                                            <h4 className="text-xs font-bold text-orange-800 uppercase mb-2">Important Requirements:</h4>
                                            <ul className="space-y-1">
                                                <li className="flex items-start gap-2 text-xs text-orange-900/80">
                                                    <span className="w-1 h-1 rounded-full bg-orange-600 mt-1.5" />
                                                    Indian Nationals Only.
                                                </li>
                                                <li className="flex items-start gap-2 text-xs text-orange-900/80">
                                                    <span className="w-1 h-1 rounded-full bg-orange-600 mt-1.5" />
                                                    Valid Govt ID required. <span className="font-bold">PAN Card not accepted.</span>
                                                </li>
                                            </ul>
                                        </div>

                                        {/* Payment Summary */}
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Payment Details</h4>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Room Charges ({roomsCount} Room x {totalNights || 1} Night)</span>
                                                    <span>₹{basePrice.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>GST ({(gstRate * 100)}%)</span>
                                                    <span>₹{taxAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-base">
                                                    <span>Total Amount</span>
                                                    <span>₹{totalPrice.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                )}

                                {step === 2 && (
                                    <div className="space-y-6">

                                        {/* Payment Type Selection */}
                                        <div className="bg-slate-50 p-1 rounded-xl flex">
                                            <button
                                                onClick={() => setPaymentType('advance')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all",
                                                    paymentType === 'advance' ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                Pay Advance (20%)
                                            </button>
                                            <button
                                                onClick={() => setPaymentType('full')}
                                                className={cn(
                                                    "flex-1 py-3 px-4 rounded-lg text-sm font-bold transition-all",
                                                    paymentType === 'full' ? "bg-white text-orange-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                                )}
                                            >
                                                Pay Full Amount
                                            </button>
                                        </div>

                                        <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100 flex flex-col items-center text-center space-y-4">
                                            <h3 className="font-bold text-orange-900 text-lg">Scan to Pay</h3>
                                            <p className="text-sm text-orange-700">
                                                Please pay <strong className="text-xl">₹{payableAmount.toLocaleString()}</strong> to confirm.
                                            </p>

                                            <div className="bg-white p-3 rounded-xl shadow-sm border border-orange-100">
                                                <img
                                                    src="/payment-qr.jpg"
                                                    alt="Payment QR Code"
                                                    className="w-48 h-48 object-contain"
                                                />
                                            </div>

                                            <div className="space-y-1">
                                                <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">UPI ID</p>
                                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-orange-200">
                                                    <span className="font-mono text-slate-900 font-bold">8104787882@ybl</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                                <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Payment Breakdown</h3>
                                                <div className="space-y-2 text-sm">
                                                    <div className="flex justify-between text-slate-600">
                                                        <span>Total Booking Value</span>
                                                        <span>₹{totalPrice.toLocaleString()}</span>
                                                    </div>

                                                    {paymentType === 'advance' ? (
                                                        <>
                                                            <div className="flex justify-between text-orange-600 font-bold bg-orange-50/50 p-2 rounded-lg">
                                                                <span>Advance Payable (20%)</span>
                                                                <span>₹{advanceAmount.toLocaleString()}</span>
                                                            </div>
                                                            <div className="flex justify-between text-slate-500 text-xs px-2">
                                                                <span>Balance Due at Hotel</span>
                                                                <span>₹{pendingAmount.toLocaleString()}</span>
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="flex justify-between text-green-600 font-bold bg-green-50/50 p-2 rounded-lg">
                                                            <span>Full Payment</span>
                                                            <span>₹{totalPrice.toLocaleString()}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Screenshot Upload */}
                                            <div className="space-y-2">
                                                <label className="text-sm font-bold text-slate-900">Upload Payment Screenshot <span className="text-red-500">*</span></label>
                                                <div className="border-2 border-dashed border-slate-300 rounded-xl p-4 text-center hover:bg-slate-50 transition-colors relative">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        required
                                                        onChange={handleFileChange}
                                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    />

                                                    {screenshotPreview ? (
                                                        <div className="relative w-full h-40 rounded-lg overflow-hidden">
                                                            <img src={screenshotPreview} alt="Preview" className="w-full h-full object-contain" />
                                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
                                                                Click to change
                                                            </div>
                                                        </div>
                                                    ) : (
                                                        <div className="space-y-2 py-4 pointer-events-none">
                                                            <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                                                                <Download className="w-5 h-5 rotate-180" />
                                                            </div>
                                                            <div className="text-xs text-slate-500">
                                                                <span className="font-bold text-orange-600">Click to upload</span> or drag and drop
                                                                <br /> JPG, PNG (Max 5MB)
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                                <p className="text-xs text-slate-500">
                                                    Required for payment verification.
                                                </p>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={handleFinalPayment}
                                            disabled={isSubmitting}
                                            className="w-full bg-orange-600 hover:bg-orange-700 text-white h-14 rounded-xl text-lg font-bold shadow-lg shadow-orange-600/20 transition-all"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                    {isUploading ? "Uploading Proof..." : "Processing Booking..."}
                                                </>
                                            ) : (
                                                "Submit & Request Booking"
                                            )}
                                        </Button>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="text-center py-8">
                                        <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircle className="w-10 h-10 text-orange-600" />
                                        </div>

                                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Booking Request Sent</h2>
                                        <p className="text-slate-600 mb-8 max-w-xs mx-auto">
                                            Your booking request ID is <span className="font-mono font-bold text-slate-900">{bookingId}</span>. <br />
                                            We will verify your payment and confirm your booking shortly.
                                        </p>

                                        <div className="bg-slate-50 rounded-xl p-4 mb-8 text-sm text-left mx-4 border border-slate-100">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-500">Status</span>
                                                <span className="font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">Verification Pending</span>
                                            </div>
                                            <div className="flex justify-between mb-2">
                                                <span className="text-slate-500">Paid Amount ({paymentType === 'full' ? 'Full' : 'Partial'})</span>
                                                <span className="font-bold text-slate-900">₹{payableAmount.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-slate-500">Payment Proof</span>
                                                <span className="font-mono font-bold text-green-600 text-xs">Screenshot Uploaded</span>
                                            </div>
                                        </div>

                                        <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base font-bold transition-all">
                                            Close & Check Status Later
                                        </Button>
                                    </div>
                                )}

                                {error && (
                                    <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg mt-4">
                                        {error}
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions (Hidden on Ticket Step) */}
                            {step !== 3 && (
                                <div className="p-6 border-t border-slate-100 bg-slate-50 mt-auto">
                                    <Button
                                        form={step === 1 ? "booking-form" : undefined}
                                        type={step === 1 ? "submit" : "button"}
                                        onClick={step === 2 ? handleFinalPayment : undefined}
                                        disabled={isSubmitting || (() => {
                                            if (step === 1 && checkIn && checkOut) {
                                                const start = new Date(checkIn);
                                                const end = new Date(checkOut);
                                                const d = new Date(start);
                                                while (d < end) {
                                                    const dateStr = format(d, "yyyy-MM-dd");
                                                    const available = Math.max(0, roomStock - (bookedDates[dateStr] || 0));
                                                    if (available < roomsCount) return true;
                                                    d.setDate(d.getDate() + 1);
                                                }
                                            }
                                            return false;
                                        })()}
                                        className="w-full bg-slate-900 hover:bg-orange-600 text-white h-12 rounded-xl text-base font-bold shadow-lg shadow-slate-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSubmitting ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : step === 1 ? (
                                            <>Proceed to Payment <ArrowRight className="w-5 h-5 ml-2" /></>
                                        ) : (
                                            <>Pay ₹{totalPrice.toLocaleString()} <ArrowRight className="w-5 h-5 ml-2" /></>
                                        )}
                                    </Button>
                                    {step === 2 && (
                                        <button
                                            onClick={() => setStep(1)}
                                            className="w-full text-center text-slate-500 text-sm hover:text-slate-800 mt-4 font-medium"
                                        >
                                            Back to Details
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                    <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} />
                </>
            )}
        </AnimatePresence>
    );
}
