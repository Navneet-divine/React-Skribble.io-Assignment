import React, { useState } from 'react';
import { Clock, RotateCcw, LogOut, Sparkles, Pencil, EyeOff, Layers } from 'lucide-react';
import { type GameMode } from '../types/room';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

interface GameHeaderProps {
  currentRound: number;
  totalRounds: number;
  timeLeft: number;
  totalTime: number;
  word: string;
  revealedIndices?: number[]; // indices of revealed letters for guessers
  isDrawer: boolean;
  drawerName: string;
  roomId?: string;
  onLeaveGame?: () => void;
  gameMode?: GameMode;
  hidden?: boolean;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  currentRound,
  totalRounds,
  timeLeft,
  totalTime,
  word,
  revealedIndices = [],
  isDrawer,
  drawerName,
  roomId,
  onLeaveGame,
  gameMode = 'normal',
  hidden = false,
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  // Determine timer urgency state
  const getTimerStyles = () => {
    if (timeLeft <= 10) {
      return {
        container: 'bg-rose-500/15 border-rose-500/50 text-rose-300 animate-pulse shadow-rose-900/40',
        bar: 'bg-rose-500',
        text: 'text-rose-400',
      };
    }
    if (timeLeft <= 25) {
      return {
        container: 'bg-amber-500/15 border-amber-500/50 text-amber-300 shadow-amber-900/30',
        bar: 'bg-amber-400',
        text: 'text-amber-400',
      };
    }
    return {
      container: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-300 shadow-emerald-900/20',
      bar: 'bg-emerald-400',
      text: 'text-emerald-400',
    };
  };

  const timerStyle = getTimerStyles();
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / (totalTime || 80)) * 100));

  // Render masked word for guesser or full word for drawer
  const renderWordDisplay = () => {
    // Drawer view: full word or combination phrase
    if (isDrawer) {
      if (!word) {
        return (
          <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
            <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
            <span>Choosing a word...</span>
          </div>
        );
      }

      const isCombo = word.includes('+') || gameMode === 'combination';

      return (
        <div className="flex flex-col sm:flex-row items-center gap-0.5 sm:gap-3">
          <span className="text-[9px] sm:text-[11px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-1.5 py-0.5 rounded flex items-center gap-1">
            {isCombo && <Layers className="w-3 h-3 text-amber-400" />}
            {isCombo ? 'Combination' : 'Your Word'}
          </span>
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="text-base sm:text-2xl font-black tracking-wider sm:tracking-widest text-white uppercase drop-shadow-sm font-heading">
              {word}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold text-slate-400 bg-slate-800/80 px-1.5 sm:px-2 py-0.5 rounded-full border border-slate-700">
              {word.replace(/[\s+]/g, '').length} <span className="hidden sm:inline">letters</span>
              <span className="sm:hidden">L</span>
            </span>
          </div>
        </div>
      );
    }

    // Guesser view in Hidden Mode: Rely on drawing alone, zero length or hints revealed
    if (hidden || gameMode === 'hidden') {
      return (
        <div className="flex flex-col items-center gap-0.5 sm:gap-1">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <EyeOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
              Hidden Mode (??? )
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[10px] sm:text-xs text-slate-400">
            <span>Rely on drawing alone</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-slate-300 truncate max-w-[140px] sm:max-w-none">
              <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
              <strong className="text-white truncate">{drawerName || 'Drawer'}</strong>
              <span className="hidden sm:inline">is drawing</span>
            </span>
          </div>
        </div>
      );
    }

    // Guesser view when waiting for choice
    if (!word) {
      return (
        <div className="flex items-center gap-2 text-slate-400 text-sm font-medium">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-spin" />
          <span>Choosing a word...</span>
        </div>
      );
    }

    // Guesser view: masked blanks with spacing, combination +, and letter hints
    return (
      <div className="flex flex-col items-center gap-0.5 sm:gap-1">
        <div className="flex items-center gap-1 sm:gap-2 flex-wrap justify-center">
          {word.split('').map((char, index) => {
            if (char === ' ') {
              return <span key={index} className="w-2 sm:w-3" />;
            }
            if (char === '+') {
              return (
                <span
                  key={index}
                  className="inline-flex items-center justify-center font-black text-amber-400 text-sm sm:text-lg px-2 py-0.5 bg-amber-500/15 rounded-lg border border-amber-500/30 shadow-xs"
                >
                  +
                </span>
              );
            }
            const isRevealed = char !== '_' || revealedIndices.includes(index);
            return (
              <span
                key={index}
                className={`inline-flex items-center justify-center font-mono font-bold text-base sm:text-2xl min-w-[16px] sm:min-w-[26px] h-6 sm:h-9 border-b-2 sm:border-b-3 transition-colors ${
                  isRevealed
                    ? 'border-indigo-400 text-indigo-200'
                    : 'border-slate-500 text-transparent'
                }`}
              >
                {isRevealed ? char.toUpperCase() : '_'}
              </span>
            );
          })}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-slate-400">
          <span>
            {gameMode === 'combination'
              ? 'Combination Mode'
              : `${word.replace(/[\s+]/g, '').length} letters`}
          </span>
          <span>•</span>
          <span className="flex items-center gap-1 text-slate-300 truncate max-w-[140px] sm:max-w-none">
            <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <strong className="text-white truncate">{drawerName || 'Drawer'}</strong>
            <span className="hidden sm:inline">is drawing</span>
          </span>
        </div>
      </div>
    );
  };

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl px-2.5 py-2 sm:px-6 sm:py-3.5 flex flex-col gap-1.5 sm:gap-2.5">
      <div className="flex items-center justify-between gap-1.5 sm:gap-3">
        {/* Left: Round Tracker & Room Info */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 sm:gap-2 bg-slate-800/70 border border-slate-700/70 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl">
            <RotateCcw className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400" />
            <div className="text-[11px] sm:text-xs font-semibold whitespace-nowrap">
              <span className="text-slate-400 hidden sm:inline">Round </span>
              <span className="text-white font-bold">{Math.min(currentRound, totalRounds)}</span>
              <span className="text-slate-500"> / {totalRounds}</span>
            </div>
          </div>

          {roomId && (
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/50 px-2.5 py-1.5 rounded-xl font-mono">
              <span className="text-slate-500">Room:</span>
              <span className="text-slate-200 font-semibold">{roomId}</span>
            </div>
          )}
        </div>

        {/* Center: Word Banner / Blanks */}
        <div className="flex-1 flex justify-center items-center px-1">
          {renderWordDisplay()}
        </div>

        {/* Right: Timer & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Animated Countdown Timer */}
          <div
            className={`flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-1.5 rounded-xl border shadow-sm transition-all duration-300 ${timerStyle.container}`}
          >
            <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${timerStyle.text}`} />
            <div className="flex items-baseline gap-0.5">
              <span className="text-sm sm:text-lg font-black tracking-tight font-mono">
                {timeLeft}
              </span>
              <span className="text-[9px] sm:text-[10px] font-bold uppercase opacity-80">s</span>
            </div>
          </div>

          {onLeaveGame && (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="p-1.5 sm:p-2 text-slate-400 hover:text-rose-300 bg-slate-800/60 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 rounded-xl transition-all cursor-pointer"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Thin animated time progress indicator bar */}
      <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
        <div
          className={`h-full transition-all duration-300 rounded-full ${timerStyle.bar}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Leave Game In-Progress Confirmation Modal */}
      {onLeaveGame && (
        <Dialog open={showLeaveConfirm} onOpenChange={setShowLeaveConfirm}>
          <DialogContent className="max-w-md">
            <DialogHeader className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto sm:mx-0">
                <LogOut className="w-6 h-6" />
              </div>
              <DialogTitle className="text-xl">Leave Game?</DialogTitle>
              <DialogDescription>
                Are you sure you want to leave the game in progress? Your current score will be forfeited and you will return to the homepage.
              </DialogDescription>
            </DialogHeader>

            <DialogFooter className="mt-4 gap-2 sm:gap-0">
              <button
                type="button"
                onClick={() => setShowLeaveConfirm(false)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold border border-slate-700/80 transition-colors cursor-pointer"
              >
                Stay in Game
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLeaveConfirm(false);
                  onLeaveGame();
                }}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/25 transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Yes, Leave Game</span>
              </button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </header>
  );
};
