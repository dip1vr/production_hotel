"use client";

import { useState, useEffect, useRef } from "react";
import { collection, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Chat, Message, sendMessage, subscribeToMessages, subscribeToAllChats } from "@/lib/chat";
import { Button } from "@/components/ui/button";
import { Send, User, Search, Clock, MessageSquare } from "lucide-react";

export default function AdminChat() {
    const [chats, setChats] = useState<Chat[]>([]);
    const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [reply, setReply] = useState("");
    const scrollRef = useRef<HTMLDivElement>(null);

    const [error, setError] = useState<string | null>(null);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);

    // Subscribe to all chats
    useEffect(() => {
        // Get current user ID for debugging
        import("@/lib/firebase").then(({ auth }) => {
            if (auth.currentUser) {
                setCurrentUserId(auth.currentUser.uid);
            }
        });

        const unsubscribe = subscribeToAllChats((updatedChats) => {
            setChats(updatedChats);
            setError(null);
        }, (err) => {
            console.error("Subscription error:", err);
            if (err.code === 'permission-denied') {
                setError("Permission denied. You are not authorized to view admin chats.");
            } else {
                setError(err.message);
            }
        });
        return () => unsubscribe();
    }, []);

    // Subscribe to messages for selected chat
    useEffect(() => {
        if (!selectedChatId) return;

        const unsubscribe = subscribeToMessages(selectedChatId, (msgs) => {
            setMessages(msgs);
        });

        return () => unsubscribe();
    }, [selectedChatId]);

    // Scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, selectedChatId]);

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedChatId || !reply.trim()) return;

        await sendMessage(selectedChatId, reply, "admin");
        setReply("");
    };

    const formatTime = (timestamp: any) => {
        if (!timestamp) return "";
        const date = timestamp.toDate();
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="flex h-[calc(100vh-100px)] bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {error && (
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg z-50">
                    <p className="font-bold">Error</p>
                    <p>{error}</p>
                    {currentUserId && (
                        <p className="text-xs mt-1">Your UID: <span className="font-mono bg-red-200 px-1 rounded select-all">{currentUserId}</span> (Add this to Firestore Rules)</p>
                    )}
                </div>
            )}
            {/* Sidebar - Chat List */}
            <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
                <div className="p-4 border-b border-slate-100">
                    <h2 className="font-serif font-semibold text-lg text-slate-900 mb-2">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search conversations..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 rounded-lg text-sm outline-none focus:ring-2 focus:ring-orange-100"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    {chats.length === 0 ? (
                        <div className="p-8 text-center text-slate-400">
                            <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No active conversations</p>
                        </div>
                    ) : (
                        chats.map((chat) => (
                            <button
                                key={chat.id}
                                onClick={() => setSelectedChatId(chat.id)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-slate-50 transition-colors border-b border-slate-50 text-left ${selectedChatId === chat.id ? "bg-orange-50 hover:bg-orange-50 border-l-4 border-l-orange-500" : "border-l-4 border-l-transparent"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline mb-1">
                                        <h3 className="font-medium text-slate-900 truncate text-sm">{chat.userName || chat.userEmail}</h3>
                                        <span className="text-[10px] text-slate-400 shrink-0">{formatTime(chat.lastMessageTimestamp)}</span>
                                    </div>
                                    <p className={`text-xs truncate ${chat.unreadCount > 0 ? 'font-bold text-slate-800' : 'text-slate-500'}`}>
                                        {chat.lastMessage || "Started a chat"}
                                    </p>
                                </div>
                                {chat.unreadCount > 0 && (
                                    <div className="w-5 h-5 bg-orange-500 rounded-full flex items-center justify-center text-[10px] text-white font-bold shrink-0">
                                        {chat.unreadCount}
                                    </div>
                                )}
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedChatId ? (
                    <>
                        {/* Header */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                    <User className="w-5 h-5 text-slate-500" />
                                </div>
                                <div>
                                    <h3 className="font-medium text-slate-900">
                                        {chats.find(c => c.id === selectedChatId)?.userName || chats.find(c => c.id === selectedChatId)?.userEmail}
                                    </h3>
                                    <span className="text-xs text-green-500 flex items-center gap-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                                        Online
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[70%] p-3 rounded-2xl text-sm shadow-sm ${msg.sender === 'admin'
                                            ? 'bg-slate-900 text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-none'
                                            }`}
                                    >
                                        <p>{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'admin' ? 'text-slate-400' : 'text-slate-400'}`}>
                                            {formatTime(msg.timestamp)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input */}
                        <form onSubmit={handleSendReply} className="p-4 bg-white border-t border-slate-100 flex gap-2">
                            <input
                                type="text"
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                placeholder="Type a reply..."
                                className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-orange-100 outline-none"
                            />
                            <Button
                                type="submit"
                                size="icon"
                                disabled={!reply.trim()}
                                className="bg-slate-900 hover:bg-orange-600 rounded-xl w-10 h-10"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </form>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                        <MessageSquare className="w-16 h-16 mb-4 opacity-20" />
                        <p>Select a conversation to start chatting</p>
                    </div>
                )}
            </div>
        </div>
    );
}
