import { type Room } from '../types/index.js';

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
 */
export function serializeRoom(room: Room) {
  return {
    id: room.id,
    settings: room.settings,
    status: room.status,
    players: Array.from(room.players.values()),
    currentRound: room.currentRound,
    totalRounds: room.totalRounds,
    currentDrawerId: room.currentDrawerId,
    currentWord: room.currentWord,
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
 * Detect if a player's guess is only 1 letter away from the target word.
 */
export function isCloseGuess(guess: string, target: string): boolean {
  const normGuess = guess.trim().toLowerCase();
  const normTarget = target.trim().toLowerCase();
  if (!normGuess || !normTarget || normGuess === normTarget) return false;

  return (
    Math.abs(normGuess.length - normTarget.length) <= 1 &&
    (normGuess.includes(normTarget.slice(0, -1)) || normTarget.includes(normGuess))
  );
}
