"use client";

import { useEffect, useRef } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "@/context/AuthContext";

export function VisitorTracker() {
    const { user } = useAuth();
    const hasLoggedRef = useRef(false);

    useEffect(() => {
        // Prevent double logging in strict mode or re-renders
        if (hasLoggedRef.current) return;

        const logVisit = async () => {
            try {
                // Check session storage to avoid logging every page refresh in the same session
                const sessionKey = "has_logged_visit_v1";
                if (sessionStorage.getItem(sessionKey)) {
                    return;
                }

                // Get IP Address
                let ip = "unknown";
                try {
                    const res = await fetch("https://api.ipify.org?format=json");
                    const data = await res.json();
                    ip = data.ip;
                } catch (e) {
                    console.error("Failed to fetch IP", e);
                }

                // Get or Create Persistent Visitor ID (for returning guests)
                let visitorId = localStorage.getItem("visitor_id");
                if (!visitorId) {
                    visitorId = crypto.randomUUID();
                    localStorage.setItem("visitor_id", visitorId);
                }

                // Device Info
                const userAgent = navigator.userAgent;
                const platform = navigator.platform;
                const screenResolution = `${window.screen.width}x${window.screen.height}`;

                // Log to Firestore
                await addDoc(collection(db, "site_visits"), {
                    visitorId,
                    ip,
                    userAgent,
                    platform,
                    screenResolution,
                    userId: user?.uid || null,
                    userEmail: user?.email || null,
                    timestamp: serverTimestamp(),
                    path: window.location.pathname,
                    referrer: document.referrer || null
                });

                // Mark session as logged
                sessionStorage.setItem(sessionKey, "true");
                hasLoggedRef.current = true;

            } catch (error) {
                console.error("Error logging visit:", error);
            }
        };

        logVisit();
    }, [user]); // Re-run if user context changes? No, usually visit is per session. But if they login, maybe we want to link it? 
    // Actually, if they login mid-session, we might want to update the record or create a new "authenticated" event. 
    // For simplicity, let's keep it one visit per session. 
    // If we want to capture the user ID, we should wait until auth is determined.
    // However, auth loading might delay the log. 
    // Let's rely on the fact that if they are already logged in when they visit, we catch it.
    // If they login *during* the session, that's an "action", not necessarily a new "visit".

    return null;
}
