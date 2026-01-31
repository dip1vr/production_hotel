"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Wifi, Tv, Coffee, Maximize2, Star, Wind, Utensils } from "lucide-react";
import dynamic from "next/dynamic";
import { collection, getDocs, getDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

const BookingBar = dynamic(() => import("./BookingBar").then((mod) => mod.BookingBar));
const RoomDetailsModal = dynamic(() => import("./RoomDetailsModal").then((mod) => mod.RoomDetailsModal));
const BookingModal = dynamic(() => import("./BookingModal").then((mod) => mod.BookingModal));
import { RoomImageCarousel } from "./RoomImageCarousel";

// Define the Room interface
interface Room {
    id: string | number;
    name: string;
    price: string;
    image: string;
    images?: string[];
    description: string;
    size: string;
    amenities: { icon: any; label: string }[];
    totalStock?: number;
}

// Helper to map amenity strings to icons
const getAmenityIcon = (label: string) => {
    const lowerLabel = label.toLowerCase();
    if (lowerLabel.includes("wifi")) return Wifi;
    if (lowerLabel.includes("tv")) return Tv;
    if (lowerLabel.includes("bar") || lowerLabel.includes("coffee")) return Coffee;
    if (lowerLabel.includes("ac") || lowerLabel.includes("air")) return Wind;
    if (lowerLabel.includes("dining") || lowerLabel.includes("food")) return Utensils;
    return Star; // Default icon
};

interface SearchResults {
    [roomId: string]: {
        available: number;
        isAvailable: boolean;
    }
}

export function RoomsSection() {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
    const [bookingRoom, setBookingRoom] = useState<Room | null>(null);

    // Search State
    const [searchResults, setSearchResults] = useState<SearchResults | null>(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const querySnapshot = await getDocs(collection(db, "rooms"));
                const fetchedRooms: Room[] = querySnapshot.docs.map((doc) => {
                    const data = doc.data();

                    // Format price
                    let formattedPrice = data.price;
                    if (!formattedPrice.toString().startsWith("₹")) {
                        formattedPrice = `₹${data.price}`;
                    }

                    // Format size
                    let formattedSize = data.size;
                    if (formattedSize && !formattedSize.toString().toLowerCase().includes("sq ft")) {
                        formattedSize = `${formattedSize} sq ft`;
                    }

                    // Map amenities
                    const amenities = (Array.isArray(data.amenities) ? data.amenities : []).map((amenity: string) => ({
                        icon: getAmenityIcon(amenity),
                        label: amenity
                    }));

                    const imageArray = (Array.isArray(data.images) && data.images.length > 0)
                        ? data.images
                        : (data.image ? [data.image] : []);

                    return {
                        id: doc.id,
                        name: data.name,
                        price: formattedPrice,
                        image: data.image || imageArray[0] || "",
                        images: imageArray,
                        description: data.description,
                        size: formattedSize,
                        amenities: amenities,
                        totalStock: data.totalStock || 10 // Default to 10 if not set
                    };
                });
                setRooms(fetchedRooms);
            } catch (error) {
                console.error("Error fetching rooms:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchRooms();
    }, []);

    const checkAvailability = async (checkIn: string, checkOut: string) => {
        setIsSearching(true);
        const results: SearchResults = {};

        // Helper to get all dates
        const getDates = (startIdx: Date, endIdx: Date) => {
            const date = new Date(startIdx.getTime());
            const dates = [];
            while (date < endIdx) {
                dates.push(new Date(date).toISOString().split('T')[0]);
                date.setDate(date.getDate() + 1);
            }
            return dates;
        };

        const start = new Date(checkIn);
        const end = new Date(checkOut);

        // Basic validation
        if (start >= end) {
            alert("Check-out date must be after check-in date");
            setIsSearching(false);
            return;
        }

        const dates = getDates(start, end);

        if (dates.length === 0) {
            setSearchResults(null);
            setIsSearching(false);
            return;
        }

        try {
            await Promise.all(rooms.map(async (room) => {
                // Fetch availability for each date
                const availabilityPromises = dates.map(date =>
                    getDoc(doc(db, "rooms", room.id.toString(), "availability", date))
                );

                const snapshots = await Promise.all(availabilityPromises);

                // Find max booked count across all dates in range
                let maxBooked = 0;
                snapshots.forEach(snap => {
                    if (snap.exists()) {
                        const booked = snap.data().bookedCount || 0;
                        // console.log(`[AVAILABILITY] Date: ${snap.id}, Booked: ${booked}`);
                        if (booked > maxBooked) maxBooked = booked;
                    } else {
                        // console.log(`[AVAILABILITY] Date: ${snap.id}, No bookings found (0)`);
                    }
                });

                // Calculate available
                const totalStock = room.totalStock || 10;
                const available = Math.max(0, totalStock - maxBooked);

                // console.log(`[AVAILABILITY] Room: ${room.name}, Total: ${totalStock}, MaxBooked: ${maxBooked}, Available: ${available}`);

                results[room.id] = {
                    available,
                    isAvailable: available > 0
                };
            }));

            setSearchResults(results);
        } catch (error) {
            console.error("Error checking availability:", error);
        } finally {
            setIsSearching(false);
        }
    };

    const handleBookNow = (room: Room) => {
        setBookingRoom(room);
        setSelectedRoom(null);
    };

    // Filter rooms based on search results
    const displayedRooms = searchResults
        ? rooms.filter(room => searchResults[room.id]?.isAvailable)
        : rooms;

    const totalAvailableCount = searchResults
        ? displayedRooms.reduce((acc, room) => acc + (searchResults[room.id]?.available || 0), 0)
        : 0;

    if (loading) {
        return (
            <section id="rooms" className="pb-24 bg-slate-50 relative min-h-[500px] flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center">
                    <div className="h-8 w-64 bg-slate-200 rounded mb-4"></div>
                    <div className="h-4 w-48 bg-slate-200 rounded"></div>
                </div>
            </section>
        );
    }

    return (
        <section id="rooms" className="pb-24 bg-slate-50 relative">
            <div className="container mx-auto px-4">

                {/* Booking Bar (Floating overlap) */}
                <div id="booking-bar">
                    <BookingBar onSearch={(params) => {
                        if (params.checkIn && params.checkOut) {
                            checkAvailability(params.checkIn, params.checkOut);
                        } else {
                            setSearchResults(null); // Clear search if dates invalid
                        }
                    }} />
                </div>

                {/* Search Feedback */}
                {searchResults && (
                    <div className="text-center mb-8 pt-8">
                        <div className="inline-flex items-center gap-4 bg-white/50 backdrop-blur-md border border-slate-200 px-6 py-3 rounded-full shadow-sm">
                            <span className="text-slate-900 font-medium">
                                Found {displayedRooms.length} available room types <span className="text-slate-400 font-normal">({totalAvailableCount} rooms total)</span>
                            </span>
                            <div className="h-4 w-px bg-slate-300"></div>
                            <button
                                onClick={() => setSearchResults(null)}
                                className="text-orange-600 hover:text-orange-700 font-semibold text-sm hover:underline"
                            >
                                Clear Search
                            </button>
                        </div>
                    </div>
                )}

                {isSearching && (
                    <div className="text-center mb-8">
                        <span className="text-slate-500 animate-pulse">Checking availability...</span>
                    </div>
                )}

                <div className="text-center max-w-2xl mx-auto mb-16 pt-8">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="font-serif text-4xl md:text-5xl font-bold mb-4 text-slate-900"
                    >
                        Luxury Accommodations
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-slate-600 text-lg"
                    >
                        Experience the perfect blend of traditional heritage and modern comfort
                    </motion.p>
                </div>

                {displayedRooms.length === 0 ? (
                    <div className="text-center text-slate-500 py-12">
                        {searchResults ? "No rooms available for the selected dates." : "No rooms available at the moment."}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {displayedRooms.map((room, index) => (
                            <motion.div
                                key={room.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, amount: 0.3 }}
                                transition={{ delay: index * 0.1 }}
                                className="group bg-white rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-500 flex flex-col border border-slate-100 relative"
                            >
                                {/* Image Carousel */}
                                <div className="relative h-72">
                                    <RoomImageCarousel
                                        images={room.images || [room.image]}
                                        name={room.name}
                                        className="h-full"
                                        onClick={() => setSelectedRoom(room)}
                                    />
                                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-slate-900 shadow-sm flex items-center gap-1 pointer-events-none z-10">
                                        <Maximize2 className="w-3 h-3" /> {room.size}
                                    </div>

                                    {/* Availability Badge */}
                                    {searchResults && searchResults[room.id] && (
                                        <div className="absolute top-4 left-4 bg-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm z-10 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                            {searchResults[room.id].available} rooms left
                                        </div>
                                    )}
                                </div>

                                {/* Content */}
                                <div className="p-8 flex flex-col flex-grow">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="font-serif text-2xl font-bold text-slate-900 mb-1">{room.name}</h3>
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xl font-bold text-orange-600">{room.price}</span>
                                                <span className="text-sm text-slate-400">/ night</span>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-slate-500 text-sm mb-6 leading-relaxed line-clamp-2">
                                        {room.description}
                                    </p>

                                    {/* Divider */}
                                    <div className="w-12 h-1 bg-orange-100 mb-6" />

                                    <div className="flex gap-4 mb-8">
                                        {room.amenities.slice(0, 3).map((item, i) => (
                                            <div key={i} className="flex items-center gap-1.5 text-slate-500">
                                                <item.icon className="w-4 h-4" />
                                                <span className="text-xs font-medium">{item.label}</span>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Actions */}
                                    <div className="mt-auto grid grid-cols-2 gap-3">
                                        <Button
                                            variant="outline"
                                            className="w-full border-slate-200 hover:bg-slate-50 text-slate-900"
                                            onClick={() => setSelectedRoom(room)}
                                        >
                                            Details
                                        </Button>
                                        <Button
                                            className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                                            onClick={() => handleBookNow(room)}
                                        >
                                            Book Now
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Room Details Modal */}
            <RoomDetailsModal
                room={selectedRoom}
                onClose={() => setSelectedRoom(null)}
                // In details modal, booking passes the currently viewed room
                onBook={() => selectedRoom && handleBookNow(selectedRoom)}
            />

            {/* Booking Wizard Modal */}
            <BookingModal
                room={bookingRoom}
                isOpen={!!bookingRoom}
                onClose={() => setBookingRoom(null)}
            />
        </section>
    );
}
