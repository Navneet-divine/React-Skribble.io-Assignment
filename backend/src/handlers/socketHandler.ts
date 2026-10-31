import { Server, Socket } from 'socket.io';
import { rooms, socketToRoom } from '../store/roomStore.js';
import {
  type Player,
  type RoomSettings,
  type Room,
  type DrawingStroke,
  type GameMode,
  type WordCountOption,
  type HintsOption,
} from '../types/index.js';
import {
  generateRoomCode,
  generateMeaningfulUsername,
  serializeRoom,
  calculateGuessScore,
  isCloseGuess,
  normalizeAnswer,
  getMaskedWord,
} from '../utils/roomUtils.js';
import {
  startNextTurn,
  beginDrawingTurn,
  endTurn,
} from '../utils/gameManager.js';

/**
 * Sanitizes, validates, and deduplicates custom words:
 * - Max 100 unique words
 * - 1-32 chars per entry (allows internal spaces and multilingual UTF-8 characters)
 * - Max 20,000 characters input
 * - Delimited by commas and newlines
 * - Case-insensitive deduplication
 */
export function sanitizeAndDeduplicateCustomWords(rawInput: any): string[] {
  let list: string[] = [];
  if (Array.isArray(rawInput)) {
    list = rawInput.map((item) => String(item));
  } else if (typeof rawInput === 'string') {
    list = rawInput.slice(0, 20000).split(/[\n,\r]+/);
  } else {
    return [];
  }

  const seen = new Set<string>();
  const unique: string[] = [];

  for (const raw of list) {
    const trimmed = String(raw).trim().replace(/\s+/g, ' ');
    if (trimmed.length >= 1 && trimmed.length <= 32) {
      const lower = trimmed.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        unique.push(trimmed);
        if (unique.length >= 100) break; // Maximum 100 custom words product limit
      }
    }
  }

  return unique;
}

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // 1. Room Creation
    socket.on('room:create', ({ settings, player }: { settings: RoomSettings; player?: Partial<Player> }, callback) => {
      const roomId = generateRoomCode();
      const playerData = player || {};

      const hostPlayer: Player = {
        id: playerData.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        socketId: socket.id,
        username: playerData.username?.trim() || generateMeaningfulUsername(),
        avatar: playerData.avatar || {
          style: 'bottts-neutral',
          seed: 'Host',
          backgroundColor: 'b6e3f4',
        },
        score: 0,
        isHost: true,
        isReady: true,
        isDrawing: false,
        hasGuessed: false,
        joinedAt: Date.now(),
      };

      const roundsCount = Math.min(10, Math.max(2, Number(settings?.rounds) || 3));
      const drawTimeSec = Math.min(240, Math.max(15, Number(settings?.drawTime) || 80));
      const validGameModes: GameMode[] = ['normal', 'hidden', 'combination'];
      const gameMode: GameMode = validGameModes.includes(settings?.gameMode) ? settings.gameMode : 'normal';
      const wordCount: WordCountOption = Math.min(5, Math.max(1, Number(settings?.wordCount) || 3)) as WordCountOption;
      const hints: HintsOption = Math.min(
        5,
        Math.max(0, settings?.hints !== undefined ? Number(settings.hints) : 2)
      ) as HintsOption;

      const newRoom: Room = {
        id: roomId,
        settings: {
          rounds: roundsCount,
          drawTime: drawTimeSec,
          maxPlayers: Math.min(20, Math.max(2, Number(settings?.maxPlayers) || 8)),
          language: settings?.language || 'en',
          customWords: sanitizeAndDeduplicateCustomWords(settings?.customWords),
          onlyCustomWords: settings?.onlyCustomWords || false,
          gameMode,
          wordCount,
          hints,
        },
        status: 'lobby',
        players: new Map([[hostPlayer.id, hostPlayer]]),
        currentRound: 1,
        totalRounds: roundsCount,
        currentDrawerId: null,
        drawerOrder: [hostPlayer.id],
        drawerIndex: 0,
        currentWord: '',
        wordChoices: [],
        revealedIndices: [],
        timeLeft: drawTimeSec,
        strokes: [],
      };

      rooms.set(roomId, newRoom);
      socketToRoom.set(socket.id, { roomId, playerId: hostPlayer.id });
      socket.join(roomId);

      console.log(`🏠 Room created: ${roomId} by ${hostPlayer.username}`);

      if (typeof callback === 'function') {
        callback({ success: true, roomId, room: serializeRoom(newRoom), player: hostPlayer });
      }

      socket.emit('room:data', serializeRoom(newRoom));
    });

    // 1.1 Room Settings Update (Host authority while in lobby)
    socket.on(
      'room:settings:update',
      (
        { roomId, settings }: { roomId: string; settings: Partial<RoomSettings> },
        callback
      ) => {
        const normalizedRoomId = roomId?.trim().toUpperCase();
        const room = rooms.get(normalizedRoomId);

        if (!room) {
          if (typeof callback === 'function') callback({ success: false, error: 'Room does not exist' });
          return;
        }

        if (room.status !== 'lobby') {
          if (typeof callback === 'function') callback({ success: false, error: 'Settings can only be changed in the lobby' });
          return;
        }

        const session = socketToRoom.get(socket.id);
        const player = session ? room.players.get(session.playerId) : null;
        if (!player || !player.isHost) {
          if (typeof callback === 'function') callback({ success: false, error: 'Only the host can modify room settings' });
          return;
        }

        if (settings.language !== undefined) {
          room.settings.language = String(settings.language).trim();
        }
        if (settings.customWords !== undefined) {
          room.settings.customWords = sanitizeAndDeduplicateCustomWords(settings.customWords);
        }
        if (settings.onlyCustomWords !== undefined) {
          room.settings.onlyCustomWords = Boolean(settings.onlyCustomWords);
        }
        if (settings.gameMode !== undefined && ['normal', 'hidden', 'combination'].includes(settings.gameMode)) {
          room.settings.gameMode = settings.gameMode;
        }
        if (settings.wordCount !== undefined) {
          room.settings.wordCount = Math.min(5, Math.max(1, Number(settings.wordCount) || 3)) as WordCountOption;
        }
        if (settings.hints !== undefined) {
          room.settings.hints = Math.min(5, Math.max(0, Number(settings.hints) || 2)) as HintsOption;
        }
        if (settings.rounds !== undefined) {
          const r = Math.min(10, Math.max(2, Number(settings.rounds) || 3));
          room.settings.rounds = r;
          room.totalRounds = r;
        }
        if (settings.drawTime !== undefined) {
          const dt = Math.min(240, Math.max(15, Number(settings.drawTime) || 80));
          room.settings.drawTime = dt;
          room.timeLeft = dt;
        }
        if (settings.maxPlayers !== undefined) {
          room.settings.maxPlayers = Math.min(20, Math.max(2, Number(settings.maxPlayers) || 8));
        }

        io.to(normalizedRoomId).emit('room:data', serializeRoom(room));

        if (typeof callback === 'function') {
          callback({ success: true, room: serializeRoom(room) });
        }
      }
    );

    // 2. Room Joining & Reconnection
    socket.on('room:join', ({ roomId, player }: { roomId: string; player: Partial<Player> }, callback) => {
      const normalizedRoomId = roomId.trim().toUpperCase();
      const room = rooms.get(normalizedRoomId);

      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room does not exist or has closed.' });
        }
        return;
      }

      // Check for reconnection of an existing player (by ID or matching username)
      let existingPlayer: Player | undefined;
      if (player?.id && room.players.has(player.id)) {
        existingPlayer = room.players.get(player.id);
      } else if (player?.username) {
        const targetUsername = player.username.trim().toLowerCase();
        existingPlayer = Array.from(room.players.values()).find(
          (p) =>
            p.username.trim().toLowerCase() === targetUsername &&
            (p.isDisconnected || p.socketId !== socket.id)
        );
      }

      if (existingPlayer) {
        // Player reconnected within grace period!
        if (existingPlayer.disconnectTimeout) {
          clearTimeout(existingPlayer.disconnectTimeout);
          existingPlayer.disconnectTimeout = undefined;
        }

        // Clean up old socket mapping
        socketToRoom.delete(existingPlayer.socketId);

        // Update with active socket ID and restore online status
        existingPlayer.socketId = socket.id;
        existingPlayer.isDisconnected = false;
        if (player?.avatar) existingPlayer.avatar = player.avatar;

        socketToRoom.set(socket.id, { roomId: normalizedRoomId, playerId: existingPlayer.id });
        socket.join(normalizedRoomId);

        console.log(`🟢 Player ${existingPlayer.username} (${existingPlayer.id}) RECONNECTED to room ${normalizedRoomId}`);

        if (typeof callback === 'function') {
          callback({ success: true, room: serializeRoom(room), player: existingPlayer, isReconnect: true });
        }

        // Deliver full room state directly to reconnected client and broadcast to others
        socket.emit('room:data', serializeRoom(room));
        io.to(normalizedRoomId).emit('room:data', serializeRoom(room));
        io.to(normalizedRoomId).emit('chat:message', {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: `🟢 ${existingPlayer.username} reconnected!`,
          type: 'system',
          timestamp: Date.now(),
        });

        // Synchronize canvas history
        if (room.strokes.length > 0) {
          socket.emit('draw:history', { strokes: room.strokes });
        }

        // Synchronize real-time clock immediately to match server
        socket.emit('timer:tick', { timeLeft: room.timeLeft, phase: room.status });

        // Deliver role-appropriate word information based on current room phase
        if (room.status === 'drawing') {
          if (existingPlayer.id === room.currentDrawerId) {
            socket.emit('word:secret', { word: room.currentWord });
          } else {
            const isHidden = room.settings.gameMode === 'hidden';
            socket.emit('word:hint', {
              length: isHidden ? 0 : room.currentWord.length,
              maskedWord: getMaskedWord(room.currentWord, room.revealedIndices, room.settings.gameMode),
              revealedIndices: room.revealedIndices,
              hidden: isHidden,
              gameMode: room.settings.gameMode,
            });
          }
        } else if (room.status === 'choosing') {
          if (existingPlayer.id === room.currentDrawerId && room.wordChoices.length > 0) {
            socket.emit('word:choices', { choices: room.wordChoices, duration: room.timeLeft });
          }
        }

        return;
      }

      if (room.players.size >= room.settings.maxPlayers) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room has reached maximum capacity.' });
        }
        return;
      }

      const playerId = player?.id || `p-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      const newPlayer: Player = {
        id: playerId,
        socketId: socket.id,
        username: player?.username?.trim() || generateMeaningfulUsername(),
        avatar: player?.avatar || {
          style: 'bottts-neutral',
          seed: `seed-${Date.now()}`,
          backgroundColor: 'ffd5dc',
        },
        score: 0,
        isHost: false,
        isReady: true,
        isDrawing: false,
        hasGuessed: false,
        joinedAt: Date.now(),
      };

      room.players.set(newPlayer.id, newPlayer);
      if (!room.drawerOrder.includes(newPlayer.id)) {
        room.drawerOrder.push(newPlayer.id);
      }

      socketToRoom.set(socket.id, { roomId: normalizedRoomId, playerId: newPlayer.id });
      socket.join(normalizedRoomId);

      console.log(`👋 Player ${newPlayer.username} joined room ${normalizedRoomId}`);

      if (typeof callback === 'function') {
        callback({ success: true, room: serializeRoom(room), player: newPlayer });
      }

      // Broadcast updated room state and announce player
      io.to(normalizedRoomId).emit('room:data', serializeRoom(room));
      io.to(normalizedRoomId).emit('chat:message', {
        id: `sys-${Date.now()}`,
        senderName: 'System',
        text: `👋 ${newPlayer.username} joined the room!`,
        type: 'system',
        timestamp: Date.now(),
      });

      // Synchronize canvas history for late joiners
      if (room.strokes.length > 0) {
        socket.emit('draw:history', { strokes: room.strokes });
      }

      // If joining mid-game during drawing phase, deliver role-appropriate word information
      if (room.status === 'drawing') {
        if (newPlayer.id === room.currentDrawerId) {
          socket.emit('word:secret', { word: room.currentWord });
        } else {
          const isHidden = room.settings.gameMode === 'hidden';
          socket.emit('word:hint', {
            length: isHidden ? 0 : room.currentWord.length,
            maskedWord: getMaskedWord(room.currentWord, room.revealedIndices, room.settings.gameMode),
            revealedIndices: room.revealedIndices,
            hidden: isHidden,
            gameMode: room.settings.gameMode,
          });
        }
      }
    });

    // 3. Start Game (Host only)
    socket.on('game:start', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const caller = room.players.get(mapping.playerId);
      if (!caller?.isHost) return;

      // Minimum 2 players required (at least 1 drawer and 1 guesser)
      if (room.players.size < 2) {
        socket.emit('chat:message', {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: '⚠️ At least 2 players are required to start the game! Share your invite link with a teammate.',
          type: 'system',
          timestamp: Date.now(),
        });
        socket.emit('game:error', { message: 'At least 2 players are required to start the game.' });
        return;
      }

      console.log(`🚀 Host started game in room: ${room.id} with ${room.players.size} players`);

      room.drawerOrder = Array.from(room.players.keys()).sort(() => 0.5 - Math.random());
      room.drawerIndex = 0;
      room.currentRound = 1;
      room.players.forEach((p) => {
        p.score = 0;
        p.hasGuessed = false;
        p.isDrawing = false;
      });

      startNextTurn(io, room.id);
    });

    // 4. Request Word Choices (when drawer mounts GameScreen or reconnects)
    socket.on('game:request_choices', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.status !== 'choosing') return;

      if (room.currentDrawerId === mapping.playerId && room.wordChoices.length > 0) {
        socket.emit('word:choices', {
          choices: room.wordChoices,
          duration: room.timeLeft || 15,
        });
      }
    });

    // 5. Word Selected by Drawer
    socket.on('word:select', ({ word }: { word: string }) => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.status !== 'choosing') return;

      if (room.currentDrawerId !== mapping.playerId) return;

      // Validate that the chosen word is one of the offered choices (never trust client)
      const inputWord = word?.trim().toUpperCase();
      const authorizedWord =
        room.wordChoices.find((w) => w.toUpperCase() === inputWord) ||
        room.wordChoices[0] ||
        'APPLE';

      beginDrawingTurn(io, room.id, authorizedWord);
    });

    // 6. Return to Lobby early from Game Over screen
    socket.on('game:return_to_lobby', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;
      const room = rooms.get(mapping.roomId);
      if (!room || room.status !== 'game_end') return;

      room.status = 'lobby';
      room.currentRound = 1;
      room.timeLeft = 0;
      room.currentWord = '';
      room.wordChoices = [];
      room.revealedIndices = [];
      room.strokes = [];
      room.currentDrawerId = null;
      room.drawerIndex = 0;
      room.players.forEach((p) => {
        p.isDrawing = false;
        p.hasGuessed = false;
        p.score = 0;
      });

      io.to(room.id).emit('room:data', serializeRoom(room));
    });

    // 7. Drawing Stroke Event
    socket.on('draw:stroke', (stroke: DrawingStroke) => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.status !== 'drawing') return;

      if (room.currentDrawerId !== mapping.playerId) return;

      room.strokes.push(stroke);
      socket.to(mapping.roomId).emit('draw:stroke', stroke);
    });

    // 8. Undo Stroke
    socket.on('draw:undo', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.currentDrawerId !== mapping.playerId) return;

      room.strokes.pop();
      io.to(mapping.roomId).emit('draw:undo');
    });

    // 9. Clear Canvas
    socket.on('draw:clear', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.currentDrawerId !== mapping.playerId) return;

      room.strokes = [];
      io.to(mapping.roomId).emit('draw:clear');
    });

    // 10. Chat & Guess Handling
    socket.on('chat:message', ({ text }: { text: string }) => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const sender = room.players.get(mapping.playerId);
      if (!sender) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      const normGuess = normalizeAnswer(trimmed);
      const normTarget = normalizeAnswer(room.currentWord);

      // Prevent drawer from spoiling the secret word/phrase
      if (room.currentDrawerId === sender.id && normTarget) {
        const targetWords = room.currentWord
          .toLowerCase()
          .split(/[^\p{L}\p{M}\p{N}]+/u)
          .filter((w) => w.length >= 3);

        const isSpoiler =
          (normGuess.length >= 3 && normTarget.includes(normGuess)) ||
          targetWords.some((w) => trimmed.toLowerCase().includes(w));

        if (isSpoiler) {
          socket.emit('chat:warning', 'You are drawing! You cannot spoil the secret word.');
          return;
        }
      }

      // Handle guess during active drawing
      if (room.status === 'drawing' && room.currentDrawerId !== sender.id && !sender.hasGuessed) {
        if (normGuess === normTarget) {
          sender.hasGuessed = true;
          const pointsEarned = calculateGuessScore(room.timeLeft, room.settings.drawTime);
          sender.score += pointsEarned;

          // Bonus for drawer
          const drawer = room.currentDrawerId ? room.players.get(room.currentDrawerId) : null;
          if (drawer) {
            drawer.score += 50;
          }

          io.to(room.id).emit('chat:message', {
            id: `correct-${Date.now()}`,
            senderName: sender.username,
            text: `guessed the word! (+${pointsEarned} pts)`,
            type: 'correct',
            timestamp: Date.now(),
          });

          io.to(room.id).emit('room:data', serializeRoom(room));

          // Check if all guessers succeeded
          const activeGuessers = Array.from(room.players.values()).filter((p) => !p.isDrawing);
          const allGuessed = activeGuessers.every((p) => p.hasGuessed);
          if (allGuessed && activeGuessers.length > 0) {
            endTurn(io, room.id, 'Everyone guessed the word!');
          }
          return;
        }

        // Close guess hint
        if (isCloseGuess(normGuess, normTarget)) {
          socket.emit('chat:message', {
            id: `close-${Date.now()}`,
            senderName: 'System',
            text: `🔥 "${trimmed}" is very close!`,
            type: 'close',
            timestamp: Date.now(),
          });
        }
      }

      // Standard chat broadcast
      io.to(room.id).emit('chat:message', {
        id: `chat-${Date.now()}-${Math.random()}`,
        senderId: sender.id,
        senderName: sender.username,
        text: trimmed,
        type: 'chat',
        timestamp: Date.now(),
      });
    });

    // Helper: Finalize permanent player departure (after grace period timeout or explicit leave)
    const finalizePlayerDeparture = (roomId: string, playerId: string) => {
      const room = rooms.get(roomId);
      if (!room) return;

      const player = room.players.get(playerId);
      if (!player) return;

      if (player.disconnectTimeout) {
        clearTimeout(player.disconnectTimeout);
        player.disconnectTimeout = undefined;
      }

      const isHostLeaving = Boolean(player.isHost);
      const departingName = player.username || 'A player';

      room.players.delete(playerId);
      room.drawerOrder = room.drawerOrder.filter((id) => id !== playerId);

      console.log(`🚪 Player ${departingName} (${playerId}) permanently departed room ${room.id}`);

      // 1. If room empty, clean up
      if (room.players.size === 0) {
        if (room.timerInterval) clearInterval(room.timerInterval);
        rooms.delete(room.id);
        console.log(`🧹 Room ${room.id} cleaned up (all players left)`);
        return;
      }

      // 2. Reassign host if host left - the user that came after host becomes host
      let newlyPromotedHost: Player | null = null;
      if (isHostLeaving && room.players.size > 0) {
        newlyPromotedHost = Array.from(room.players.values())[0];
        newlyPromotedHost.isHost = true;
        console.log(`👑 Reassigned host in ${room.id} to ${newlyPromotedHost.username}`);
        io.to(room.id).emit('chat:message', {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: `👑 ${newlyPromotedHost.username} is now the room host!`,
          type: 'system',
          timestamp: Date.now(),
        });
      }

      // 3. Handle Active Game vs Lobby
      if (room.status !== 'lobby') {
        // If only 1 player remains in the match, that player automatically WINS!
        if (room.players.size === 1) {
          if (room.timerInterval) {
            clearInterval(room.timerInterval);
            room.timerInterval = undefined;
          }

          const winner = Array.from(room.players.values())[0];

          // Reset room state back to lobby
          room.status = 'lobby';
          room.currentRound = 1;
          room.timeLeft = 0;
          room.currentWord = '';
          room.wordChoices = [];
          room.revealedIndices = [];
          room.strokes = [];
          room.currentDrawerId = null;
          room.drawerOrder = [winner.id];
          room.drawerIndex = 0;
          winner.isDrawing = false;
          winner.hasGuessed = false;
          winner.score = 0;

          const reason = isHostLeaving
            ? `The room host (${departingName}) left the game. You won the match and have been promoted to Room Host!`
            : `Your opponent (${departingName}) left the match. You won the game!`;

          // Notify winner and return them to the lobby
          io.to(room.id).emit('game:victory_default', {
            winnerId: winner.id,
            winnerName: winner.username,
            reason,
            isNewHost: isHostLeaving,
            roomId: room.id,
          });

          io.to(room.id).emit('room:data', serializeRoom(room));
          io.to(room.id).emit('chat:message', {
            id: `sys-${Date.now()}`,
            senderName: 'System',
            text: `🏆 ${winner.username} wins by default! (${reason})`,
            type: 'system',
            timestamp: Date.now(),
          });
          return;
        }

        // If 2 or more players still remain:
        if (room.currentDrawerId === playerId && room.status === 'drawing') {
          endTurn(io, room.id, `${departingName} (drawer) left the game.`);
        } else {
          io.to(room.id).emit('room:data', serializeRoom(room));
          io.to(room.id).emit('chat:message', {
            id: `sys-${Date.now()}`,
            senderName: 'System',
            text: `🚪 ${departingName} left the game.`,
            type: 'system',
            timestamp: Date.now(),
          });
        }
      } else {
        // In lobby:
        io.to(room.id).emit('room:data', serializeRoom(room));
        io.to(room.id).emit('chat:message', {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: `🚪 ${departingName} left the lobby.`,
          type: 'system',
          timestamp: Date.now(),
        });
      }
    };

    // 9. Leave Room Event (Deliberate departure by clicking Leave Room / Leave Game)
    socket.on('room:leave', () => {
      const mapping = socketToRoom.get(socket.id);
      if (mapping) {
        socketToRoom.delete(socket.id);
        socket.leave(mapping.roomId);
        finalizePlayerDeparture(mapping.roomId, mapping.playerId);
      }
    });

    // 10. Disconnection & Cleanup (Page Refresh / Temporary network drop)
    // Server timer continues ticking uninterrupted! Player has a 20s grace period to reconnect.
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      socketToRoom.delete(socket.id);
      socket.leave(mapping.roomId);

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const player = room.players.get(mapping.playerId);
      if (!player) return;

      // Mark player as temporarily disconnected
      player.isDisconnected = true;

      // Grace period: 20 seconds during live game, 10 seconds in lobby
      const GRACE_PERIOD_MS = room.status !== 'lobby' ? 20000 : 10000;

      // Broadcast room data so other players can see the temporary disconnected status
      io.to(room.id).emit('room:data', serializeRoom(room));
      io.to(room.id).emit('chat:message', {
        id: `sys-${Date.now()}`,
        senderName: 'System',
        text: `⚡ ${player.username} connection lost. Reconnecting... (Game timer continuing)`,
        type: 'system',
        timestamp: Date.now(),
      });

      player.disconnectTimeout = setTimeout(() => {
        const r = rooms.get(mapping.roomId);
        const p = r?.players.get(mapping.playerId);
        if (p && p.isDisconnected) {
          console.log(`⏱️ Reconnect grace period expired for ${p.username} (${p.id})`);
          finalizePlayerDeparture(mapping.roomId, mapping.playerId);
        }
      }, GRACE_PERIOD_MS);
    });
  });
}
