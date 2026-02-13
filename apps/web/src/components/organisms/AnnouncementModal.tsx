"use client";

import { useEffect, useRef } from "react";
import { useTrisulaStore } from "@/src/store/useTrisulaStore";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { X, Megaphone, ExternalLink } from "lucide-react";
import { Button } from "@/src/components/atoms";
import gsap from "gsap";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export const AnnouncementModal = () => {
    const { activeAnnouncement, closeAnnouncement } = useTrisulaStore();
    const { recordView } = useAnnouncements();
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeAnnouncement) {
            // GSAP Entrance: Scale 0.5 to 1 with Bounce
            gsap.killTweensOf([modalRef.current, contentRef.current]);

            gsap.fromTo(
                modalRef.current,
                { opacity: 0 },
                { opacity: 1, duration: 0.4 }
            );

            gsap.fromTo(
                contentRef.current,
                { scale: 0.5, opacity: 0, y: 20 },
                {
                    scale: 1,
                    opacity: 1,
                    y: 0,
                    duration: 0.8,
                    ease: "bounce.out",
                    delay: 0.1
                }
            );
        }
    }, [activeAnnouncement]);

    if (!activeAnnouncement) return null;

    const handleClose = () => {
        if (activeAnnouncement) {
            recordView(activeAnnouncement.id);
        }

        // GSAP Exit
        gsap.to(contentRef.current, {
            scale: 0.9,
            opacity: 0,
            y: 10,
            duration: 0.3,
            ease: "power2.in",
            onComplete: closeAnnouncement,
        });
        gsap.to(modalRef.current, { opacity: 0, duration: 0.3 });
    };

    const handleCTA = () => {
        if (activeAnnouncement.ctaUrl) {
            window.open(activeAnnouncement.ctaUrl, "_blank");
        }
        handleClose();
    };

    const getYouTubeId = (url: string) => {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2] && match[2].length === 11) ? match[2] : null;
    };

    const videoId = activeAnnouncement.videoUrl ? getYouTubeId(activeAnnouncement.videoUrl) : null;

    return (
        <div
            ref={modalRef}
            className="fixed inset-0 z-[999] flex items-center justify-center p-4 bg-midnight-950/40 backdrop-blur-xl"
            onClick={handleClose}
        >
            <div
                ref={contentRef}
                className="relative w-full max-w-lg bg-charcoal-900/80 border border-gold-metallic/30 rounded-[2.5rem] shadow-2xl shadow-gold-metallic/20 overflow-hidden backdrop-blur-md"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Visual Flair */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-gold-metallic/10 blur-[80px] rounded-full -mr-20 -mt-20 opacity-50" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-metallic/5 blur-[60px] rounded-full -ml-16 -mb-16 opacity-30" />

                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-6 right-6 p-2.5 rounded-2xl bg-white/5 text-zinc-400 hover:text-white hover:bg-white/10 transition-all z-10 border border-white/5 group"
                >
                    <X className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                </button>

                <div className="p-8 pt-12 flex flex-col items-center text-center relative z-10">
                    {/* Header Icon */}
                    <div className="w-20 h-20 rounded-[2rem] bg-gradient-to-br from-gold-metallic/20 to-transparent border border-gold-metallic/30 flex items-center justify-center mb-8 shadow-lg shadow-gold-metallic/5 relative group">
                        <div className="absolute inset-0 bg-gold-metallic/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Megaphone className="w-10 h-10 text-gold-metallic relative z-10" />
                    </div>

                    <h2 className="text-3xl font-black text-white tracking-tight leading-tight mb-4 drop-shadow-md">
                        {activeAnnouncement.title}
                    </h2>

                    <div className="w-full space-y-6">
                        {/* Featured Content / Video */}
                        {videoId ? (
                            <div className="aspect-video w-full rounded-3xl border-2 border-gold-metallic/30 bg-black overflow-hidden shadow-xl shadow-black/50">
                                <iframe
                                    className="w-full h-full"
                                    src={`https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1`}
                                    title="Announcement Video"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                />
                            </div>
                        ) : activeAnnouncement.videoUrl ? (
                            <div className="aspect-video w-full rounded-3xl border-2 border-gold-metallic/30 bg-black overflow-hidden shadow-xl shadow-black/50">
                                <video
                                    src={activeAnnouncement.videoUrl}
                                    autoPlay
                                    muted
                                    loop
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ) : null}

                        <p className="text-zinc-400 text-base leading-relaxed px-4 font-medium">
                            {activeAnnouncement.content}
                        </p>

                        <div className="pt-4 pb-2">
                            <Button
                                onClick={handleCTA}
                                className="w-full h-16 bg-gold-metallic text-charcoal-950 font-black uppercase tracking-[0.2em] text-xs rounded-2xl border-transparent shadow-xl shadow-gold-metallic/20 gap-3 hover:translate-y-[-2px] transition-transform active:translate-y-[0]"
                            >
                                <ExternalLink className="w-4 h-4" />
                                {activeAnnouncement.ctaUrl ? "Klaim Sekarang" : "Mengerti"}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Aesthetic Detail */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gold-metallic/40 to-transparent" />
            </div>
        </div>
    );
};
