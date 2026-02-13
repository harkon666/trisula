"use client";

import { useEffect } from "react";
import { useAnnouncements } from "@/src/hooks/useAnnouncements";
import { useTrisulaStore } from "@/src/store/useTrisulaStore";

export const GlobalAnnouncementTrigger = () => {
    const { latestAnnouncement, isLoading } = useAnnouncements();
    const { setAnnouncement, activeAnnouncement } = useTrisulaStore();

    useEffect(() => {
        // Only set if we have a new announcement and none is currently showing
        if (!isLoading && latestAnnouncement && !activeAnnouncement) {
            setAnnouncement(latestAnnouncement);
        }
    }, [latestAnnouncement, isLoading, setAnnouncement, activeAnnouncement]);

    return null;
};
