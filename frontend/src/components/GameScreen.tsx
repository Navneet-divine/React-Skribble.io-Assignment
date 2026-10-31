import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameHeader } from './GameHeader';
import { Scoreboard } from './Scoreboard';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingTools } from './DrawingTools';
import { GuessChat, GuessChatInput } from './GuessChat';
import { WordChoiceModal } from './WordChoiceModal';
import {
  type GamePlayer,
  type DrawingStroke,
  type DrawingTool,
  type StrokeSize,
  type ChatMessage,
  type WordChoice,
} from '../types/game';
import { useRoomStore } from '../store/roomStore';
import { usePlayerStore } from '../store/playerStore';
import {
  socket,
  emitDrawingStroke,
  emitDrawingUndo,
  emitDrawingClear,
  emitChatMessage,
  selectWordOnServer,
  returnToLobby,
} from '../lib/socket';
import { Trophy, Sparkles } from 'lucide-react';
import { SpoilerWarningModal } from './SpoilerWarningModal';
import { GameOverModal } from './GameOverModal';

interface GameScreenProps {
  onLeaveGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onLeaveGame }) => {
  const { currentRoom, players: lobbyPlayers } = useRoomStore();
  const { username, avatar } = usePlayerStore();

  // Role state: 'drawer' vs 'guesser'
  const [role, setRole] = useState<'drawer' | 'guesser'>('guesser');
  const [drawerName, setDrawerName] = useState<string>('Drawer');

  // Real word & turn state
  const [activeWordChoices, setActiveWordChoices] = useState<WordChoice[]>([]);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);
  const [currentWord, setCurrentWord] = useState('');
  const [drawerSecretWord, setDrawerSecretWord] = useState<string>('');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([]);
  const [isHiddenWord, setIsHiddenWord] = useState(false);
  const [turnEndInfo, setTurnEndInfo] = useState<{ word: string; reason: string } | null>(null);

  // Game completion state
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState(false);
  const [finalStandings, setFinalStandings] = useState<GamePlayer[]>([]);

  // Timer & Round state
  const turnDuration = currentRoom?.settings.drawTime || 80;
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    const storeState = useRoomStore.getState();
    const storedTime = storeState.timeLeft ?? currentRoom?.timeLeft;
    if (typeof storedTime === 'number' && storedTime > 0) {
      if (storeState.lastTimerTickAt) {
        const elapsedSec = Math.floor((Date.now() - storeState.lastTimerTickAt) / 1000);
        return Math.max(1, storedTime - elapsedSec);
      }
      return storedTime;
    }
    return turnDuration;
  });
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(currentRoom?.settings.rounds || 3);

  // Sync timeLeft whenever currentRoom.timeLeft updates from server
  useEffect(() => {
    if (typeof currentRoom?.timeLeft === 'number' && currentRoom.timeLeft > 0) {
      setTimeLeft(currentRoom.timeLeft);
    }
  }, [currentRoom?.timeLeft]);

  // Drawing tools state
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeSize, setActiveSize] = useState<StrokeSize>(8);
  const [activeTool, setActiveTool] = useState<DrawingTool>('brush');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);

  // Initialize Game Players from real lobby players with initial 0 score
  const [players, setPlayers] = useState<GamePlayer[]>(() => {
    if (lobbyPlayers && lobbyPlayers.length > 0) {
      return lobbyPlayers.map((p) => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        score: p.score ?? 0,
        hasGuessed: Boolean(p.hasGuessed),
        isDrawing: Boolean(p.isDrawing),
        isHost: Boolean(p.isHost),
      }));
    }

    return username
      ? [
          {
            id: 'player-local',
            username,
            avatar,
            score: 0,
            hasGuessed: false,
            isDrawing: false,
            isHost: true,
          },
        ]
      : [];
  });

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-init',
      senderName: 'System',
      text: '🎮 Connected to live game arena. Guess the word in chat!',
      type: 'system',
      timestamp: Date.now(),
    },
  ]);

  // Spoiler warning modal for drawer
  const [showSpoilerModal, setShowSpoilerModal] = useState(false);

  // Real-time Socket.IO Multiplayer Event Listeners
  useEffect(() => {
    // 1. Room Data Synchronization (Players, roles, scores, round)
    const handleRoomData = (data: any) => {
      if (data.players && Array.isArray(data.players)) {
        setPlayers(
          data.players.map((p: any) => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            score: p.score ?? 0,
            hasGuessed: Boolean(p.hasGuessed),
            isDrawing: Boolean(p.isDrawing),
            isHost: Boolean(p.isHost),
          }))
        );

        const currentDrawer = data.players.find((p: any) => p.id === data.currentDrawerId);
        if (currentDrawer) {
          setDrawerName(currentDrawer.username);
          const isDrawer = Boolean(
            (username && currentDrawer.username.toLowerCase() === username.trim().toLowerCase()) ||
            data.players.some((p: any) => p.username.toLowerCase() === username.trim().toLowerCase() && p.isDrawing)
          );
          setRole(isDrawer ? 'drawer' : 'guesser');
        }
      }

      if (data.currentRound) setCurrentRound(data.currentRound);
      if (data.totalRounds) setTotalRounds(data.totalRounds);
      if (data.timeLeft !== undefined) {
        setTimeLeft(data.timeLeft);
        useRoomStore.getState().setTimeLeft(data.timeLeft);
      }

      if (data.status === 'game_end') {
        setIsGameOverModalOpen(true);
      } else if (data.status === 'lobby') {
        setIsGameOverModalOpen(false);
      }
    };

    // 2. Word Choices received by the active Drawer
    const handleWordChoices = ({ choices, duration }: { choices: string[]; duration: number }) => {
      const formatted: WordChoice[] = choices.map((w, idx) => ({
        word: w,
        difficulty: idx === 0 ? 'easy' : idx === 1 ? 'medium' : 'hard',
      }));
      setActiveWordChoices(formatted);
      setRole('drawer');
      setIsWordModalOpen(true);
      const chosenDuration = duration || 15;
      setTimeLeft(chosenDuration);
      useRoomStore.getState().setTimeLeft(chosenDuration);
      setStrokes([]);
      setRevealedIndices([]);
      setCurrentWord('');
      setIsHiddenWord(false);
    };

    // 3. Secret Word received by Drawer
    const handleWordSecret = ({ word }: { word: string }) => {
      const upper = word.toUpperCase();
      setDrawerSecretWord(upper);
      setCurrentWord(upper);
      setRole('drawer');
      setIsWordModalOpen(false);
      setStrokes([]);
      setRevealedIndices([]);
      setIsHiddenWord(false);
    };

    // 4. Word Hint received by Guessers (Word length, mask & revealed letters)
    const handleWordHint = ({
      length,
      revealedIndices: rIdxs,
      maskedWord,
      hidden,
    }: {
      length: number;
      revealedIndices: number[];
      maskedWord?: string;
      hidden?: boolean;
    }) => {
      // If local player is the drawer, NEVER overwrite secret word with blanks!
      if (role === 'drawer' || drawerSecretWord) return;

      if (hidden) {
        setIsHiddenWord(true);
        setCurrentWord('');
      } else {
        setIsHiddenWord(false);
        setCurrentWord(maskedWord || '_'.repeat(length));
      }

      setRevealedIndices(rIdxs || []);
      setIsWordModalOpen(false);
    };

    // 5. Timer Tick sync from server clock
    const handleTimerTick = ({ timeLeft: t }: { timeLeft: number }) => {
      setTimeLeft(t);
      useRoomStore.getState().setTimeLeft(t);
    };

    // 6. Incoming Drawing Stroke from Drawer
    const handleDrawStroke = (stroke: DrawingStroke) => {
      setStrokes((prev) => [...prev, stroke]);
    };

    // 7. Undo & Clear from Drawer
    const handleDrawUndo = () => {
      setStrokes((prev) => prev.slice(0, -1));
    };

    const handleDrawClear = () => {
      setStrokes([]);
    };

    // 8. Canvas history sync for late joiners
    const handleDrawHistory = ({ strokes: hStrokes }: { strokes: DrawingStroke[] }) => {
      if (Array.isArray(hStrokes)) {
        setStrokes(hStrokes);
      }
    };

    // 9. Real-time Chat & Guess broadcasts
    const handleChatMessage = (msg: ChatMessage) => {
      setMessages((prev) => [...prev, msg]);
    };

    const handleChatWarning = (text: string) => {
      setShowSpoilerModal(true);
      setMessages((prev) => [
        ...prev,
        {
          id: `warn-${Date.now()}`,
          senderName: 'System',
          text: `⚠️ ${text}`,
          type: 'system',
          timestamp: Date.now(),
        },
      ]);
    };

    // 10. Turn ended announcement
    const handleTurnEnded = ({ word, reason, players: updatedPlayers }: { word: string; reason: string; players: any[] }) => {
      setTurnEndInfo({ word, reason });
      setDrawerSecretWord('');
      setIsHiddenWord(false);
      if (updatedPlayers && Array.isArray(updatedPlayers)) {
        setPlayers(
          updatedPlayers.map((p: any) => ({
            id: p.id,
            username: p.username,
            avatar: p.avatar,
            score: p.score ?? 0,
            hasGuessed: Boolean(p.hasGuessed),
            isDrawing: Boolean(p.isDrawing),
            isHost: Boolean(p.isHost),
          }))
        );
      }
      setTimeout(() => setTurnEndInfo(null), 3800);
    };

    // 11. Game Ended (Match complete)
    const handleGameEnded = ({ players: endPlayers }: { players: any[] }) => {
      if (Array.isArray(endPlayers)) {
        const mapped = endPlayers.map((p: any) => ({
          id: p.id,
          username: p.username,
          avatar: p.avatar,
          score: p.score ?? 0,
          hasGuessed: false,
          isDrawing: false,
          isHost: Boolean(p.isHost),
        }));
        setFinalStandings(mapped);
      }
      setIsGameOverModalOpen(true);
    };

    // Register all socket event listeners
    socket.on('room:data', handleRoomData);
    socket.on('word:choices', handleWordChoices);
    socket.on('word:secret', handleWordSecret);
    socket.on('word:hint', handleWordHint);
    socket.on('timer:tick', handleTimerTick);
    socket.on('draw:stroke', handleDrawStroke);
    socket.on('draw:undo', handleDrawUndo);
    socket.on('draw:clear', handleDrawClear);
    socket.on('draw:history', handleDrawHistory);
    socket.on('chat:message', handleChatMessage);
    socket.on('chat:warning', handleChatWarning);
    socket.on('turn:ended', handleTurnEnded);
    socket.on('game:ended', handleGameEnded);

    // Request choices from server in case this client mounted as the active drawer
    socket.emit('game:request_choices');

    return () => {
      socket.off('room:data', handleRoomData);
      socket.off('word:choices', handleWordChoices);
      socket.off('word:secret', handleWordSecret);
      socket.off('word:hint', handleWordHint);
      socket.off('timer:tick', handleTimerTick);
      socket.off('draw:stroke', handleDrawStroke);
      socket.off('draw:undo', handleDrawUndo);
      socket.off('draw:clear', handleDrawClear);
      socket.off('draw:history', handleDrawHistory);
      socket.off('chat:message', handleChatMessage);
      socket.off('chat:warning', handleChatWarning);
      socket.off('turn:ended', handleTurnEnded);
      socket.off('game:ended', handleGameEnded);
    };
  }, [username]);

  // Turn Timer local countdown fallback (only if socket offline)
  useEffect(() => {
    if (socket.connected || isWordModalOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isWordModalOpen]);

  // Handle drawer word selection
  const handleSelectWord = (word: string) => {
    setCurrentWord(word.toUpperCase());
    setIsWordModalOpen(false);
    setTimeLeft(turnDuration);
    setStrokes([]);
    setRevealedIndices([]);

    if (socket.connected) {
      selectWordOnServer(word);
    } else {
      setMessages((prev) => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          senderName: 'System',
          text: `✏️ A new word was chosen! (${word.length} letters)`,
          type: 'system',
          timestamp: Date.now(),
        },
      ]);
    }
  };

  // Live stroke completion from drawer
  const handleStrokeComplete = (stroke: DrawingStroke) => {
    if (socket.connected) {
      emitDrawingStroke(stroke);
    }
  };

  // Undo last stroke
  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
    if (socket.connected) {
      emitDrawingUndo();
    }
  }, []);

  // Clear canvas
  const handleClear = useCallback(() => {
    setStrokes([]);
    if (socket.connected) {
      emitDrawingClear();
    }
  }, []);

  // Check if player has guessed
  const localPlayer = useMemo(() => {
    return players.find((p) => p.username === username) || players[0];
  }, [players, username]);

  const hasGuessed = localPlayer?.hasGuessed || false;

  // Handle sending a guess or chat
  const handleSendMessage = (text: string) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    emitChatMessage(trimmed);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 flex flex-col gap-3">

      {/* 1. Game Top HUD */}
      <GameHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        timeLeft={timeLeft}
        totalTime={turnDuration}
        word={role === 'drawer' ? (drawerSecretWord || currentWord) : currentWord}
        revealedIndices={revealedIndices}
        isDrawer={role === 'drawer'}
        drawerName={role === 'drawer' ? (username || 'You') : drawerName}
        roomId={currentRoom?.id}
        onLeaveGame={onLeaveGame}
        gameMode={currentRoom?.settings.gameMode || 'normal'}
        hidden={role !== 'drawer' && (isHiddenWord || currentRoom?.settings.gameMode === 'hidden')}
      />

      {/* 2A. Mobile & Tablet Layout (< lg): Skribbl-Style Viewport Arena (Simultaneous Drawing & Typing) */}
      <div className="flex lg:hidden flex-col gap-2">
        {/* Canvas: Prominent, non-scrolling fit for mobile viewports */}
        {/* For guesser: Expands height to absorb the space of the hidden toolbar, keeping scores & chat input neatly at the bottom */}
        <div
          className={`w-full relative rounded-2xl overflow-hidden shadow-2xl border border-slate-800 shrink-0 transition-all duration-300 ${
            role === 'drawer'
              ? 'h-[190px] xs:h-[210px] sm:h-[280px]'
              : 'h-[320px] xs:h-[340px] sm:h-[410px]'
          }`}
        >
          <DrawingCanvas
            isDrawer={role === 'drawer'}
            drawerName={role === 'drawer' ? (username || 'You') : drawerName}
            activeColor={activeColor}
            activeSize={activeSize}
            activeTool={activeTool}
            strokes={strokes}
            onStrokesChange={setStrokes}
            onStrokeComplete={handleStrokeComplete}
          />
        </div>

        {/* Drawing Tools (Always shown right below canvas for the active drawer) */}
        {role === 'drawer' && (
          <div className="w-full shrink-0">
            <DrawingTools
              isDrawer={true}
              activeColor={activeColor}
              activeSize={activeSize}
              activeTool={activeTool}
              canUndo={strokes.length > 0}
              onSelectColor={setActiveColor}
              onSelectSize={setActiveSize}
              onSelectTool={setActiveTool}
              onUndo={handleUndo}
              onClear={handleClear}
            />
          </div>
        )}

        {/* Skribbl-Style Split Row on Mobile: 50-50 Width for Scores (Left) + Live Chat Feed (Right) */}
        <div className="grid grid-cols-2 gap-1.5 xs:gap-2 h-[150px] xs:h-[165px] sm:h-[190px] w-full shrink-0 min-h-0 overflow-hidden">
          {/* Left Column: Compact Scoreboard (50% width) */}
          <div className="h-full min-h-0 overflow-hidden">
            <Scoreboard
              players={players}
              currentUserId={localPlayer?.id}
              compact={true}
            />
          </div>

          {/* Right Column: Live Chat Feed with auto-scroll (50% width) */}
          <div className="h-full min-h-0 overflow-hidden">
            <GuessChat
              messages={messages}
              onSendMessage={handleSendMessage}
              isDrawer={role === 'drawer'}
              hasGuessed={hasGuessed}
              secretWord={role === 'drawer' ? (drawerSecretWord || currentWord) : undefined}
              onTriggerSpoiler={() => setShowSpoilerModal(true)}
              hideInput={true}
              compact={true}
            />
          </div>
        </div>

        {/* Full-Width Guess Input Bar: Pinned directly beneath canvas & chat so user can type while seeing drawing! */}
        <div className="w-full shrink-0">
          <GuessChatInput
            onSendMessage={handleSendMessage}
            isDrawer={role === 'drawer'}
            hasGuessed={hasGuessed}
            secretWord={role === 'drawer' ? (drawerSecretWord || currentWord) : undefined}
            onTriggerSpoiler={() => setShowSpoilerModal(true)}
          />
        </div>
      </div>

      {/* 2B. Desktop Layout (>= lg): 3-Column Arena Grid */}
      <div className="hidden lg:grid lg:grid-cols-12 gap-3 lg:h-[580px]">
        {/* Left Column: Scoreboard (3 cols on desktop) */}
        <div className="lg:col-span-3 h-full">
          <Scoreboard
            players={players}
            currentUserId={localPlayer?.id}
          />
        </div>

        {/* Center Column: Drawing Area (6 cols on desktop) */}
        <div className="lg:col-span-6 flex flex-col gap-2.5 h-full">
          {/* HTML5 Canvas container with strict min-h-0 flex-1 */}
          <div className="flex-1 w-full relative min-h-0">
            <DrawingCanvas
              isDrawer={role === 'drawer'}
              drawerName={role === 'drawer' ? (username || 'You') : drawerName}
              activeColor={activeColor}
              activeSize={activeSize}
              activeTool={activeTool}
              strokes={strokes}
              onStrokesChange={setStrokes}
              onStrokeComplete={handleStrokeComplete}
            />
          </div>

          {/* Drawing Tools (Visible only to drawer) */}
          {role === 'drawer' && (
            <div className="shrink-0">
              <DrawingTools
                isDrawer={true}
                activeColor={activeColor}
                activeSize={activeSize}
                activeTool={activeTool}
                canUndo={strokes.length > 0}
                onSelectColor={setActiveColor}
                onSelectSize={setActiveSize}
                onSelectTool={setActiveTool}
                onUndo={handleUndo}
                onClear={handleClear}
              />
            </div>
          )}
        </div>

        {/* Right Column: Guess Chat (3 cols on desktop) */}
        <div className="lg:col-span-3 h-full">
          <GuessChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isDrawer={role === 'drawer'}
            hasGuessed={hasGuessed}
            secretWord={role === 'drawer' ? (drawerSecretWord || currentWord) : undefined}
            showSpoilerModal={showSpoilerModal}
            onCloseSpoilerModal={() => setShowSpoilerModal(false)}
            onTriggerSpoiler={() => setShowSpoilerModal(true)}
          />
        </div>
      </div>

      {/* Global Spoiler Warning Modal for Mobile & Desktop */}
      <SpoilerWarningModal
        isOpen={showSpoilerModal}
        onClose={() => setShowSpoilerModal(false)}
      />

      {/* 3. Word Choice Modal (Shown to Drawer when choosing) */}
      {role === 'drawer' && isWordModalOpen && activeWordChoices.length > 0 && (
        <WordChoiceModal
          isOpen={isWordModalOpen}
          words={activeWordChoices}
          onSelectWord={handleSelectWord}
          selectionDuration={15}
          timeLeft={timeLeft}
        />
      )}

      {/* Guesser banner when drawer is choosing word */}
      {role === 'guesser' && drawerName && !currentWord && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 max-w-[90vw]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-slate-900/90 text-indigo-300 font-heading font-bold shadow-2xl border border-indigo-500/30 backdrop-blur-md animate-pulse">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{drawerName} is choosing a word...</span>
            <span className="text-xs px-2.5 py-1 rounded-full bg-indigo-500/20 text-white font-mono">{timeLeft}s</span>
          </div>
        </div>
      )}

      {/* Turn Ended Alert Announcement */}
      {turnEndInfo && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-bounce max-w-[90vw]">
          <div className="flex items-center gap-3 px-5 py-3 rounded-2xl bg-amber-500 text-slate-950 font-heading font-black shadow-2xl shadow-amber-500/40 border border-amber-300">
            <Trophy className="w-5 h-5 text-slate-950 shrink-0" />
            <div className="text-xs sm:text-sm">
              <span>Turn Ended! The word was: </span>
              <span className="underline decoration-wavy uppercase">{turnEndInfo.word}</span>
              <span className="text-xs font-normal ml-2 opacity-90">({turnEndInfo.reason})</span>
            </div>
          </div>
        </div>
      )}

      {/* Game Over Celebration Modal (Winners announcement) */}
      <GameOverModal
        isOpen={isGameOverModalOpen}
        players={finalStandings.length > 0 ? finalStandings : players}
        onReturnToLobby={() => {
          returnToLobby();
          setIsGameOverModalOpen(false);
        }}
        autoRedirectSeconds={6}
      />
    </div>
  );
};
