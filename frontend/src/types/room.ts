import { type AvatarConfig } from './game';

export type GameMode = 'normal' | 'hidden' | 'combination';
export type WordCountOption = 1 | 2 | 3 | 4 | 5;
export type HintsOption = 0 | 1 | 2 | 3 | 4 | 5;

export interface RoomSettings {
  rounds: number;           // Number of rounds (2 to 10, default: 3)
  drawTime: number;         // Turn duration in seconds (15s to 240s, default: 80s)
  maxPlayers: number;       // Maximum allowed players (2 to 20, default: 8)
  language: string;         // Word dictionary country code (e.g., 'us', 'gb', 'de')
  customWords: string[];    // Custom words input by host
  onlyCustomWords: boolean; // Whether to exclusively use custom words
  gameMode: GameMode;       // 'normal' | 'hidden' | 'combination' (default: 'normal')
  wordCount: WordCountOption; // Number of word choices: 1 to 5 (default: 3)
  hints: HintsOption;       // Max letters revealed: 0 to 5 (default: 2)
}

export interface LobbyPlayer {
  id: string;
  username: string;
  avatar: AvatarConfig;
  isHost: boolean;
  isReady: boolean;
  joinedAt: number;
  score?: number;
  isDrawing?: boolean;
  hasGuessed?: boolean;
}

export interface RoomInfo {
  id: string;               // Unique room code e.g. "DOODLE-7K9A"
  inviteLink: string;       // Full shareable URL
  isHost: boolean;          // Whether the local player is host
  settings: RoomSettings;
  createdAt: number;
  timeLeft?: number;
}

export const ROUND_OPTIONS = [2, 3, 4, 5, 6, 7, 8, 9, 10];

export const DRAW_TIME_OPTIONS = [
  { value: 15, label: '15s' },
  { value: 20, label: '20s' },
  { value: 30, label: '30s' },
  { value: 40, label: '40s' },
  { value: 50, label: '50s' },
  { value: 60, label: '60s' },
  { value: 70, label: '70s' },
  { value: 80, label: '80s (Default)' },
  { value: 90, label: '90s' },
  { value: 100, label: '100s' },
  { value: 120, label: '120s' },
  { value: 150, label: '150s' },
  { value: 180, label: '180s' },
  { value: 210, label: '210s' },
  { value: 240, label: '240s' },
];

export const MAX_PLAYERS_OPTIONS = [
  2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
];

export const GAME_MODE_OPTIONS: { value: GameMode; label: string; desc: string; icon: string }[] = [
  { value: 'normal', label: 'Normal', desc: 'Standard Skribbl mode with progressive letter hints.', icon: 'Sparkles' },
  { value: 'hidden', label: 'Hidden', desc: 'Rely on drawing alone. No length or hints revealed.', icon: 'EyeOff' },
  { value: 'combination', label: 'Combination', desc: 'Draw and guess two combined concepts (e.g. Apple + Tree).', icon: 'Layers' },
];

export const WORD_COUNT_OPTIONS: WordCountOption[] = [1, 2, 3, 4, 5];

export const HINTS_OPTIONS: HintsOption[] = [0, 1, 2, 3, 4, 5];

export interface LanguageOption {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
];

export function getLanguageMeta(code?: string): LanguageOption {
  const clean = (code || 'en').toLowerCase().trim();
  const direct = SUPPORTED_LANGUAGES.find(
    (l) => l.code === clean || l.name.toLowerCase() === clean || l.nativeName.toLowerCase() === clean
  );
  if (direct) return direct;

  if (['es', 'espanol', 'español', 'spanish', 'ar', 'cl', 'co', 'cr', 'do', 'ec', 'gt', 'hn', 'mx', 'ni', 'pa', 'pe', 'pr', 'py', 'sv', 'uy', 've'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'es')!;
  }
  if (['fr', 'french', 'francais', 'français', 'be', 'ca', 'ci', 'cm', 'sn', 'cd', 'mg', 'ml'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'fr')!;
  }
  if (['de', 'german', 'deutsch', 'at', 'ch', 'li', 'lu'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'de')!;
  }
  if (['it', 'italian', 'italiano', 'sm', 'va'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'it')!;
  }
  if (['pt', 'portuguese', 'portugues', 'português', 'br', 'ao', 'mz', 'cv', 'gw', 'st', 'tl'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'pt')!;
  }
  if (['hi', 'hindi', 'हिन्दी', 'हिंदी', 'in'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'hi')!;
  }
  if (['el', 'greek', 'ελληνικά', 'ελληνικα', 'gr', 'cy'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'el')!;
  }
  if (['nl', 'dutch', 'nederlands', 'holland'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'nl')!;
  }
  if (['pl', 'polish', 'polski'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'pl')!;
  }
  if (['en', 'english', 'us', 'gb', 'uk', 'au', 'nz', 'ie'].includes(clean)) {
    return SUPPORTED_LANGUAGES.find((l) => l.code === 'en')!;
  }

  return SUPPORTED_LANGUAGES[0];
}
