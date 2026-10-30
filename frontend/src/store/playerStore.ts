import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AvatarConfig, AVATAR_PALETTES } from '../types/game';

interface PlayerState {
  username: string;
  avatar: AvatarConfig;
  language: string;
  setUsername: (name: string) => void;
  setLanguage: (lang: string) => void;
  setAvatar: (avatar: AvatarConfig) => void;
  randomizeAvatar: () => void;
  cycleColor: (direction: 'next' | 'prev') => void;
  cycleSeed: (direction: 'next' | 'prev') => void;
}

const DEFAULT_SEEDS = [
  'Gizmo', 'Sparky', 'Pixel', 'Rocket', 'Nova', 
  'Cosmo', 'Boba', 'Echo', 'Ziggy', 'Milo',
  'Astro', 'Blip', 'Rusty', 'Pip', 'Whiz'
];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      username: '',
      avatar: {
        style: 'bottts-neutral',
        seed: 'Gizmo',
        backgroundColor: AVATAR_PALETTES[0],
      },
      language: 'en',

      setUsername: (username: string) => set({ username }),
      setLanguage: (language: string) => set({ language }),
      setAvatar: (avatar: AvatarConfig) => set({ avatar }),

      randomizeAvatar: () => {
        const randomSeed = DEFAULT_SEEDS[Math.floor(Math.random() * DEFAULT_SEEDS.length)] + '-' + Math.floor(Math.random() * 999);
        const randomPalette = AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];
        set({
          avatar: {
            style: 'bottts-neutral',
            seed: randomSeed,
            backgroundColor: randomPalette,
          },
        });
      },

      cycleColor: (direction: 'next' | 'prev') => {
        const currentBg = get().avatar.backgroundColor;
        const currentIndex = AVATAR_PALETTES.indexOf(currentBg);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= AVATAR_PALETTES.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = AVATAR_PALETTES.length - 1;

        set((state) => ({
          avatar: {
            ...state.avatar,
            backgroundColor: AVATAR_PALETTES[nextIndex],
          },
        }));
      },

      cycleSeed: (direction: 'next' | 'prev') => {
        const currentSeed = get().avatar.seed;
        const baseSeed = currentSeed.split('-')[0];
        const currentIndex = DEFAULT_SEEDS.indexOf(baseSeed);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
        if (nextIndex >= DEFAULT_SEEDS.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = DEFAULT_SEEDS.length - 1;

        set((state) => ({
          avatar: {
            ...state.avatar,
            seed: DEFAULT_SEEDS[nextIndex],
          },
        }));
      },
    }),
    {
      name: 'doodlesync-player-storage',
    }
  )
);

// Helper function to build DiceBear avatar URL
export function getAvatarUrl(config: AvatarConfig): string {
  return `https://api.dicebear.com/8.x/${config.style}/svg?seed=${encodeURIComponent(config.seed)}&backgroundColor=${config.backgroundColor}`;
}
