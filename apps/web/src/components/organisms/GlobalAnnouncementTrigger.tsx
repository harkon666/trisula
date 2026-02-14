"use client";

import { useEffect, useRef } from "react";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { useTrisulaStore } from "@/src/store/useTrisulaStore";

export const GlobalAnnouncementTrigger = () => {
    const { latestAnnouncement, isLoading } = useAnnouncements();
    const { setAnnouncement, activeAnnouncement } = useTrisulaStore();
    const lastShownId = useRef<number | null>(null);

    useEffect(() => {
        // Only set if we have a new announcement, none is currently showing, 
        // AND it's different from the last one we showed automatically.
        if (!isLoading && latestAnnouncement && !activeAnnouncement) {
            if (latestAnnouncement.id !== lastShownId.current) {
                setAnnouncement(latestAnnouncement);
                lastShownId.current = latestAnnouncement.id;
            }
        }
    }, [latestAnnouncement, isLoading, setAnnouncement, activeAnnouncement]);

    return null;
};
