"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, updateDoc, doc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Loader2, Calendar, MapPin, Users, XCircle, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/layout/Navbar";
import Image from "next/image";
import { toJpeg } from 'html-to-image';
import { TicketCard } from "@/components/home/TicketCard";

export interface Booking {
    id: string; // This is the Booking ID (e.g., BK-XXXX)
    bookingId: string; // Redundant but good to have in data

    room: {
        name: string;
        image: string;
        basePricePerNight: number;
    };

    stay: {
        checkIn: string;
        checkOut: string;
        roomsCount: number;
        adults: number;
        children: number;
        totalNights: number;
    };

    guest: {
        name: string;
        phone: string;
        email: string;
    };

    payment: {
        totalAmount: number;
        status: string;
    };

    status: 'confirmed' | 'cancelled';
    createdAt: Timestamp;

    // Legacy fields support (optional, for old data to not crash app)
    roomName?: string;
    roomImage?: string;
    price?: string;
    checkIn?: string;
    checkOut?: string;
    roomsCount?: number;
    adults?: number;
    children?: number;
    guestName?: string;
    guestPhone?: string;
}

export default function MyBookingsPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [cancellingId, setCancellingId] = useState<string | null>(null);
    const [downloadingId, setDownloadingId] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push("/");
            return;
        }

        if (user) {
            fetchBookings(user.uid);
        }
    }, [user, authLoading, router]);

    const fetchBookings = async (userId: string) => {
        try {
            // Note: Use simple query first. Compound queries with orderBy need index in Firestore.
            // If orderBy("createdAt", "desc") fails, remove it or create index.
            const q = query(
                collection(db, "bookings"),
                where("userId", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const fetchedBookings: Booking[] = [];
            querySnapshot.forEach((doc) => {
                fetchedBookings.push({ id: doc.id, ...doc.data() } as Booking);
            });

            // Sort manually if needed (client-side sort for simplicity without index)
            fetchedBookings.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });

            setBookings(fetchedBookings);
        } catch (err: unknown) {
            console.error(err);
            setError("Failed to fetch bookings.");
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (bookingId: string) => {
        if (!confirm("Are you sure you want to cancel this booking?")) return;

        setCancellingId(bookingId);
        try {
            await updateDoc(doc(db, "bookings", bookingId), {
                status: "cancelled"
            });

            // Update local state
            setBookings(prev =>
                prev.map(b => b.id === bookingId ? { ...b, status: "cancelled" } : b)
            );
        } catch (err) {
            console.error(err);
            alert("Failed to cancel booking.");
        } finally {
            setCancellingId(null);
        }
    };

    const handleDownloadTicket = async (booking: Booking) => {
        setDownloadingId(booking.id);
        // Wait for render
        setTimeout(async () => {
            const element = document.getElementById(`ticket-${booking.id}`);
            if (!element) {
                console.error("Ticket element not found");
                alert("Error: Ticket element not found!");
                setDownloadingId(null);
                return;
            }

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
                        margin: '0',
                        transform: 'none',
                        borderRadius: "1.5rem",
                    }
                });

                const link = document.createElement('a');
                link.download = `Booking-${booking.bookingId || booking.id}.jpg`;
                link.href = dataUrl;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

            } catch (err) {
                console.error("Download failed", err);
                alert("Failed to download ticket.");
            } finally {
                setDownloadingId(null);
            }
        }, 100);
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
            </div>
        );
    }

    return (
        <main className="min-h-screen bg-slate-50 pb-20">
            <Navbar />

            <div className="container mx-auto px-4 pt-32 max-w-4xl">
                <div className="flex items-end justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">My Bookings</h1>
                        <p className="text-slate-500">Manage your upcoming stays and history</p>
                    </div>
                    {user && (
                        <div className="text-right hidden sm:block">
                            <p className="text-sm text-slate-400 font-medium">Logged in as</p>
                            <p className="text-slate-900 font-bold">{user.email}</p>
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        {error}
                    </div>
                )}

                {bookings.length === 0 ? (
                    <div className="bg-white rounded-3xl p-12 text-center shadow-sm">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 mx-auto mb-4">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings yet</h3>
                        <p className="text-slate-500 mb-6">You haven&apos;t made any bookings with us yet.</p>
                        <Button
                            onClick={() => router.push("/#rooms")}
                            className="bg-slate-900 hover:bg-orange-600 text-white rounded-xl"
                        >
                            Establish a Booking
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {bookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-100 transition-all hover:shadow-md overflow-hidden">
                                <div className="flex flex-col md:flex-row gap-6">
                                    {/* Room Image */}
                                    <div className="w-full md:w-48 h-40 md:h-auto shrink-0 relative rounded-2xl overflow-hidden bg-slate-100 hidden sm:block">
                                        {booking.room?.image || booking.roomImage ? (
                                            <Image
                                                src={booking.room?.image || booking.roomImage || ""}
                                                alt={booking.room?.name || booking.roomName || "Room Image"}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-300">
                                                <Calendar className="w-8 h-8 opacity-50" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex flex-col md:flex-row gap-6 flex-1 justify-between items-start md:items-center">
                                        <div className="space-y-4 flex-1 w-full">
                                            <div className="flex items-center justify-between md:justify-start gap-3">
                                                <div>
                                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-0.5">#{booking.id}</p>
                                                    <h3 className="font-serif text-xl font-bold text-slate-900">{booking.room?.name || booking.roomName}</h3>
                                                </div>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${booking.status === 'cancelled'
                                                        ? 'bg-red-50 text-red-600 border border-red-100'
                                                        : 'bg-green-50 text-green-600 border border-green-100'
                                                        }`}
                                                >
                                                    {booking.status}
                                                </span>
                                            </div>

                                            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <Calendar className="w-4 h-4 text-slate-400" />
                                                    <span>{booking.stay?.checkIn || booking.checkIn} - {booking.stay?.checkOut || booking.checkOut}</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <MapPin className="w-4 h-4 text-slate-400" />
                                                    <span>{booking.stay?.roomsCount || booking.roomsCount} Room(s)</span>
                                                </div>
                                                <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg">
                                                    <Users className="w-4 h-4 text-slate-400" />
                                                    <span>{booking.stay?.adults || booking.adults} Adults, {booking.stay?.children || booking.children} Children</span>
                                                </div>
                                            </div>

                                            {/* Guest Info */}
                                            <div className="pt-4 mt-4 border-t border-slate-100 grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Guest Name</p>
                                                    <p className="font-medium text-slate-900">{booking.guest?.name || booking.guestName || "N/A"}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">Phone</p>
                                                    <p className="font-medium text-slate-900">{booking.guest?.phone || booking.guestPhone || "N/A"}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-col items-end gap-3 min-w-[140px]">
                                            <div className="text-right">
                                                <p className="text-sm text-slate-400 font-medium">Total Price</p>
                                                <p className="font-serif text-xl font-bold text-slate-900">
                                                    {booking.payment?.totalAmount
                                                        ? `₹${booking.payment.totalAmount.toLocaleString()}`
                                                        : booking.price}
                                                </p>
                                            </div>

                                            {booking.status !== 'cancelled' && (
                                                <>
                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleDownloadTicket(booking)}
                                                        disabled={downloadingId === booking.id}
                                                        className="border-slate-200 text-slate-700 hover:bg-slate-50 w-full"
                                                    >
                                                        {downloadingId === booking.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <Download className="w-4 h-4 mr-2" /> Download Ticket
                                                            </>
                                                        )}
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        onClick={() => handleCancel(booking.id)}
                                                        disabled={cancellingId === booking.id}
                                                        className="border-red-200 text-red-600 hover:bg-red-50 w-full"
                                                    >
                                                        {cancellingId === booking.id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : (
                                                            <>
                                                                <XCircle className="w-4 h-4 mr-2" /> Cancel
                                                            </>
                                                        )}
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    {/* Valid Ticket Render just for this booking if active to avoid cluttering DOM */}
                                    {downloadingId === booking.id && (
                                        <div className="absolute top-0 left-0 w-full h-full -z-50 opacity-0 pointer-events-none overflow-hidden">
                                            <div className="w-[400px]">
                                                <TicketCard
                                                    bookingId={booking.bookingId || booking.id}
                                                    roomName={booking.room?.name || booking.roomName || ""}
                                                    checkIn={booking.stay?.checkIn || booking.checkIn || ""}
                                                    checkOut={booking.stay?.checkOut || booking.checkOut || ""}
                                                    guestName={booking.guest?.name || booking.guestName}
                                                    totalPrice={booking.payment?.totalAmount || booking.price}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
