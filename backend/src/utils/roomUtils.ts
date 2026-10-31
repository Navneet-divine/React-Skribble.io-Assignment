import { type Room, type GameMode } from '../types/index.js';

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

/**
 * Generate a clean 4-character alphanumeric room code (omitting confusing characters like 0, 1, O, I).
 */
export function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOODLE-${code}`;
}

/**
 * Convert Room map to a JSON-serializable payload for Socket broadcasts.
 * Never broadcasts the unrevealed secret word during choosing or drawing.
 */
export function serializeRoom(room: Room) {
  // Only expose the secret word once the turn/round has concluded
  const isConcluded = room.status === 'round_end' || room.status === 'game_end';

  return {
    id: room.id,
    isPublic: Boolean(room.isPublic),
    settings: room.settings,
    status: room.status,
    players: Array.from(room.players.values()).map((p) => ({
      id: p.id,
      socketId: p.socketId,
      username: p.username,
      avatar: p.avatar,
      score: p.score ?? 0,
      isHost: Boolean(p.isHost),
      isReady: Boolean(p.isReady),
      isDrawing: Boolean(p.isDrawing),
      hasGuessed: Boolean(p.hasGuessed),
      joinedAt: p.joinedAt,
      isDisconnected: Boolean(p.isDisconnected),
    })),
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    currentDrawerId: room.currentDrawerId,
    currentWord: isConcluded ? room.currentWord : '',
    revealedIndices: room.revealedIndices,
    timeLeft: room.timeLeft,
    strokesCount: room.strokes.length,
  };
}

/**
 * Calculate dynamic score based on remaining turn time.
 */
export function calculateGuessScore(timeLeft: number, drawTime: number): number {
  const safeDrawTime = drawTime > 0 ? drawTime : 80;
  return Math.max(100, Math.floor((timeLeft / safeDrawTime) * 500));
}

/**
 * Normalize an answer for comparison:
 * - lowercase
 * - strips accents/diacritics for Latin and Greek (allowing accent-free guesses)
 * - normalizes Polish stroke-l (ł -> l), German eszett (ß -> ss), and Greek final sigma (ς -> σ)
 * - preserves letters and vowel marks across scripts (including Hindi Devanagari \p{M})
 * - removes spaces, punctuation and symbols
 */
export function normalizeAnswer(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\u0142/g, 'l')
    .replace(/\u0141/g, 'l')
    .replace(/ß/g, 'ss')
    .replace(/ς/g, 'σ')
    .replace(/[^\p{L}\p{M}\p{N}]/gu, '');
}

/**
 * Generates masked string for guessers according to game mode and revealed letters.
 */
export function getMaskedWord(word: string, revealedIndices: number[], gameMode: GameMode): string {
  if (gameMode === 'hidden') {
    return '';
  }

  const chars = Array.from(word);
  return chars
    .map((c, i) => {
      if (c === ' ' || c === '+') {
        return c;
      }
      if (revealedIndices.includes(i)) {
        return c.toUpperCase();
      }
      return '_';
    })
    .join('');
}

/**
 * Detect if a player's guess is only 1 letter away from the target word.
 */
export function isCloseGuess(guess: string, target: string): boolean {
  const normGuess = normalizeAnswer(guess);
  const normTarget = normalizeAnswer(target);
  if (!normGuess || !normTarget || normGuess === normTarget) return false;

  return (
    Math.abs(normGuess.length - normTarget.length) <= 1 &&
    (normGuess.includes(normTarget.slice(0, -1)) || normTarget.includes(normGuess))
  );
}
