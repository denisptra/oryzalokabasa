"use client";
import React from "react";
import { Share2 } from "lucide-react";
import {
    FacebookShareButton,
    TwitterShareButton,
    WhatsappShareButton,
    LinkedinShareButton,
    FacebookIcon,
    TwitterIcon,
    WhatsappIcon,
    LinkedinIcon,
} from "react-share";

export default function ShareBlock({ title, description, thumbnail }) {
    const [shareUrl, setShareUrl] = React.useState("");

    React.useEffect(() => {
        setShareUrl(window.location.href);
    }, []);

    const handleShare = async () => {
        if (navigator.share) {
            try {
                // Try to create a File object from the thumbnail if possible (Web Share API Level 2)
                let shareData = {
                    title: title || "Artikel",
                    text: description ? description.replace(/<[^>]+>/g, '') : "Baca artikel selengkapnya di Oryza Lokabasa",
                    url: window.location.href,
                };

                let canShareFile = false;
                if (navigator.canShare && thumbnail) {
                    try {
                        const response = await fetch(thumbnail);
                        const blob = await response.blob();
                        const file = new File([blob], "thumbnail.jpg", { type: blob.type || "image/jpeg" });

                        // Check if browser supports sharing this specific file
                        if (navigator.canShare({ files: [file] })) {
                            shareData.files = [file];
                            canShareFile = true;
                        }
                    } catch (e) {
                        console.log("Could not fetch thumbnail for sharing", e);
                    }
                }

                await navigator.share(shareData);
            } catch (err) {
                console.log("Share failed", err);
            }
        } else {
            navigator.clipboard.writeText(window.location.href);
            alert("Link disalin ke clipboard!");
        }
    };

    return (
        <div className="flex items-center gap-3">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mr-2 cursor-default">
                Bagikan:
            </span>

            <button
                onClick={handleShare}
                className="p-2 rounded-full border border-slate-200 hover:bg-slate-50 transition text-slate-600 sm:hidden"
                title="Bagikan"
            >
                <Share2 size={18} />
            </button>

            {shareUrl && (
                <div className="hidden sm:flex items-center gap-2">
                    <FacebookShareButton url={shareUrl} title={title}>
                        <FacebookIcon
                            size={32}
                            round
                            className="hover:scale-110 transition-transform"
                        />
                    </FacebookShareButton>

                    <TwitterShareButton url={shareUrl} title={title}>
                        <TwitterIcon
                            size={32}
                            round
                            className="hover:scale-110 transition-transform"
                        />
                    </TwitterShareButton>

                    <WhatsappShareButton url={shareUrl} title={title} separator=":: ">
                        <WhatsappIcon
                            size={32}
                            round
                            className="hover:scale-110 transition-transform"
                        />
                    </WhatsappShareButton>

                    <LinkedinShareButton url={shareUrl} title={title}>
                        <LinkedinIcon
                            size={32}
                            round
                            className="hover:scale-110 transition-transform"
                        />
                    </LinkedinShareButton>
                </div>
            )}
        </div>
    );
}
