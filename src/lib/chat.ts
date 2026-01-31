import { db } from "./firebase";
import {
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    doc,
    setDoc,
    updateDoc,
    getDoc,
    increment
} from "firebase/firestore";

export interface Message {
    id: string;
    text: string;
    sender: 'user' | 'admin';
    timestamp: any;
}

export interface Chat {
    id: string; // userId
    userEmail: string;
    userName?: string;
    lastMessage: string;
    lastMessageTimestamp: any;
    unreadCount: number; // Messages unread by admin
    userUnreadCount?: number; // Messages unread by user
}

// Ensure a chat document exists for the user
export const initializeChat = async (userId: string, userEmail: string, userName?: string) => {
    const chatRef = doc(db, "chats", userId);
    const chatSnap = await getDoc(chatRef);

    if (!chatSnap.exists()) {
        await setDoc(chatRef, {
            id: userId,
            userEmail,
            userName: userName || userEmail.split('@')[0],
            lastMessage: "",
            lastMessageTimestamp: serverTimestamp(),
            unreadCount: 0,
            userUnreadCount: 0
        });
    }
};

// Send a message
export const sendMessage = async (userId: string, text: string, sender: 'user' | 'admin') => {
    const chatRef = doc(db, "chats", userId);
    const messagesRef = collection(chatRef, "messages");

    // Add message to subcollection
    await addDoc(messagesRef, {
        text,
        sender,
        timestamp: serverTimestamp()
    });

    // Update chat summary
    const updateData: any = {
        lastMessage: text,
        lastMessageTimestamp: serverTimestamp(),
    };

    if (sender === 'user') {
        updateData.unreadCount = increment(1);
    } else {
        updateData.userUnreadCount = increment(1);
        updateData.unreadCount = 0; // Reset admin unread count when admin replies
    }

    await updateDoc(chatRef, updateData);
};

export const markUserMessagesAsRead = async (userId: string) => {
    const chatRef = doc(db, "chats", userId);
    await updateDoc(chatRef, {
        userUnreadCount: 0
    });
};

export const subscribeToChatDoc = (userId: string, callback: (chat: Chat | null) => void) => {
    const chatRef = doc(db, "chats", userId);
    return onSnapshot(chatRef, (doc) => {
        if (doc.exists()) {
            callback({ id: doc.id, ...doc.data() } as Chat);
        } else {
            callback(null);
        }
    });
};

// Subscribe to messages for a specific chat
export const subscribeToMessages = (userId: string, callback: (messages: Message[]) => void) => {
    const messagesRef = collection(db, "chats", userId, "messages");
    const q = query(messagesRef, orderBy("timestamp", "asc"));

    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Message));
        callback(messages);
    });
};

// Subscribe to all chats (for admin)
export const subscribeToAllChats = (callback: (chats: Chat[]) => void, onError?: (error: any) => void) => {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, orderBy("lastMessageTimestamp", "desc"));

    return onSnapshot(q, (snapshot) => {
        const chats = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        } as Chat));
        callback(chats);
    }, (error) => {
        if (onError) onError(error);
        else console.error("Error subscribing to chats:", error);
    });
};
