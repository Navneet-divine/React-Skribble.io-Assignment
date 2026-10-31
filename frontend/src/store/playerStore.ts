import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type AvatarConfig, AVATAR_PALETTES } from '../types/game';

interface PlayerState {
  playerId: string;
  username: string;
  avatar: AvatarConfig;
  language: string;
  setUsername: (name: string) => void;
  setLanguage: (lang: string) => void;
  setAvatar: (avatar: AvatarConfig) => void;
  randomizeAvatar: () => void;
  cycleColor: (direction: 'next' | 'prev') => void;
  cycleSeed: (direction: 'next' | 'prev') => void;
  ensureUsername: () => string;
  randomizeUsername: () => string;
  ensurePlayerId: () => string;
}

const ADJECTIVES = [
  'Clever', 'Swift', 'Happy', 'Doodle', 'Neon', 'Pixel', 'Cosmic', 'Speedy',
  'Brave', 'Magic', 'Silent', 'Shadow', 'Lucky', 'Mighty', 'Curious', 'Golden',
  'Hyper', 'Chill', 'Vivid', 'Sparky', 'Crafty', 'Wild', 'Jolly', 'Sneaky'
];

const NOUNS = [
  'Fox', 'Panda', 'Koala', 'Otter', 'Falcon', 'Tiger', 'Bear', 'Gecko',
  'Lion', 'Rabbit', 'Eagle', 'Wolf', 'Dolphin', 'Badger', 'Lynx', 'Penguin',
  'Cheetah', 'Owl', 'Hawk', 'Beaver', 'Jaguar', 'Chameleon', 'Turtle', 'Raccoon'
];

export function generateMeaningfulUsername(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 89) + 10;
  return `${adj}${noun}${num}`;
}

const DEFAULT_SEEDS = [
  'Gizmo', 'Sparky', 'Pixel', 'Rocket', 'Nova', 
  'Cosmo', 'Boba', 'Echo', 'Ziggy', 'Milo',
  'Astro', 'Blip', 'Rusty', 'Pip', 'Whiz'
];

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      playerId: '',
      username: '',
      avatar: {
        style: 'bottts-neutral',
        seed: 'Gizmo',
        backgroundColor: AVATAR_PALETTES[0],
      },
      language: 'en',

      ensurePlayerId: () => {
        let currentId = get().playerId;
        if (!currentId) {
          currentId = `p-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          set({ playerId: currentId });
        }
        return currentId;
      },

      setUsername: (username: string) => set({ username }),
      setLanguage: (language: string) => set({ language }),
      setAvatar: (avatar: AvatarConfig) => set({ avatar }),

      ensureUsername: () => {
        const current = get().username.trim();
        if (current.length >= 2) return current;
        const generated = generateMeaningfulUsername();
        set({ username: generated });
        return generated;
      },

      randomizeUsername: () => {
        const generated = generateMeaningfulUsername();
        set({ username: generated });
        return generated;
      },

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
