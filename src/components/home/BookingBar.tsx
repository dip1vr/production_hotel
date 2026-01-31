"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Calendar as CalendarIcon, Search, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { collection, getDocs, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

interface BookingBarProps {
    onSearch?: (params: { checkIn: string; checkOut: string; adults: number; children: number; rooms: number }) => void;
}

export function BookingBar({ onSearch }: BookingBarProps) {
    const [checkIn, setCheckIn] = useState<Date | undefined>(undefined);
    const [checkOut, setCheckOut] = useState<Date | undefined>(undefined);
    const [adults, setAdults] = useState(1);
    const [children, setChildren] = useState(0);
    const [rooms, setRooms] = useState(1);
    const [isOpen, setIsOpen] = useState(false);

    // Availability Data
    const [availabilityMap, setAvailabilityMap] = useState<Record<string, number>>({});
    const [totalHotelStock, setTotalHotelStock] = useState(0);

    const toggleOpen = () => setIsOpen(!isOpen);

    // Fetch Aggregated Availability
    useEffect(() => {
        const fetchGlobalAvailability = async () => {
            try {
                // 1. Get all rooms to calculate total theoretical stock
                const roomsSnap = await getDocs(collection(db, "rooms"));
                let totalStock = 0;
                const roomIds: string[] = [];

                roomsSnap.forEach(doc => {
                    const data = doc.data();
                    totalStock += (data.totalStock || 10); // Default 10 if missing
                    roomIds.push(doc.id);
                });
                setTotalHotelStock(totalStock);

                // 2. Fetch availability subcollections for all rooms
                const tempMap: Record<string, number> = {};

                await Promise.all(roomIds.map(async (roomId) => {
                    const availSnap = await getDocs(collection(db, "rooms", roomId, "availability"));
                    availSnap.forEach(doc => {
                        const date = doc.id;
                        const booked = doc.data().bookedCount || 0;
                        tempMap[date] = (tempMap[date] || 0) + booked;
                    });
                }));

                setAvailabilityMap(tempMap);

            } catch (error) {
                console.error("Error fetching global availability:", error);
            }
        };

        fetchGlobalAvailability();
    }, []);

    const handleAdultsChange = (delta: number) => {
        const newAdults = adults + delta;
        if (newAdults >= 1) {
            setAdults(newAdults);
            const requiredRooms = Math.ceil(newAdults / 3);
            if (rooms < requiredRooms) {
                setRooms(requiredRooms);
            }
        }
    };

    const handleChildrenChange = (delta: number) => {
        const newChildren = children + delta;
        if (newChildren >= 0) setChildren(newChildren);
    };

    const handleRoomsChange = (delta: number) => {
        const newRooms = rooms + delta;
        const requiredRooms = Math.ceil(adults / 3);
        if (newRooms >= requiredRooms && newRooms <= 10) setRooms(newRooms);
    };

    const handleSearch = () => {
        if (onSearch && checkIn && checkOut) {
            onSearch({
                checkIn: format(checkIn, "yyyy-MM-dd"),
                checkOut: format(checkOut, "yyyy-MM-dd"),
                adults,
                children,
                rooms
            });
        }
    };

    // Custom Day Content to show rooms left
    const renderDay = (day: Date) => {
        const dateStr = format(day, "yyyy-MM-dd");
        const totalBooked = availabilityMap[dateStr] || 0;
        const left = Math.max(0, totalHotelStock - totalBooked);
        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));

        if (isPast) return <div className="w-full h-full flex items-center justify-center opacity-50">{day.getDate()}</div>;

        return (
            <div className="w-full h-full flex flex-col items-center justify-center relative py-1">
                <span>{day.getDate()}</span>
                {!isPast && (
                    <span className={cn(
                        "text-[9px] font-bold leading-none mt-0.5 whitespace-nowrap",
                        left === 0 ? "text-red-500" : "text-green-600"
                    )}>
                        {left === 0 ? "Full" : `${left} left`}
                    </span>
                )}
            </div>
        );
    };

    return (
        <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-5xl mx-auto -mt-10 relative z-40 px-4"
        >
            <div className="bg-white rounded-3xl shadow-xl p-3 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-4 items-center border border-slate-100/50 backdrop-blur-sm bg-white/95">

                {/* Check In */}
                <div className="md:col-span-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-4 bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl p-3 w-full text-left border border-transparent hover:border-slate-200",
                                !checkIn && "text-slate-500"
                            )}>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Check In</p>
                                    <p className="font-serif text-lg text-slate-900 font-medium truncate">
                                        {checkIn ? format(checkIn, "dd MMM yyyy") : "Add Dates"}
                                    </p>
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={checkIn}
                                onSelect={setCheckIn}
                                disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                                formatters={{
                                    formatDay: (date) => renderDay(date)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Check Out */}
                <div className="md:col-span-3">
                    <Popover>
                        <PopoverTrigger asChild>
                            <button className={cn(
                                "flex items-center gap-4 bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl p-3 w-full text-left border border-transparent hover:border-slate-200",
                                !checkOut && "text-slate-500"
                            )}>
                                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                                    <CalendarIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Check Out</p>
                                    <p className="font-serif text-lg text-slate-900 font-medium truncate">
                                        {checkOut ? format(checkOut, "dd MMM yyyy") : "Add Dates"}
                                    </p>
                                </div>
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={checkOut}
                                onSelect={setCheckOut}
                                disabled={(date) => date < (checkIn || new Date(new Date().setHours(0, 0, 0, 0)))}
                                formatters={{
                                    formatDay: (date) => renderDay(date)
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Guests */}
                <div className="md:col-span-4 relative">
                    <button
                        onClick={toggleOpen}
                        className="flex items-center gap-4 bg-slate-50 hover:bg-slate-100 transition-all rounded-2xl p-3 w-full text-left border border-transparent hover:border-slate-200"
                    >
                        <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-orange-600 shadow-sm shrink-0">
                            <Users className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">Guests & Rooms</p>
                            <div className="flex items-center gap-1 font-serif text-lg text-slate-900 font-medium truncate">
                                <span>{adults} Adult, {rooms} Room</span>
                            </div>
                        </div>
                    </button>

                    {/* Guest Dropdown */}
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-4 z-50"
                            >
                                {/* Adults */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <p className="font-bold text-slate-900">Adults</p>
                                        <p className="text-xs text-slate-500">Ages 13 or above</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleAdultsChange(-1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                            disabled={adults <= 1}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-4 text-center font-medium">{adults}</span>
                                        <button
                                            onClick={() => handleAdultsChange(1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                {/* Rooms */}
                                <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                    <div>
                                        <p className="font-bold text-slate-900">Rooms</p>
                                        <p className="text-xs text-slate-500">Max 3 guests/room</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => handleRoomsChange(-1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-50"
                                            disabled={rooms <= 1}
                                        >
                                            <Minus className="w-3 h-3" />
                                        </button>
                                        <span className="w-4 text-center font-medium">{rooms}</span>
                                        <button
                                            onClick={() => handleRoomsChange(1)}
                                            className="w-8 h-8 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50"
                                        >
                                            <Plus className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full mt-4 bg-slate-900 text-white py-2 rounded-xl font-medium text-sm hover:bg-slate-800"
                                >
                                    Done
                                </button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Search Button */}
                <div className="md:col-span-2">
                    <Button
                        onClick={handleSearch}
                        className="w-full h-14 md:h-16 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 group"
                    >
                        <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        <span className="font-medium text-lg">Book Now</span>
                    </Button>
                </div>
            </div>
        </motion.div>
    );
}
