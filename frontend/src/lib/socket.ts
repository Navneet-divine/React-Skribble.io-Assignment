import { io, Socket } from 'socket.io-client';
import { type DrawingStroke, type AvatarConfig } from '../types/game';
import { type RoomSettings } from '../types/room';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';

// Singleton socket connection
export const socket: Socket = io(BACKEND_URL, {
  autoConnect: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
});

// Helper to ensure connection is open
export function ensureSocketConnected(): Promise<Socket> {
  return new Promise((resolve) => {
    if (socket.connected) {
      resolve(socket);
      return;
    }

    socket.connect();
    socket.once('connect', () => {
      resolve(socket);
    });
  });
}

// Socket API wrappers
export async function createMultiplayerRoom(
  settings: RoomSettings,
  player: { id?: string; username: string; avatar: AvatarConfig }
): Promise<{ success: boolean; roomId?: string; room?: any; error?: string }> {
  await ensureSocketConnected();

  return new Promise((resolve) => {
    socket.emit(
      'room:create',
      { settings, player },
      (response: { success: boolean; roomId?: string; room?: any; error?: string }) => {
        resolve(response);
      }
    );
  });
}

export async function joinMultiplayerRoom(
  roomId: string,
  player: { id?: string; username: string; avatar: AvatarConfig }
): Promise<{ success: boolean; room?: any; player?: any; error?: string }> {
  await ensureSocketConnected();

  return new Promise((resolve) => {
    socket.emit(
      'room:join',
      { roomId, player },
      (response: { success: boolean; room?: any; player?: any; error?: string }) => {
        resolve(response);
      }
    );
  });
}

export function startMultiplayerGame() {
  if (socket.connected) {
    socket.emit('game:start');
  }
}

export function selectWordOnServer(word: string) {
  if (socket.connected) {
    socket.emit('word:select', { word });
  }
}

export function emitDrawingStroke(stroke: DrawingStroke) {
  if (socket.connected) {
    socket.emit('draw:stroke', stroke);
  }
}

export function emitDrawingUndo() {
  if (socket.connected) {
    socket.emit('draw:undo');
  }
}

export function emitDrawingClear() {
  if (socket.connected) {
    socket.emit('draw:clear');
  }
}

export function emitChatMessage(text: string) {
  if (socket.connected) {
    socket.emit('chat:message', { text });
  }
}

export function leaveMultiplayerRoom() {
  if (socket.connected) {
    socket.emit('room:leave');
  }
}

export function returnToLobby() {
  if (socket.connected) {
    socket.emit('game:return_to_lobby');
  }
}


