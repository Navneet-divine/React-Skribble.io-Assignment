import { Server } from 'socket.io';
import { rooms, socketToRoom } from '../store/roomStore.js';
import { serializeRoom } from './roomUtils.js';
import { getThreeWordChoices } from '../constants/words.js';

/**
 * Transition the room to the next drawer's turn or end game if all rounds complete.
 */
export function startNextTurn(io: Server, roomId: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  // Clear existing timer if running
  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  // Check if round or entire game is complete
  if (room.drawerIndex >= room.drawerOrder.length) {
    // If the current round was the final round, game is complete!
    if (room.currentRound >= room.totalRounds) {
      room.status = 'game_end';
      room.currentRound = room.totalRounds; // CLAMP! Never allow currentRound > totalRounds (no 3/2!)

      const rankedPlayers = Array.from(room.players.values()).sort((a, b) => (b.score || 0) - (a.score || 0));

      io.to(roomId).emit('game:ended', {
        players: rankedPlayers,
        roomId: room.id,
      });

      io.to(roomId).emit('room:data', serializeRoom(room));

      io.to(roomId).emit('chat:message', {
        id: `sys-${Date.now()}`,
        senderName: 'System',
        text: `🏆 Match Complete! Both players are winners! Returning to lobby...`,
        type: 'system',
        timestamp: Date.now(),
      });

      // Automatically reset room and return both players to lobby after 6 seconds
      setTimeout(() => {
        const r = rooms.get(roomId);
        if (!r || r.status !== 'game_end') return;

        r.status = 'lobby';
        r.currentRound = 1;
        r.timeLeft = 0;
        r.currentWord = '';
        r.wordChoices = [];
        r.revealedIndices = [];
        r.strokes = [];
        r.currentDrawerId = null;
        r.drawerIndex = 0;
        r.players.forEach((p) => {
          p.isDrawing = false;
          p.hasGuessed = false;
        });

        io.to(roomId).emit('room:data', serializeRoom(r));
        io.to(roomId).emit('chat:message', {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: `🏠 Back in the lobby! Ready for the next game.`,
          type: 'system',
          timestamp: Date.now(),
        });
      }, 6000);

      return;
    }

    // Otherwise, advance to next round
    room.drawerIndex = 0;
    room.currentRound += 1;
  }

  // Determine current drawer
  const nextDrawerId = room.drawerOrder[room.drawerIndex];
  room.currentDrawerId = nextDrawerId;
  room.drawerIndex += 1;

  // Reset player per-turn state
  room.players.forEach((p) => {
    p.isDrawing = p.id === nextDrawerId;
    p.hasGuessed = false;
  });

  // Prepare 3 word choices
  room.status = 'choosing';
  room.wordChoices = getThreeWordChoices(
    room.settings.customWords,
    room.settings.onlyCustomWords
  );
  room.strokes = [];
  room.revealedIndices = [];
  room.currentWord = '';
  room.timeLeft = 15; // 15 seconds to select word

  const drawer = room.players.get(nextDrawerId);

  // Broadcast room state to all clients so they transition into GameScreen
  io.to(roomId).emit('room:data', serializeRoom(room));
  io.to(roomId).emit('chat:message', {
    id: `sys-${Date.now()}`,
    senderName: 'System',
    text: `✏️ ${drawer?.username || 'A player'} is choosing a word!`,
    type: 'system',
    timestamp: Date.now(),
  });

  // Send choices to drawer (immediately and with slight delay to ensure GameScreen is mounted)
  if (drawer) {
    io.to(drawer.socketId).emit('word:choices', {
      choices: room.wordChoices,
      duration: 15,
    });

    // Fallback broadcast after 250ms to ensure client has mounted GameScreen
    setTimeout(() => {
      const currentRoom = rooms.get(roomId);
      if (currentRoom && currentRoom.status === 'choosing' && currentRoom.currentDrawerId === nextDrawerId) {
        io.to(drawer.socketId).emit('word:choices', {
          choices: currentRoom.wordChoices,
          duration: currentRoom.timeLeft || 15,
        });
      }
    }, 250);
  }

  // 15-second choosing countdown
  room.timerInterval = setInterval(() => {
    const r = rooms.get(roomId);
    if (!r) return;

    r.timeLeft -= 1;
    io.to(roomId).emit('timer:tick', { timeLeft: r.timeLeft, phase: 'choosing' });

    if (r.timeLeft <= 0) {
      if (r.timerInterval) clearInterval(r.timerInterval);
      const autoWord = r.wordChoices[0] || 'apple';
      beginDrawingTurn(io, roomId, autoWord);
    }
  }, 1000);
}

/**
 * Begin active drawing phase with the chosen word.
 */
export function beginDrawingTurn(io: Server, roomId: string, word: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  room.status = 'drawing';
  room.currentWord = word.trim().toUpperCase();
  room.timeLeft = room.settings.drawTime || 80;
  room.strokes = [];

  // Drawer gets full word
  const drawer = room.currentDrawerId ? room.players.get(room.currentDrawerId) : null;
  if (drawer) {
    io.to(drawer.socketId).emit('word:secret', {
      word: room.currentWord,
    });
  }

  // Guessers receive blanks / hints
  socketToRoom.forEach(({ roomId: rId, playerId }, socketId) => {
    if (rId === roomId && playerId !== room.currentDrawerId) {
      io.to(socketId).emit('word:hint', {
        length: room.currentWord.length,
        revealedIndices: room.revealedIndices,
      });
    }
  });

  io.to(roomId).emit('room:data', serializeRoom(room));
  io.to(roomId).emit('chat:message', {
    id: `sys-${Date.now()}`,
    senderName: 'System',
    text: `🎨 Round ${room.currentRound}: Start drawing! (${room.currentWord.length} letters)`,
    type: 'system',
    timestamp: Date.now(),
  });

  // Active drawing countdown timer
  room.timerInterval = setInterval(() => {
    const r = rooms.get(roomId);
    if (!r || r.status !== 'drawing') return;

    r.timeLeft -= 1;
    io.to(roomId).emit('timer:tick', { timeLeft: r.timeLeft, phase: 'drawing' });

    // Mid-turn letter hint (only for guessers, NEVER the drawer!)
    if (r.timeLeft === Math.floor(r.settings.drawTime / 2) && r.revealedIndices.length === 0) {
      const hintIndex = Math.floor(Math.random() * r.currentWord.length);
      r.revealedIndices.push(hintIndex);
      socketToRoom.forEach(({ roomId: rId, playerId }, socketId) => {
        if (rId === roomId && playerId !== r.currentDrawerId) {
          io.to(socketId).emit('word:hint', {
            length: r.currentWord.length,
            revealedIndices: r.revealedIndices,
            revealedChar: r.currentWord[hintIndex],
            hintIndex,
          });
        }
      });
    }

    if (r.timeLeft <= 0) {
      if (r.timerInterval) clearInterval(r.timerInterval);
      endTurn(io, roomId, 'Time is up!');
    }
  }, 1000);
}

/**
 * End the active turn, announce the answer, and schedule the next turn.
 */
export function endTurn(io: Server, roomId: string, reason: string) {
  const room = rooms.get(roomId);
  if (!room) return;

  if (room.timerInterval) {
    clearInterval(room.timerInterval);
    room.timerInterval = undefined;
  }

  room.status = 'round_end';

  io.to(roomId).emit('turn:ended', {
    word: room.currentWord,
    reason,
    players: Array.from(room.players.values()),
  });

  io.to(roomId).emit('chat:message', {
    id: `sys-${Date.now()}`,
    senderName: 'System',
    text: `🔔 Turn ended! The secret word was: "${room.currentWord}"`,
    type: 'system',
    timestamp: Date.now(),
  });

  // Brief reveal delay (4 seconds) before initiating next turn
  setTimeout(() => {
    startNextTurn(io, roomId);
  }, 4000);
}
