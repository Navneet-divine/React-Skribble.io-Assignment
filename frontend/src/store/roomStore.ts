import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { type RoomSettings, type RoomInfo, type LobbyPlayer } from '../types/room';
import { type AvatarConfig, AVATAR_PALETTES } from '../types/game';

interface RoomState {
  currentRoom: RoomInfo | null;
  isHost: boolean;
  players: LobbyPlayer[];
  createRoom: (settings: RoomSettings, hostPlayer?: { username: string; avatar: AvatarConfig }) => RoomInfo;
  joinRoom: (roomId: string, player: { username: string; avatar: AvatarConfig }, isHost?: boolean) => void;
  kickPlayer: (playerId: string) => void;
  addMockTeammate: () => void;
  leaveRoom: () => void;
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

const MOCK_TEAMMATES = [
  { name: 'Sarah (Design)', seed: 'Sarah', style: 'lorelei' as const },
  { name: 'David (Eng)', seed: 'David', style: 'bottts-neutral' as const },
  { name: 'Emma (Product)', seed: 'Emma', style: 'adventurer' as const },
  { name: 'Leo (QA)', seed: 'Leo', style: 'fun-emoji' as const },
  { name: 'Maya (Marketing)', seed: 'Maya', style: 'lorelei' as const },
  { name: 'Marcus (DevOps)', seed: 'Marcus', style: 'bottts-neutral' as const },
];

export const useRoomStore = create<RoomState>()(
  persist(
    (set, get) => ({
      currentRoom: null,
      isHost: false,
      players: [],

  createRoom: (settings: RoomSettings, hostPlayer) => {
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

    const initialPlayers: LobbyPlayer[] = hostPlayer
      ? [
          {
            id: `player-${Date.now()}`,
            username: hostPlayer.username || 'Host',
            avatar: hostPlayer.avatar,
            isHost: true,
            isReady: true,
            joinedAt: Date.now(),
          },
        ]
      : [];

    set({
      currentRoom: newRoom,
      isHost: true,
      players: initialPlayers,
    });

    return newRoom;
  },

  joinRoom: (roomId: string, player, isHost = false) => {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const inviteLink = `${baseUrl}/?room=${roomId}`;

    // Default settings if joining without host settings
    const current = get().currentRoom;
    const roomInfo: RoomInfo = current || {
      id: roomId,
      inviteLink,
      isHost,
      settings: {
        rounds: 3,
        drawTime: 80,
        maxPlayers: 8,
        language: 'us',
        customWords: [],
        onlyCustomWords: false,
      },
      createdAt: Date.now(),
    };

    const newPlayer: LobbyPlayer = {
      id: `player-${Date.now()}`,
      username: player.username,
      avatar: player.avatar,
      isHost,
      isReady: true,
      joinedAt: Date.now(),
    };

    set((state) => ({
      currentRoom: roomInfo,
      isHost,
      players: state.players.some((p) => p.username === player.username)
        ? state.players
        : [...state.players, newPlayer],
    }));
  },

  kickPlayer: (playerId: string) => {
    if (!get().isHost) return;
    set((state) => ({
      players: state.players.filter((p) => p.id !== playerId),
    }));
  },

  addMockTeammate: () => {
    const { players, currentRoom } = get();
    if (!currentRoom) return;
    if (players.length >= currentRoom.settings.maxPlayers) {
      alert(`Room capacity reached (${currentRoom.settings.maxPlayers} players maximum)`);
      return;
    }

    const availableMocks = MOCK_TEAMMATES.filter(
      (m) => !players.some((p) => p.username === m.name)
    );
    const mock = availableMocks[0] || {
      name: `Colleague #${players.length + 1}`,
      seed: `Player${Date.now()}`,
      style: 'bottts-neutral' as const,
    };

    const randomColor = AVATAR_PALETTES[Math.floor(Math.random() * AVATAR_PALETTES.length)];

    const mockPlayer: LobbyPlayer = {
      id: `mock-${Date.now()}-${Math.random()}`,
      username: mock.name,
      avatar: {
        style: mock.style,
        seed: mock.seed,
        backgroundColor: randomColor,
      },
      isHost: false,
      isReady: true,
      joinedAt: Date.now(),
    };

    set({
      players: [...players, mockPlayer],
    });
  },

  leaveRoom: () => {
    set({
      currentRoom: null,
      isHost: false,
      players: [],
    });
  },
}),
{
  name: 'doodlesync-room-storage',
}
));
