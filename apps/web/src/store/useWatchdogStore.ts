import { create } from 'zustand';

interface WatchdogState {
    dismissed: boolean;
    dismiss: () => void;
    reset: () => void;
}

export const useWatchdogStore = create<WatchdogState>((set) => ({
    dismissed: false,
    dismiss: () => set({ dismissed: true }),
    reset: () => set({ dismissed: false }),
}));
