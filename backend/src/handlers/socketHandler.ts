import { Server, Socket } from 'socket.io';
import { rooms, socketToRoom } from '../store/roomStore.js';
import {
  type Player,
  type RoomSettings,
  type Room,
  type DrawingStroke,
} from '../types/index.js';
import {
  generateRoomCode,
  generateMeaningfulUsername,
  serializeRoom,
  calculateGuessScore,
  isCloseGuess,
} from '../utils/roomUtils.js';
import {
  startNextTurn,
  beginDrawingTurn,
  endTurn,
} from '../utils/gameManager.js';

export function registerSocketHandlers(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`⚡ Client connected: ${socket.id}`);

    // 1. Room Creation
    socket.on('room:create', ({ settings, player }: { settings: RoomSettings; player: Partial<Player> }, callback) => {
      const roomId = generateRoomCode();

      const hostPlayer: Player = {
        id: player.id || `p-${Date.now()}`,
        socketId: socket.id,
        username: player.username?.trim() || generateMeaningfulUsername(),
        avatar: player.avatar || {
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

      const newRoom: Room = {
        id: roomId,
        settings: {
          rounds: settings?.rounds || 3,
          drawTime: settings?.drawTime || 80,
          maxPlayers: settings?.maxPlayers || 8,
          language: settings?.language || 'us',
          customWords: settings?.customWords || [],
          onlyCustomWords: settings?.onlyCustomWords || false,
        },
        status: 'lobby',
        players: new Map([[hostPlayer.id, hostPlayer]]),
        currentRound: 1,
        totalRounds: settings?.rounds || 3,
        currentDrawerId: null,
        drawerOrder: [hostPlayer.id],
        drawerIndex: 0,
        currentWord: '',
        wordChoices: [],
        revealedIndices: [],
        timeLeft: settings?.drawTime || 80,
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

    // 2. Room Joining
    socket.on('room:join', ({ roomId, player }: { roomId: string; player: Partial<Player> }, callback) => {
      const normalizedRoomId = roomId.trim().toUpperCase();
      const room = rooms.get(normalizedRoomId);

      if (!room) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room does not exist or has closed.' });
        }
        return;
      }

      if (room.players.size >= room.settings.maxPlayers) {
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Room has reached maximum capacity.' });
        }
        return;
      }

      const playerId = player.id || `p-${Date.now()}`;
      const newPlayer: Player = {
        id: playerId,
        socketId: socket.id,
        username: player.username?.trim() || generateMeaningfulUsername(),
        avatar: player.avatar || {
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

      beginDrawingTurn(io, room.id, word);
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
      });

      io.to(room.id).emit('room:data', serializeRoom(room));
    });

    // 5. Drawing Stroke Event
    socket.on('draw:stroke', (stroke: DrawingStroke) => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.status !== 'drawing') return;

      if (room.currentDrawerId !== mapping.playerId) return;

      room.strokes.push(stroke);
      socket.to(mapping.roomId).emit('draw:stroke', stroke);
    });

    // 6. Undo Stroke
    socket.on('draw:undo', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.currentDrawerId !== mapping.playerId) return;

      room.strokes.pop();
      io.to(mapping.roomId).emit('draw:undo');
    });

    // 7. Clear Canvas
    socket.on('draw:clear', () => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room || room.currentDrawerId !== mapping.playerId) return;

      room.strokes = [];
      io.to(mapping.roomId).emit('draw:clear');
    });

    // 8. Chat & Guess Handling
    socket.on('chat:message', ({ text }: { text: string }) => {
      const mapping = socketToRoom.get(socket.id);
      if (!mapping) return;

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const sender = room.players.get(mapping.playerId);
      if (!sender) return;

      const trimmed = text.trim();
      if (!trimmed) return;

      const normalizedGuess = trimmed.toLowerCase();
      const normalizedTarget = room.currentWord.toLowerCase();

      // Prevent drawer from spoiling the secret word
      if (room.currentDrawerId === sender.id && normalizedTarget && normalizedGuess.includes(normalizedTarget)) {
        socket.emit('chat:warning', 'You are drawing! You cannot spoil the secret word.');
        return;
      }

      // Handle guess during active drawing
      if (room.status === 'drawing' && room.currentDrawerId !== sender.id && !sender.hasGuessed) {
        if (normalizedGuess === normalizedTarget) {
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
        if (isCloseGuess(normalizedGuess, normalizedTarget)) {
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

    // Helper: Handle player departure (via disconnect or explicit room:leave)
    const handlePlayerDeparture = (departingSocket: Socket) => {
      const mapping = socketToRoom.get(departingSocket.id);
      if (!mapping) return;

      socketToRoom.delete(departingSocket.id);
      departingSocket.leave(mapping.roomId);

      const room = rooms.get(mapping.roomId);
      if (!room) return;

      const player = room.players.get(mapping.playerId);
      const isHostLeaving = Boolean(player?.isHost);
      const departingName = player?.username || 'A player';

      room.players.delete(mapping.playerId);
      room.drawerOrder = room.drawerOrder.filter((id) => id !== mapping.playerId);

      console.log(`🚪 Player ${departingName} (${mapping.playerId}) left room ${room.id}`);

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
        if (room.currentDrawerId === mapping.playerId && room.status === 'drawing') {
          endTurn(io, room.id, `${departingName} (drawer) disconnected.`);
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

    // 9. Leave Room Event
    socket.on('room:leave', () => {
      handlePlayerDeparture(socket);
    });

    // 10. Disconnection & Cleanup
    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      handlePlayerDeparture(socket);
    });
  });
}
