import { create } from 'zustand';

export interface Announcement {
    id: number;
    title: string | null;
    content: string | null;
    videoUrl: string | null;
    ctaUrl: string | null;
    isActive: boolean | null;
    createdAt: string | null;
}

interface TrisulaState {
    activeAnnouncement: Announcement | null;
    setAnnouncement: (announcement: Announcement | null) => void;
    closeAnnouncement: () => void;
}

export const useTrisulaStore = create<TrisulaState>()((set) => ({
    activeAnnouncement: null,
    setAnnouncement: (announcement: Announcement | null) => set({ activeAnnouncement: announcement }),
    closeAnnouncement: () => set({ activeAnnouncement: null }),
}));
