"use client";

import React from "react";

export default function ImageFallback({ src, alt, className, fallbackSrc = "/fallback.jpg", ...props }) {
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
