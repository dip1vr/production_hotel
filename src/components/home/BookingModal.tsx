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
    const [paymentMethod, setPaymentMethod] = useState("card"); // card, upi, wallet
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
            setPaymentMethod("card");
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

    const handleFinalPayment = async () => {
        setIsSubmitting(true);
        const newBookingId = generateBookingId();

        // Simulate Payment Delay
        await new Promise(resolve => setTimeout(resolve, 2000));

        try {
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
                userId: user?.uid, // Top-level for querying
                userEmail: user?.email, // Top-level for querying
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
                    name: room.name,
                    image: room.image,
                    basePricePerNight: parsePrice(room.price)
                },
                payment: {
                    method: paymentMethod,
                    baseAmount: basePrice,
                    taxAmount: taxAmount,
                    totalAmount: totalPrice,
                    currency: "INR",
                    status: "paid"
                },
                status: "confirmed",
                createdAt: serverTimestamp(),
            });

            // Manage Invitation by Date
            if (room && room.id && checkIn && checkOut) {
                // Helper to get all dates in range
                const getDatesInRange = (startDate: Date, endDate: Date) => {
                    const date = new Date(startDate.getTime());
                    const dates = [];
                    while (date < endDate) {
                        dates.push(format(date, "yyyy-MM-dd"));
                        date.setDate(date.getDate() + 1);
                    }
                    return dates;
                };

                const dates = getDatesInRange(checkIn, checkOut); // Already Date objects

                // Update availability for each date
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
        } catch (err) {
            console.error("Error adding booking: ", err);
            setError("Payment failed. Please try again.");
        } finally {
            setIsSubmitting(false);
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
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl pointer-events-auto overflow-hidden max-h-[90vh] flex flex-col">
                            {/* Header - Hidden on Ticket Step for immersive look */}
                            {step !== 3 && (
                                <div className="bg-slate-900 p-6 flex items-start justify-between shrink-0">
                                    <div>
                                        <h2 className="text-2xl font-serif font-bold text-white mb-1">
                                            {step === 1 ? "Confirm Details" : "Payment (Demo)"}
                                        </h2>
                                        <p className="text-slate-400 text-sm">
                                            {step === 1 ? "Step 1 of 2" : "Test Mode - No real payment required"}
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
                                                            "w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none text-left flex items-center gap-2",
                                                            !checkIn && "text-slate-500"
                                                        )}>
                                                            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                                                            <span className="ml-5">
                                                                {checkIn ? format(checkIn, "dd MMM yyyy") : "Select Date"}
                                                            </span>
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
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
                                                            "w-full pl-9 pr-4 py-2.5 bg-slate-50 rounded-xl text-sm font-medium outline-none text-left flex items-center gap-2",
                                                            !checkOut && "text-slate-500"
                                                        )}>
                                                            <CalendarIcon className="w-4 h-4 text-slate-400 absolute left-3" />
                                                            <span className="ml-5">
                                                                {checkOut ? format(checkOut, "dd MMM yyyy") : "Select Date"}
                                                            </span>
                                                        </button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-auto p-0" align="start">
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
                                        <div className="bg-slate-50 p-4 rounded-xl space-y-3">
                                            <h3 className="font-bold text-slate-900">Order Summary</h3>
                                            <div className="space-y-2 text-sm">
                                                <div className="flex justify-between text-slate-600">
                                                    <span>Room Charges ({roomsCount} x {totalNights} nights)</span>
                                                    <span>₹{basePrice.toLocaleString()}</span>
                                                </div>
                                                <div className="flex justify-between text-slate-600">
                                                    <span>GST ({(gstRate * 100)}%)</span>
                                                    <span>₹{taxAmount.toLocaleString()}</span>
                                                </div>
                                                <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900 text-lg">
                                                    <span>To Pay</span>
                                                    <span>₹{totalPrice.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">Select Payment Method</h3>
                                            <div className="grid grid-cols-1 gap-3">
                                                <button
                                                    onClick={() => setPaymentMethod('card')}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'card' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'card' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        <CreditCard className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-900">Credit / Debit Card</p>
                                                        <p className="text-xs text-slate-500">Visa, Mastercard, RuPay</p>
                                                    </div>
                                                    {paymentMethod === 'card' && <CheckCircle className="w-5 h-5 text-orange-500 ml-auto" />}
                                                </button>

                                                <button
                                                    onClick={() => setPaymentMethod('upi')}
                                                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${paymentMethod === 'upi' ? 'border-orange-500 bg-orange-50/50' : 'border-slate-100 hover:border-slate-200'}`}
                                                >
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${paymentMethod === 'upi' ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-500'}`}>
                                                        <Smartphone className="w-5 h-5" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="font-bold text-slate-900">UPI</p>
                                                        <p className="text-xs text-slate-500">GPay, PhonePe, Paytm</p>
                                                    </div>
                                                    {paymentMethod === 'upi' && <CheckCircle className="w-5 h-5 text-orange-500 ml-auto" />}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {step === 3 && (
                                    <div className="text-center py-2">
                                        <TicketCard
                                            ref={ticketRef}
                                            bookingId={bookingId}
                                            roomName={room.name}
                                            checkIn={checkIn ? format(checkIn, "dd MMM yyyy") : ""}
                                            checkOut={checkOut ? format(checkOut, "dd MMM yyyy") : ""}
                                            guestName={name}
                                            totalPrice={totalPrice}
                                            className="mb-6"
                                        />

                                        <p className="text-sm text-slate-500 mb-6">A confirmation email has been sent to your email address.</p>

                                        <div className="flex flex-col gap-3">
                                            <Button
                                                onClick={handleDownloadTicket}
                                                disabled={isDownloading}
                                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-900 h-12 rounded-xl text-base font-bold transition-all flex items-center justify-center gap-2"
                                            >
                                                {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                                                {isDownloading ? "Downloading..." : "Download Ticket"}
                                            </Button>

                                            <Button
                                                onClick={async () => {
                                                    if (!confirm("Are you sure you want to cancel this booking?")) return;
                                                    setIsSubmitting(true);
                                                    try {
                                                        // 1. Mark booking as cancelled
                                                        await updateDoc(doc(db, "bookings", bookingId), {
                                                            status: "cancelled",
                                                            cancelledAt: serverTimestamp()
                                                        });

                                                        // 2. Restore Availability
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

                                                            // Remove debug alert
                                                            // alert(`Restoring ${roomsCount} room(s) for dates: ${dates.join(", ")}`);

                                                            const updatePromises = dates.map(dateStr => {
                                                                const availabilityRef = doc(db, "rooms", room.id.toString(), "availability", dateStr);
                                                                return setDoc(availabilityRef, {
                                                                    bookedCount: increment(-roomsCount)
                                                                }, { merge: true });
                                                            });
                                                            await Promise.all(updatePromises);

                                                            // Update local state to reflect cancellation immediately
                                                            setBookedDates(prev => {
                                                                const newDates = { ...prev };
                                                                dates.forEach(dateStr => {
                                                                    if (newDates[dateStr]) {
                                                                        newDates[dateStr] = Math.max(0, newDates[dateStr] - roomsCount);
                                                                    }
                                                                });
                                                                return newDates;
                                                            });

                                                            alert("Booking cancelled. Availability has been restored.");
                                                            onClose();
                                                        }
                                                    } catch (e) {
                                                        console.error("Error cancelling booking:", e);
                                                        setError("Failed to cancel booking");
                                                    } finally {
                                                        setIsSubmitting(false);
                                                    }
                                                }}
                                                className="w-full bg-red-50 hover:bg-red-100 text-red-600 h-12 rounded-xl text-base font-bold transition-all"
                                            >
                                                Cancel Booking
                                            </Button>

                                            <Button onClick={onClose} className="w-full bg-slate-900 hover:bg-slate-800 text-white h-12 rounded-xl text-base font-bold transition-all">
                                                Close
                                            </Button>
                                        </div>
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
