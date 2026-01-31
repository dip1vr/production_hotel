import { forwardRef } from "react";
import { CheckCircle, QrCode } from "lucide-react";

interface TicketCardProps {
    bookingId: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    guestName?: string;
    totalPrice?: string | number;
    className?: string;
}

export const TicketCard = forwardRef<HTMLDivElement, TicketCardProps>(({
    bookingId,
    roomName,
    checkIn,
    checkOut,
    guestName,
    totalPrice,
    className
}, ref) => {
    return (
        <div
            ref={ref}
            id={`ticket-${bookingId}`}
            className={`bg-slate-900 rounded-3xl p-6 text-white relative overflow-hidden mx-auto max-w-sm shadow-2xl ${className || ''}`}
        >
            {/* Decorative circles for ticket cutouts */}
            <div className="absolute -left-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 bg-white rounded-full"></div>
            <div className="absolute left-2 right-2 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-white/20"></div>

            <div className="relative z-10 pb-8 border-b border-white/10 mb-8">
                <div className="inline-flex p-3 rounded-full bg-green-500/20 mb-4">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                </div>
                <h3 className="text-2xl font-serif font-bold mb-1">Booking Confirmed</h3>
                <p className="text-white/60 text-sm">Thank you for your booking!</p>
            </div>

            <div className="relative z-10 text-left space-y-4">
                <div className="flex justify-between items-end">
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Booking ID</p>
                        <p className="font-mono text-xl font-bold tracking-wider text-orange-400">{bookingId}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Room</p>
                        <p className="font-medium text-sm text-white/90">{roomName}</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4 pt-2">
                    <div>
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Check In</p>
                        <p className="font-medium text-sm">{checkIn}</p>
                        <p className="text-white/40 text-xs">12:00 PM</p>
                    </div>
                    <div className="text-right">
                        <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Check Out</p>
                        <p className="font-medium text-sm">{checkOut}</p>
                        <p className="text-white/40 text-xs">11:00 AM</p>
                    </div>
                </div>

                {(guestName || totalPrice) && (
                    <div className="grid grid-cols-2 gap-4 pt-2">
                        {guestName && (
                            <div>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Guest</p>
                                <p className="font-medium text-sm text-white/90 truncate">{guestName}</p>
                            </div>
                        )}
                        {totalPrice && (
                            <div className={guestName ? "text-right" : ""}>
                                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest mb-1">Total Paid</p>
                                <p className="font-medium text-sm text-white/90">{typeof totalPrice === 'number' ? `₹${totalPrice.toLocaleString()}` : totalPrice}</p>
                            </div>
                        )}
                    </div>
                )}

                <div className="pt-6 mt-4 flex justify-between items-center border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg">
                            <QrCode className="w-8 h-8 text-slate-900" />
                        </div>
                        <div className="text-[10px] uppercase tracking-wide text-white/40 font-medium leading-tight">
                            <p>Scan at hotel</p>
                            <p>reception</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

TicketCard.displayName = "TicketCard";
