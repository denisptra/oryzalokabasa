"use client";
import { useEffect } from "react";
import { analyticsAPI } from "@/lib/api";

export default function PageTracker({ postId }) {
    useEffect(() => {
        if (postId) {
            analyticsAPI.trackPageView(postId).catch((err) => {
                console.warn("Tracker error:", err);
            });
        }
    }, [postId]);

    return null;
}
