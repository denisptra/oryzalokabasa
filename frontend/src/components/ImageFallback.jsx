"use client";

import React from "react";

export default function ImageFallback({ src, alt, className, fallbackSrc = "https://via.placeholder.com/800x600?text=Image+not+found", ...props }) {
    return (
        <img
            src={src || fallbackSrc}
            alt={alt || "Image"}
            className={className}
            onError={(e) => {
                if (e.target.src !== fallbackSrc) {
                    e.target.onerror = null;
                    e.target.src = fallbackSrc;
                }
            }}
            {...props}
        />
    );
}
