import { type AvatarConfig } from './game';

export interface RoomSettings {
  rounds: number;           // Number of rounds (2 to 10, default: 3)
  drawTime: number;         // Turn duration in seconds (30s to 120s, default: 80s)
  maxPlayers: number;       // Maximum allowed players (2 to 16, default: 8)
  language: string;         // Word dictionary country code (e.g., 'us', 'gb', 'de')
  customWords: string[];    // Custom words input by host
  onlyCustomWords: boolean; // Whether to exclusively use custom words
}

export interface LobbyPlayer {
  id: string;
  username: string;
  avatar: AvatarConfig;
  isHost: boolean;
  isReady: boolean;
  joinedAt: number;
}

export interface RoomInfo {
  id: string;               // Unique room code e.g. "DOODLE-7K9A"
  inviteLink: string;       // Full shareable URL
  isHost: boolean;          // Whether the local player is host
  settings: RoomSettings;
  createdAt: number;
}

export const ROUND_OPTIONS = [2, 3, 4, 5, 6, 8, 10];

export const DRAW_TIME_OPTIONS = [
  { value: 30, label: '30s' },
  { value: 45, label: '45s' },
  { value: 60, label: '60s' },
  { value: 75, label: '75s' },
  { value: 80, label: '80s (Default)' },
  { value: 90, label: '90s' },
  { value: 100, label: '100s' },
  { value: 120, label: '120s' },
];

export const MAX_PLAYERS_OPTIONS = [4, 6, 8, 10, 12, 16];
