import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface SoundState {
  isMuted: boolean;
  setMuted: (muted: boolean) => void;
  toggleMute: () => void;
}

export const useSoundStore = create<SoundState>()(
  persist(
    (set) => ({
      isMuted: false,
      setMuted: (isMuted: boolean) => set({ isMuted }),
      toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
    }),
    {
      name: 'doodlesync-sound-settings',
    }
  )
);
