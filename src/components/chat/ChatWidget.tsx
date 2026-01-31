"use client";

import { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, Loader2, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { initializeChat, sendMessage, subscribeToMessages, markUserMessagesAsRead, subscribeToChatDoc, Message, Chat } from "@/lib/chat";

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState<any>(null);
    const [unreadCount, setUnreadCount] = useState(0);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await initializeChat(currentUser.uid, currentUser.email || "Anonymous", currentUser.displayName || undefined);

                const unsubscribeMessages = subscribeToMessages(currentUser.uid, (msgs) => {
                    setMessages(msgs);
                });

                const unsubscribeChat = subscribeToChatDoc(currentUser.uid, (chat) => {
                    if (chat && chat.userUnreadCount) {
                        setUnreadCount(chat.userUnreadCount);
                    } else {
                        setUnreadCount(0);
                    }
                });

                return () => {
                    unsubscribeMessages();
                    unsubscribeChat();
                };
            } else {
                setUser(null);
                setMessages([]);
                setUnreadCount(0);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    useEffect(() => {
        if (isOpen && user && unreadCount > 0) {
            markUserMessagesAsRead(user.uid);
            // Optimistically reset locally
            setUnreadCount(0);
        }
    }, [isOpen, unreadCount, user]);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isOpen]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !user) return;

        setNewMessage("");
        try {
            await sendMessage(user.uid, newMessage, "user");
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }).toLowerCase();
    };

    if (!user) {
        // Option: Show nothing if not logged in, or show a "Login to Chat" prompt
        // For now, let's show the bubble but prompt login inside
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <AnimatePresence>
                    {isOpen ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.95 }}
                            className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-slate-100 flex flex-col h-[500px]"
                        >
                            <div className="p-4 bg-slate-900 flex justify-between items-center text-white">
                                <h3 className="font-serif font-semibold">Chat with Support</h3>
                                <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center space-y-4">
                                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
                                    <User className="w-8 h-8" />
                                </div>
                                <p className="text-slate-600">Please sign in to chat with our support team.</p>
                            </div>
                        </motion.div>
                    ) : (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsOpen(true)}
                            className="w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
                        >
                            <MessageCircle className="w-7 h-7" />
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>
        )
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="bg-white rounded-2xl shadow-2xl w-80 sm:w-96 overflow-hidden border border-slate-100 flex flex-col h-[500px] mb-4"
                    >
                        {/* Header */}
                        <div className="p-4 bg-slate-900 flex justify-between items-center text-white shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <h3 className="font-serif font-semibold">Support Team</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-slate-800 p-1 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.length === 0 ? (
                                <div className="text-center text-slate-400 text-sm mt-8">
                                    <p>Start a conversation with us!</p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                                    >
                                        <div
                                            className={`max-w-[80%] p-3 rounded-2xl text-sm relative group ${msg.sender === 'user'
                                                    ? 'bg-orange-600 text-white rounded-tr-none'
                                                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-none'
                                                }`}
                                        >
                                            <p>{msg.text}</p>
                                            <div className={`text-[10px] mt-1 flex items-center gap-1 ${msg.sender === 'user' ? 'text-orange-200 justify-end' : 'text-slate-400 justify-start'
                                                }`}>
                                                {formatTime(msg.timestamp)}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-100 shrink-0 flex gap-2">
                            <input
                                type="text"
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!newMessage.trim()}
                                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-orange-600 text-white transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {!isOpen && (
                <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(true)}
                    className="relative w-14 h-14 bg-slate-900 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-orange-600 transition-colors"
                >
                    {user && unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white animate-bounce">
                            {unreadCount}
                        </span>
                    )}
                    <MessageCircle className="w-7 h-7" />
                </motion.button>
            )}
        </div>
    );
}
