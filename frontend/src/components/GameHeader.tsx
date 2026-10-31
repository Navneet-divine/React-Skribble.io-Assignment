import React, { useState, useEffect } from 'react';
import { Clock, RotateCcw, LogOut, Sparkles, Pencil, EyeOff, Layers, Volume2, VolumeX } from 'lucide-react';
import { type GameMode } from '../types/room';
import { soundManager } from '../lib/soundManager';
import { useSoundStore } from '../store/soundStore';
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
  revealedIndices: _revealedIndices = [],
  isDrawer,
  drawerName,
  roomId,
  onLeaveGame,
  gameMode = 'normal',
  hidden = false,
}) => {
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const { isMuted, toggleMute } = useSoundStore();

  // Watch timer ticking sound on final 10 seconds of turn
  useEffect(() => {
    if (timeLeft <= 10 && timeLeft > 0) {
      soundManager.playTimerTick(timeLeft);
    } else if (timeLeft > 10) {
      soundManager.resetTimerTick();
    }
  }, [timeLeft]);

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
      const comboParts = isCombo && word.includes('+') ? word.split('+').map((s) => s.trim()) : null;

      return (
        <div className="flex flex-col items-center justify-center text-center min-w-0">
          {comboParts && comboParts.length === 2 ? (
            <div className="flex items-center justify-center gap-1.5 sm:gap-2 text-center leading-tight">
              <span className="text-xs sm:text-2xl font-black tracking-wider text-white uppercase drop-shadow-sm font-heading">
                {comboParts[0]}
              </span>
              <span className="text-amber-400 font-black text-xs sm:text-lg px-1 leading-none inline-flex items-center justify-center">
                +
              </span>
              <span className="text-xs sm:text-2xl font-black tracking-wider text-white uppercase drop-shadow-sm font-heading">
                {comboParts[1]}
              </span>
            </div>
          ) : (
            <span className="text-xs sm:text-2xl font-black tracking-wider sm:tracking-widest text-white uppercase drop-shadow-sm font-heading truncate max-w-full">
              {word}
            </span>
          )}
          {!isCombo && (
            <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-indigo-300 bg-indigo-950/60 border border-indigo-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0 mt-0.5">
              Your Word
            </span>
          )}
        </div>
      );
    }

    // Guesser view in Hidden Mode: Rely on drawing alone, zero length or hints revealed
    if (hidden || gameMode === 'hidden') {
      return (
        <div className="flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1 w-full min-w-0">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 shrink-0">
            <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="font-mono font-bold text-xs sm:text-sm tracking-wider uppercase">
              Hidden Mode (??? )
            </span>
          </div>
          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 truncate max-w-[160px] sm:max-w-none">
            <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <strong className="text-white truncate">{drawerName || 'Drawer'}</strong>
            <span className="hidden sm:inline">is drawing</span>
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

    const isCombo = word.includes('+') || gameMode === 'combination';

    // Guesser view in Combination Mode: Words in ONE horizontal line with + in middle
    if (isCombo && word.includes('+')) {
      const parts = word.split('+');
      const part1 = parts[0].trim();
      const part2 = parts[1].trim();

      return (
        <div className="flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1 min-w-0 max-w-full">
          {/* Words in one line */}
          <div className="flex items-center justify-center gap-1 sm:gap-2 max-w-full flex-wrap sm:flex-nowrap">
            {/* Word 1 Blanks */}
            <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 shrink-0">
              {part1.split('').map((char, i) => {
                if (char === ' ') return <span key={`w1-sp-${i}`} className="w-1 sm:w-2" />;
                const isRevealed = char !== '_';
                return (
                  <span
                    key={`w1-${i}`}
                    className={`inline-flex items-center justify-center font-mono font-bold text-xs sm:text-2xl min-w-[11px] sm:min-w-[24px] h-5 sm:h-9 border-b-2 sm:border-b-3 transition-colors ${
                      isRevealed
                        ? 'border-indigo-400 text-indigo-200'
                        : 'border-slate-500 text-transparent'
                    }`}
                  >
                    {isRevealed ? char.toUpperCase() : '\u00A0'}
                  </span>
                );
              })}
            </div>

            {/* Middle Plus Sign */}
            <span className="inline-flex items-center justify-center font-black text-amber-400 text-xs sm:text-sm px-1.5 py-0.5 bg-amber-500/15 rounded-md border border-amber-500/30 shadow-xs shrink-0">
              +
            </span>

            {/* Word 2 Blanks */}
            <div className="flex items-center justify-center gap-0.5 sm:gap-1.5 shrink-0">
              {part2.split('').map((char, i) => {
                if (char === ' ') return <span key={`w2-sp-${i}`} className="w-1 sm:w-2" />;
                const isRevealed = char !== '_';
                return (
                  <span
                    key={`w2-${i}`}
                    className={`inline-flex items-center justify-center font-mono font-bold text-xs sm:text-2xl min-w-[11px] sm:min-w-[24px] h-5 sm:h-9 border-b-2 sm:border-b-3 transition-colors ${
                      isRevealed
                        ? 'border-indigo-400 text-indigo-200'
                        : 'border-slate-500 text-transparent'
                    }`}
                  >
                    {isRevealed ? char.toUpperCase() : '\u00A0'}
                  </span>
                );
              })}
            </div>
          </div>

          {/* Drawer Info */}
          <div className="flex items-center justify-center gap-1 text-[10px] sm:text-xs text-slate-400 truncate max-w-full mt-0.5">
            <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
            <strong className="text-white truncate">{drawerName || 'Drawer'}</strong>
            <span className="hidden sm:inline">is drawing</span>
          </div>
        </div>
      );
    }

    // Standard Guesser view: masked blanks with spacing and letter hints
    return (
      <div className="flex flex-col items-center justify-center text-center gap-0.5 sm:gap-1 min-w-0 max-w-full">
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
            const isRevealed = char !== '_';
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
        <div className="flex items-center gap-1 text-[10px] sm:text-xs text-slate-400 truncate max-w-[160px] sm:max-w-none mt-0.5">
          <Pencil className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-amber-400 shrink-0" />
          <strong className="text-white truncate">{drawerName || 'Drawer'}</strong>
          <span className="hidden sm:inline">is drawing</span>
        </div>
      </div>
    );
  };

  const isComboMode = (word && word.includes('+')) || gameMode === 'combination';
  const isHiddenMode = hidden || gameMode === 'hidden';

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl px-2 sm:px-6 py-2 sm:py-3.5 flex flex-col gap-1.5 sm:gap-2.5 overflow-hidden">
      {/* 1. Top HUD Row on Mobile (< sm) */}
      <div className="flex sm:hidden items-center justify-between w-full shrink-0">
        {/* Left: Round Tracker */}
        <div className="flex items-center gap-1 bg-slate-800/70 border border-slate-700/70 px-2 py-1 rounded-xl shrink-0">
          <RotateCcw className="w-3 h-3 text-indigo-400 shrink-0" />
          <div className="text-[11px] font-semibold whitespace-nowrap">
            <span className="text-white font-bold">{Math.min(currentRound, totalRounds)}</span>
            <span className="text-slate-500">/{totalRounds}</span>
          </div>
        </div>

        {/* Center: Mode Badge */}
        {isComboMode ? (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
            <Layers className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            Combination
          </span>
        ) : isHiddenMode ? (
          <span className="text-[9px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full inline-flex items-center gap-1 shrink-0">
            <EyeOff className="w-2.5 h-2.5 text-amber-400 shrink-0" />
            Hidden Mode
          </span>
        ) : null}

        {/* Right: Audio Toggle, Timer & Leave Button */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={toggleMute}
            className="p-1.5 text-slate-400 hover:text-slate-200 bg-slate-800/60 border border-slate-700/70 rounded-xl transition-all cursor-pointer shrink-0"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-3.5 h-3.5 text-rose-400" />
            ) : (
              <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            )}
          </button>

          <div className={`flex items-center gap-1 px-2 py-1 rounded-xl border shadow-sm shrink-0 ${timerStyle.container}`}>
            <Clock className={`w-3 h-3 shrink-0 ${timerStyle.text}`} />
            <div className="flex items-baseline font-mono text-xs font-black">
              {timeLeft}
              <span className="text-[9px] font-bold uppercase opacity-80">s</span>
            </div>
          </div>

          {onLeaveGame && (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="p-1.5 text-slate-400 hover:text-rose-300 bg-slate-800/60 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 rounded-xl transition-all cursor-pointer shrink-0"
              title="Leave Room"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* 2. Top HUD Row on Desktop (sm and up) */}
      <div className="hidden sm:grid grid-cols-[1fr_auto_1fr] items-center gap-3 w-full shrink-0">
        {/* Left: Round Tracker & Room Info */}
        <div className="justify-self-start flex items-center justify-start gap-3 shrink-0 min-w-0">
          <div className="flex items-center gap-2 bg-slate-800/70 border border-slate-700/70 px-3 py-1.5 rounded-xl shrink-0">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
            <div className="text-xs font-semibold whitespace-nowrap">
              <span className="text-slate-400">Round </span>
              <span className="text-white font-bold">{Math.min(currentRound, totalRounds)}</span>
              <span className="text-slate-500">/{totalRounds}</span>
            </div>
          </div>

          {roomId && (
            <div className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-400 bg-slate-800/40 border border-slate-700/50 px-2.5 py-1.5 rounded-xl font-mono shrink-0">
              <span className="text-slate-500">Room:</span>
              <span className="text-slate-200 font-semibold">{roomId}</span>
            </div>
          )}
        </div>

        {/* Center: Mode Badge */}
        <div className="justify-self-center flex items-center justify-center min-w-0">
          {isComboMode ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
              <Layers className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Combination
            </span>
          ) : isHiddenMode ? (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-300 bg-amber-950/60 border border-amber-500/30 px-3 py-1 rounded-full inline-flex items-center gap-1.5 shadow-xs">
              <EyeOff className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              Hidden Mode
            </span>
          ) : null}
        </div>

        {/* Right: Audio Toggle, Timer & Exit */}
        <div className="justify-self-end flex items-center justify-end gap-2 shrink-0 min-w-0">
          <button
            type="button"
            onClick={toggleMute}
            className="p-2 text-slate-400 hover:text-slate-200 bg-slate-800/60 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-all cursor-pointer shrink-0"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400" />
            ) : (
              <Volume2 className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border shadow-sm transition-all duration-300 shrink-0 ${timerStyle.container}`}
          >
            <Clock className={`w-4 h-4 shrink-0 ${timerStyle.text}`} />
            <div className="flex items-baseline gap-0.5 font-mono">
              <span className="text-lg font-black tracking-tight">{timeLeft}</span>
              <span className="text-[10px] font-bold uppercase opacity-80">s</span>
            </div>
          </div>

          {onLeaveGame && (
            <button
              type="button"
              onClick={() => setShowLeaveConfirm(true)}
              className="p-2 text-slate-400 hover:text-rose-300 bg-slate-800/60 hover:bg-rose-950/40 border border-slate-700 hover:border-rose-500/40 rounded-xl transition-all cursor-pointer shrink-0"
              title="Leave Room"
            >
              <LogOut className="w-4 h-4 shrink-0" />
            </button>
          )}
        </div>
      </div>

      {/* 3. Center Words Arena (Full Width, Zero Collision with buttons) */}
      <div className="w-full flex flex-col items-center justify-center min-w-0 py-0.5">
        {renderWordDisplay()}
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
