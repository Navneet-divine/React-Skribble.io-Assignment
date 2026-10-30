import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GameHeader } from './GameHeader';
import { Scoreboard } from './Scoreboard';
import { DrawingCanvas } from './DrawingCanvas';
import { DrawingTools } from './DrawingTools';
import { GuessChat } from './GuessChat';
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
import { Pencil, Eye, Bot, Sparkles, RefreshCw, MessageSquare, Trophy } from 'lucide-react';

// Curated words with difficulty for Phase 4 interactive testing
const SAMPLE_WORD_CHOICES: WordChoice[][] = [
  [
    { word: 'Pizza', difficulty: 'easy' },
    { word: 'Guitar', difficulty: 'medium' },
    { word: 'Astronaut', difficulty: 'hard' },
  ],
  [
    { word: 'Coffee', difficulty: 'easy' },
    { word: 'Bicycle', difficulty: 'medium' },
    { word: 'Submarine', difficulty: 'hard' },
  ],
  [
    { word: 'Pencil', difficulty: 'easy' },
    { word: 'Laptop', difficulty: 'medium' },
    { word: 'Helicopter', difficulty: 'hard' },
  ],
];

interface GameScreenProps {
  onLeaveGame: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({ onLeaveGame }) => {
  const { currentRoom, players: lobbyPlayers } = useRoomStore();
  const { username, avatar } = usePlayerStore();

  // Role toggle: 'drawer' vs 'guesser' (Dev-mode switcher for testing before Phase 5 Socket.IO)
  const [role, setRole] = useState<'drawer' | 'guesser'>('drawer');
  const [mobileTab, setMobileTab] = useState<'draw' | 'chat' | 'scores'>('draw');

  // Word state
  const [wordChoicePoolIndex, setWordChoicePoolIndex] = useState(0);
  const [isWordModalOpen, setIsWordModalOpen] = useState(true);
  const [currentWord, setCurrentWord] = useState('GUITAR');
  const [revealedIndices, setRevealedIndices] = useState<number[]>([1]); // index 1 ('U') revealed for guesser hint

  // Timer & Round state
  const turnDuration = currentRoom?.settings.drawTime || 80;
  const [timeLeft, setTimeLeft] = useState(turnDuration);
  const [currentRound, setCurrentRound] = useState(1);
  const totalRounds = currentRoom?.settings.rounds || 3;

  // Drawing tools state
  const [activeColor, setActiveColor] = useState('#000000');
  const [activeSize, setActiveSize] = useState<StrokeSize>(8);
  const [activeTool, setActiveTool] = useState<DrawingTool>('brush');
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);

  // Initialize Game Players from lobby or fallback defaults
  const [players, setPlayers] = useState<GamePlayer[]>(() => {
    if (lobbyPlayers && lobbyPlayers.length > 0) {
      return lobbyPlayers.map((p, idx) => ({
        id: p.id,
        username: p.username,
        avatar: p.avatar,
        score: idx === 0 ? 320 : 180 + idx * 40,
        hasGuessed: false,
        isDrawing: idx === 0,
        isHost: p.isHost,
      }));
    }

    return [
      {
        id: 'player-me',
        username: username || 'Alex',
        avatar,
        score: 450,
        hasGuessed: false,
        isDrawing: true,
        isHost: true,
      },
      {
        id: 'player-sarah',
        username: 'Sarah (Design)',
        avatar: { style: 'lorelei', seed: 'Sarah', backgroundColor: 'ffd5dc' },
        score: 380,
        hasGuessed: false,
        isDrawing: false,
      },
      {
        id: 'player-david',
        username: 'David (Eng)',
        avatar: { style: 'bottts-neutral', seed: 'David', backgroundColor: 'b6e3f4' },
        score: 290,
        hasGuessed: false,
        isDrawing: false,
      },
      {
        id: 'player-emma',
        username: 'Emma (Product)',
        avatar: { style: 'adventurer', seed: 'Emma', backgroundColor: 'a7f3d0' },
        score: 210,
        hasGuessed: false,
        isDrawing: false,
      },
    ];
  });

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: 'msg-1',
      senderName: 'System',
      text: '✏️ Round 1 started! Drawer is picking a word.',
      type: 'system',
      timestamp: 1,
    },
    {
      id: 'msg-2',
      senderName: 'David (Eng)',
      text: 'Good luck everyone!',
      type: 'chat',
      timestamp: 2,
    },
  ]);

  // Turn Timer countdown
  useEffect(() => {
    if (isWordModalOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          // Timer finished
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
  };

  // Undo last stroke
  const handleUndo = useCallback(() => {
    setStrokes((prev) => prev.slice(0, -1));
  }, []);

  // Clear canvas
  const handleClear = useCallback(() => {
    setStrokes([]);
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

    const normalizedGuess = trimmed.toLowerCase();
    const normalizedTarget = currentWord.toLowerCase();

    // Check if guess matches the word
    if (role === 'guesser' && normalizedGuess === normalizedTarget) {
      // Correct guess!
      const pointsEarned = Math.max(100, Math.floor((timeLeft / turnDuration) * 500));

      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          senderName: username || 'You',
          text: `guessed the word! (+${pointsEarned} pts)`,
          type: 'correct',
          timestamp: Date.now(),
        },
      ]);

      setPlayers((prev) =>
        prev.map((p) => {
          if (p.id === localPlayer.id) {
            return {
              ...p,
              score: p.score + pointsEarned,
              hasGuessed: true,
            };
          }
          return p;
        })
      );
      return;
    }

    // Check for "close" guess (1 character difference)
    const isClose =
      role === 'guesser' &&
      Math.abs(normalizedGuess.length - normalizedTarget.length) <= 1 &&
      (normalizedGuess.includes(normalizedTarget.slice(0, -1)) ||
        normalizedTarget.includes(normalizedGuess));

    if (isClose) {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          senderName: username || 'You',
          text: `is very close!`,
          type: 'close',
          timestamp: Date.now(),
        },
        {
          id: `chat-${Date.now()}`,
          senderName: username || 'You',
          text: trimmed,
          type: 'chat',
          timestamp: Date.now(),
        },
      ]);
      return;
    }

    // Normal chat/guess
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        senderName: username || 'You',
        text: trimmed,
        type: 'chat',
        timestamp: Date.now(),
      },
    ]);
  };

  // Mock teammate simulated guess for Phase 4 testing
  const handleSimulateTeammateGuess = () => {
    const guessers = players.filter((p) => !p.isDrawing && !p.hasGuessed);
    if (guessers.length === 0) return;

    const randomGuesser = guessers[Math.floor(Math.random() * guessers.length)];
    const pts = Math.max(80, Math.floor((timeLeft / turnDuration) * 450));

    setMessages((prev) => [
      ...prev,
      {
        id: `mock-guess-${Date.now()}`,
        senderName: randomGuesser.username,
        text: `guessed the word! (+${pts} pts)`,
        type: 'correct',
        timestamp: Date.now(),
      },
    ]);

    setPlayers((prev) =>
      prev.map((p) =>
        p.id === randomGuesser.id ? { ...p, score: p.score + pts, hasGuessed: true } : p
      )
    );
  };

  // Switch role between drawer and guesser
  const toggleRole = () => {
    const nextRole = role === 'drawer' ? 'guesser' : 'drawer';
    setRole(nextRole);
    setMobileTab(nextRole === 'drawer' ? 'draw' : 'chat');

    setPlayers((prev) =>
      prev.map((p, idx) => {
        if (idx === 0) {
          return { ...p, isDrawing: nextRole === 'drawer', hasGuessed: false };
        }
        if (idx === 1) {
          return { ...p, isDrawing: nextRole === 'guesser', hasGuessed: false };
        }
        return { ...p, hasGuessed: false };
      })
    );
  };

  // Restart a turn with new word choices
  const handleNewTurn = () => {
    const nextPool = (wordChoicePoolIndex + 1) % SAMPLE_WORD_CHOICES.length;
    setWordChoicePoolIndex(nextPool);
    setCurrentRound((prev) => (prev >= totalRounds ? 1 : prev + 1));
    setIsWordModalOpen(true);
    setStrokes([]);
    setPlayers((prev) => prev.map((p) => ({ ...p, hasGuessed: false })));
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 py-2 flex flex-col gap-3">
      {/* Dev Mode Banner & Role Switcher */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 bg-indigo-950/40 border border-indigo-500/30 px-3.5 py-2 rounded-xl text-xs">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-indigo-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            Phase 4 Dev Arena:
          </span>
          <span className="text-slate-400 hidden sm:inline">
            Interactive mockup before Phase 5 Socket.IO
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Role Switcher Pill */}
          <div className="flex items-center bg-slate-900 border border-slate-700 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={toggleRole}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                role === 'drawer'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pencil className="w-3 h-3" />
              <span>Drawer</span>
            </button>
            <button
              type="button"
              onClick={toggleRole}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                role === 'guesser'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Guesser</span>
            </button>
          </div>

          {/* Simulate Bot Guess button */}
          <button
            type="button"
            onClick={handleSimulateTeammateGuess}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 rounded-lg font-semibold text-xs transition-colors cursor-pointer"
            title="Simulate a teammate guessing correctly"
          >
            <Bot className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">Simulate Guess</span>
          </button>

          {/* New Turn trigger */}
          <button
            type="button"
            onClick={handleNewTurn}
            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-lg text-xs cursor-pointer"
            title="Choose new word"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* 1. Game Top HUD */}
      <GameHeader
        currentRound={currentRound}
        totalRounds={totalRounds}
        timeLeft={timeLeft}
        totalTime={turnDuration}
        word={currentWord}
        revealedIndices={revealedIndices}
        isDrawer={role === 'drawer'}
        drawerName={role === 'drawer' ? (username || 'You') : 'Sarah (Design)'}
        roomId={currentRoom?.id}
        onLeaveGame={onLeaveGame}
      />

      {/* 2A. Mobile Layout (< lg): Pinned Canvas + Mobile Tab Switcher */}
      <div className="flex lg:hidden flex-col gap-2">
        {/* Canvas: Fixed 4:3 Aspect Ratio so it never pushes the page */}
        <div className="w-full aspect-[4/3] max-h-[260px] sm:max-h-[340px] relative">
          <DrawingCanvas
            isDrawer={role === 'drawer'}
            drawerName={role === 'drawer' ? (username || 'You') : 'Sarah (Design)'}
            activeColor={activeColor}
            activeSize={activeSize}
            activeTool={activeTool}
            strokes={strokes}
            onStrokesChange={setStrokes}
          />
        </div>

        {/* Mobile Tab Pills Bar */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-sm">
          {role === 'drawer' && (
            <button
              type="button"
              onClick={() => setMobileTab('draw')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mobileTab === 'draw'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Tools</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setMobileTab('chat')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'chat'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Guesses</span>
            {messages.length > 0 && (
              <span className="w-4 h-4 bg-slate-800 rounded-full text-[9px] flex items-center justify-center border border-slate-700">
                {messages.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('scores')}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              mobileTab === 'scores'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>Scores</span>
          </button>
        </div>

        {/* Mobile Active Panel */}
        <div className="w-full">
          {role === 'drawer' && mobileTab === 'draw' && (
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
          )}

          {mobileTab === 'chat' && (
            <div className="h-[250px] sm:h-[300px]">
              <GuessChat
                messages={messages}
                onSendMessage={handleSendMessage}
                isDrawer={role === 'drawer'}
                hasGuessed={hasGuessed}
                secretWord={currentWord}
              />
            </div>
          )}

          {mobileTab === 'scores' && (
            <div className="h-[250px] sm:h-[300px]">
              <Scoreboard players={players} currentUserId={localPlayer?.id} />
            </div>
          )}
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
              drawerName={role === 'drawer' ? (username || 'You') : 'Sarah (Design)'}
              activeColor={activeColor}
              activeSize={activeSize}
              activeTool={activeTool}
              strokes={strokes}
              onStrokesChange={setStrokes}
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
            secretWord={currentWord}
          />
        </div>
      </div>

      {/* 3. Word Choice Modal (Shown to Drawer when choosing) */}
      {role === 'drawer' && (
        <WordChoiceModal
          isOpen={isWordModalOpen}
          words={SAMPLE_WORD_CHOICES[wordChoicePoolIndex]}
          onSelectWord={handleSelectWord}
          selectionDuration={15}
        />
      )}
    </div>
  );
};
