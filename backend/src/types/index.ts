export interface AvatarConfig {
  style: 'bottts-neutral' | 'fun-emoji' | 'lorelei' | 'adventurer';
  seed: string;
  backgroundColor: string;
}

export interface Player {
  id: string;
  socketId: string;
  username: string;
  avatar: AvatarConfig;
  score: number;
  isHost: boolean;
  isReady: boolean;
  isDrawing: boolean;
  hasGuessed: boolean;
  joinedAt: number;
  isDisconnected?: boolean;
  disconnectTimeout?: NodeJS.Timeout;
}

export type GameMode = 'normal' | 'hidden' | 'combination';
export type WordCountOption = 1 | 2 | 3 | 4 | 5;
export type HintsOption = 0 | 1 | 2 | 3 | 4 | 5;

export interface RoomSettings {
  rounds: number;
  drawTime: number;
  maxPlayers: number;
  language: string;
  customWords: string[];
  onlyCustomWords: boolean;
  gameMode: GameMode;
  wordCount: WordCountOption;
  hints: HintsOption;
}

export interface NormalizedPoint {
  x: number; // 0.0 to 1.0
  y: number; // 0.0 to 1.0
}

export interface DrawingStroke {
  color: string;
  size: number;
  tool: 'brush' | 'eraser' | 'fill';
  points: NormalizedPoint[];
}

export interface ChatMessage {
  id: string;
  senderId?: string;
  senderName: string;
  text: string;
  type: 'chat' | 'correct' | 'close' | 'system';
  timestamp: number;
}

export type RoomStatus = 'lobby' | 'choosing' | 'drawing' | 'round_end' | 'game_end';

export interface Room {
  id: string;
  settings: RoomSettings;
  status: RoomStatus;
  players: Map<string, Player>;
  currentRound: number;
  totalRounds: number;
  currentDrawerId: string | null;
  drawerOrder: string[];
  drawerIndex: number;
  currentWord: string;
  wordChoices: string[];
  revealedIndices: number[];
  timeLeft: number;
  strokes: DrawingStroke[];
  timerInterval?: NodeJS.Timeout;
}
