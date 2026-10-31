import { Server } from 'socket.io';
import { rooms, socketToRoom } from '../store/roomStore.js';
import { serializeRoom, serializePlayer, getMaskedWord } from './roomUtils.js';
import { generateWordChoices } from '../constants/words.js';

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
        players: rankedPlayers.map(serializePlayer),
        roomId: room.id,
      });

      io.to(roomId).emit('room:data', serializeRoom(room));

      const topScore = rankedPlayers[0]?.score || 0;
      const topWinners = rankedPlayers.filter((p) => (p.score || 0) === topScore);
      const isMultipleWinners = topWinners.length > 1;

      let matchSummaryText = '';
      if (!isMultipleWinners) {
        matchSummaryText = `🏆 Match Complete! 👑 ${rankedPlayers[0]?.username || 'Player'} wins with ${topScore} pts!`;
      } else if (topWinners.length === rankedPlayers.length) {
        if (rankedPlayers.length === 2) {
          matchSummaryText = `🏆 Match Complete! 👑 Both players are winners with ${topScore} pts!`;
        } else {
          matchSummaryText = `🏆 Match Complete! 🎉 Everyone is a winner with ${topScore} pts!`;
        }
      } else {
        matchSummaryText = `🏆 Match Complete! 👑 Winners: ${topWinners.map((w) => w.username).join(' & ')} with ${topScore} pts!`;
      }

      io.to(roomId).emit('chat:message', {
        id: `sys-${Date.now()}`,
        senderName: 'System',
        text: matchSummaryText,
        type: 'system',
        timestamp: Date.now(),
      });

      // Automatically reset room and return players to lobby after 6 seconds
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
          p.score = 0;
          p.turnScore = 0;
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

    // Advance to next round!
    room.drawerIndex = 0;
    room.currentRound += 1;

    // Broadcast new round announcement (Skribbl.io: "Round 2 of 3")
    io.to(roomId).emit('round:change', {
      round: room.currentRound,
      totalRounds: room.totalRounds,
    });
    io.to(roomId).emit('room:data', serializeRoom(room));
    io.to(roomId).emit('chat:message', {
      id: `sys-${Date.now()}`,
      senderName: 'System',
      text: `🔄 Round ${room.currentRound} of ${room.totalRounds} has started!`,
      type: 'system',
      timestamp: Date.now(),
    });

    // Pause 2.5 seconds to display centered "Round X of Y" banner, then start drawer's turn
    setTimeout(() => {
      proceedWithDrawerTurn(io, roomId);
    }, 2500);
    return;
  }

  proceedWithDrawerTurn(io, roomId);
}

/**
 * Handle drawer turn preparation and word choices selection
 */
function proceedWithDrawerTurn(io: Server, roomId: string) {
  const room = rooms.get(roomId);
  if (!room || room.status === 'game_end') return;

  // Determine current drawer
  const nextDrawerId = room.drawerOrder[room.drawerIndex];
  room.currentDrawerId = nextDrawerId;
  room.drawerIndex += 1;

  // Reset player per-turn state
  room.players.forEach((p) => {
    p.isDrawing = p.id === nextDrawerId;
    p.hasGuessed = false;
    p.turnScore = 0;
  });

  const configuredWordCount = room.settings.wordCount || 3;
  const configuredGameMode = room.settings.gameMode || 'normal';

  // Prepare word choices
  room.wordChoices = generateWordChoices(
    configuredWordCount,
    configuredGameMode,
    room.settings.customWords,
    room.settings.onlyCustomWords,
    room.settings.language
  );
  room.strokes = [];
  room.revealedIndices = [];
  room.currentWord = '';

  const drawer = room.players.get(nextDrawerId);

  // If wordCount === 1: automatically select it and start drawing immediately without requiring manual selection
  if (configuredWordCount === 1 && room.wordChoices.length > 0) {
    const singleWord = room.wordChoices[0];
    io.to(roomId).emit('room:data', serializeRoom(room));
    io.to(roomId).emit('chat:message', {
      id: `sys-${Date.now()}`,
      senderName: 'System',
      text: `✏️ ${drawer?.username || 'A player'} is drawing!`,
      type: 'system',
      timestamp: Date.now(),
    });

    beginDrawingTurn(io, roomId, singleWord);
    return;
  }

  room.status = 'choosing';
  room.timeLeft = 15; // 15 seconds to select word

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
      const autoWord = r.wordChoices[0] || 'APPLE';
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
  room.revealedIndices = [];

  const isHiddenMode = room.settings.gameMode === 'hidden';
  const isCombinationMode = room.settings.gameMode === 'combination';

  // Drawer gets full secret word/phrase
  const drawer = room.currentDrawerId ? room.players.get(room.currentDrawerId) : null;
  if (drawer) {
    io.to(drawer.socketId).emit('word:secret', {
      word: room.currentWord,
    });
  }

  // Guessers receive blanks / hints permitted by the selected game mode
  const initialMask = getMaskedWord(room.currentWord, room.revealedIndices, room.settings.gameMode);
  socketToRoom.forEach(({ roomId: rId, playerId }, socketId) => {
    if (rId === roomId && playerId !== room.currentDrawerId) {
      io.to(socketId).emit('word:hint', {
        length: isHiddenMode ? 0 : room.currentWord.length,
        maskedWord: initialMask,
        revealedIndices: room.revealedIndices,
        hidden: isHiddenMode,
        gameMode: room.settings.gameMode,
      });
    }
  });

  io.to(roomId).emit('room:data', serializeRoom(room));

  const announcementText = isHiddenMode
    ? `🎨 Round ${room.currentRound}: Start drawing! (Hidden Word — Guess from drawing alone!)`
    : isCombinationMode
      ? `🎨 Round ${room.currentRound}: Start drawing! (Combination Mode — Two words combined)`
      : `🎨 Round ${room.currentRound}: Start drawing! (${Array.from(room.currentWord.replace(/\s+/g, '')).length} letters)`;

  io.to(roomId).emit('chat:message', {
    id: `sys-${Date.now()}`,
    senderName: 'System',
    text: announcementText,
    type: 'system',
    timestamp: Date.now(),
  });

  // Calculate letters eligible for hints (skip spaces, '+' and symbols, supporting all 10 languages)
  const letterIndices: number[] = [];
  for (let i = 0; i < room.currentWord.length; i++) {
    if (/\p{L}|\p{M}|\p{N}/u.test(room.currentWord[i])) {
      letterIndices.push(i);
    }
  }

  // In Hidden Mode, hints are completely disabled (0 hints).
  // Otherwise, clamp hints so at least 1 letter remains unrevealed.
  const configuredHints = room.settings.hints !== undefined ? room.settings.hints : 2;
  const maxPossibleHints = Math.max(0, letterIndices.length - 1);
  const targetHintsToReveal = isHiddenMode ? 0 : Math.min(configuredHints, maxPossibleHints);

  // Active drawing countdown timer
  room.timerInterval = setInterval(() => {
    const r = rooms.get(roomId);
    if (!r || r.status !== 'drawing') return;

    r.timeLeft -= 1;
    io.to(roomId).emit('timer:tick', { timeLeft: r.timeLeft, phase: 'drawing' });

    // Progressive letter hint scheduling across available drawing time
    if (targetHintsToReveal > 0 && r.revealedIndices.length < targetHintsToReveal) {
      const hintStep = r.revealedIndices.length + 1;
      // Distribute hints at evenly spaced intervals: e.g. for 2 hints at T*(2/3) and T*(1/3)
      const triggerThreshold = Math.floor(r.settings.drawTime * (1 - hintStep / (targetHintsToReveal + 1)));

      if (r.timeLeft <= triggerThreshold) {
        const unrevealed = letterIndices.filter((idx) => !r.revealedIndices.includes(idx));
        if (unrevealed.length > 1) {
          const pickIndex = unrevealed[Math.floor(Math.random() * unrevealed.length)];
          r.revealedIndices.push(pickIndex);

          const updatedMask = getMaskedWord(r.currentWord, r.revealedIndices, r.settings.gameMode);
          // Only guessers receive hint updates; drawer continues seeing secret word
          socketToRoom.forEach(({ roomId: rId, playerId }, socketId) => {
            if (rId === roomId && playerId !== r.currentDrawerId) {
              io.to(socketId).emit('word:hint', {
                length: r.currentWord.length,
                maskedWord: updatedMask,
                revealedIndices: r.revealedIndices,
                revealedChar: r.currentWord[pickIndex],
                hintIndex: pickIndex,
                hidden: false,
                gameMode: r.settings.gameMode,
              });
            }
          });
        }
      }
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

  // Determine who actually guessed the secret word
  const successfulGuessers = Array.from(room.players.values()).filter(
    (p) => !p.isDrawing && p.hasGuessed
  );

  let formattedReason = reason;
  if (successfulGuessers.length > 0) {
    if (successfulGuessers.length === 1) {
      formattedReason = `${successfulGuessers[0].username} guessed the word!`;
    } else if (successfulGuessers.length === 2) {
      formattedReason = `${successfulGuessers[0].username} & ${successfulGuessers[1].username} guessed the word!`;
    } else {
      const names = successfulGuessers.map((p) => p.username);
      formattedReason = `${names.slice(0, -1).join(', ')} & ${names[names.length - 1]} guessed the word!`;
    }
  } else if (reason === 'Time is up!') {
    formattedReason = 'Time is up! Nobody guessed the word.';
  }

  const scores = Array.from(room.players.values())
    .map((p) => ({
      id: p.id,
      username: p.username,
      avatar: p.avatar,
      turnScore: p.turnScore ?? 0,
      totalScore: p.score ?? 0,
      hasGuessed: Boolean(p.hasGuessed),
      isDrawing: Boolean(p.isDrawing),
    }))
    .sort((a, b) => (b.turnScore || 0) - (a.turnScore || 0));

  io.to(roomId).emit('turn:ended', {
    word: room.currentWord,
    reason: formattedReason,
    players: Array.from(room.players.values()).map(serializePlayer),
    scores,
  });

  io.to(roomId).emit('chat:message', {
    id: `sys-${Date.now()}`,
    senderName: 'System',
    text: `🔔 Turn ended! The secret word was: "${room.currentWord}" (${formattedReason})`,
    type: 'system',
    timestamp: Date.now(),
  });

  // Brief reveal delay (4.5 seconds) before initiating next turn so players view the score summary
  setTimeout(() => {
    startNextTurn(io, roomId);
  }, 4500);
}
