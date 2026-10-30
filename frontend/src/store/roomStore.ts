import { create } from 'zustand';
import { type RoomSettings, type RoomInfo } from '../types/room';

interface RoomState {
  currentRoom: RoomInfo | null;
  isHost: boolean;
  createRoom: (settings: RoomSettings) => RoomInfo;
  resetRoom: () => void;
}

// Generate friendly 4-character room ID (e.g., "DOODLE-7K9A")
function generateRoomCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Exclude 0, 1, I, O to prevent confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `DOODLE-${code}`;
}

export const useRoomStore = create<RoomState>((set) => ({
  currentRoom: null,
  isHost: false,

  createRoom: (settings: RoomSettings) => {
    const roomId = generateRoomCode();
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteLink = `${baseUrl}/?room=${roomId}`;

    const newRoom: RoomInfo = {
      id: roomId,
      inviteLink,
      isHost: true,
      settings,
      createdAt: Date.now(),
    };

    set({
      currentRoom: newRoom,
      isHost: true,
    });

    return newRoom;
  },

  resetRoom: () => {
    set({
      currentRoom: null,
      isHost: false,
    });
  },
}));
