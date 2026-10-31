export interface AvatarConfig {
  style: 'bottts-neutral' | 'fun-emoji' | 'lorelei' | 'adventurer';
  seed: string;
  backgroundColor: string;
}

export const AVATAR_PALETTES = [
  'b6e3f4',
  'c0aede',
  'd1d4f9',
  'ffd5dc',
  'ffdfbf',
  'fed7aa',
  'a7f3d0',
  'fbcfe8',
];

export type DrawingTool = 'brush' | 'eraser' | 'fill';

export type StrokeSize = 4 | 8 | 14 | 24;

export const PALETTE_COLORS: string[] = [
  '#000000', // Black
  '#4b5563', // Slate gray
  '#ffffff', // White
  '#92400e', // Brown
  '#ef4444', // Red
  '#f97316', // Orange
  '#eab308', // Yellow
  '#84cc16', // Lime
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#3b82f6', // Blue
  '#6366f1', // Indigo
  '#8b5cf6', // Violet
  '#d946ef', // Fuchsia
  '#ec4899', // Pink
  '#f43f5e', // Rose
];

export const STROKE_SIZES: { size: StrokeSize; label: string; previewPx: number }[] = [
  { size: 4, label: 'Fine', previewPx: 6 },
  { size: 8, label: 'Medium', previewPx: 10 },
  { size: 14, label: 'Thick', previewPx: 14 },
  { size: 24, label: 'Jumbo', previewPx: 18 },
];

export interface NormalizedPoint {
  x: number; // 0 to 1
  y: number; // 0 to 1
}

export interface DrawingStroke {
  color: string;
  size: number;
  tool: DrawingTool;
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

export interface GamePlayer {
  id: string;
  username: string;
  avatar: AvatarConfig;
  score: number;
  hasGuessed: boolean;
  isDrawing: boolean;
  isHost?: boolean;
}

export interface WordChoice {
  word: string;
  difficulty: 'easy' | 'medium' | 'hard';
  category?: string;
}
