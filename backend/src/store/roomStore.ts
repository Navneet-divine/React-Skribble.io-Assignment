import { type Room } from '../types/index.js';

// In-memory state storage for active rooms and socket connections
export const rooms = new Map<string, Room>();
export const socketToRoom = new Map<string, { roomId: string; playerId: string }>();
