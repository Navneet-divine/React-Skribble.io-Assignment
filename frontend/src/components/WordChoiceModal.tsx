import React, { useState, useEffect } from 'react';
import { type WordChoice } from '../types/game';
import { Sparkles, Clock, Check } from 'lucide-react';

interface WordChoiceModalProps {
  isOpen: boolean;
  words: WordChoice[];
  onSelectWord: (word: string) => void;
  selectionDuration?: number; // default: 15 seconds
}

export const WordChoiceModal: React.FC<WordChoiceModalProps> = ({
  isOpen,
  words,
  onSelectWord,
  selectionDuration = 15,
}) => {
  const [timeLeft, setTimeLeft] = useState(selectionDuration);

  // Countdown timer for 15s selection
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Auto-select first word when timer runs out
          if (words.length > 0) {
            onSelectWord(words[0].word);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(interval);
      setTimeLeft(selectionDuration);
    };
  }, [isOpen, selectionDuration, words, onSelectWord]);

  if (!isOpen) return null;

  const progressPercent = (timeLeft / selectionDuration) * 100;

  const getDifficultyBadge = (diff: 'easy' | 'medium' | 'hard') => {
    switch (diff) {
      case 'easy':
        return (
          <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-full uppercase">
            Easy
          </span>
        );
      case 'medium':
        return (
          <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2 py-0.5 rounded-full uppercase">
            Medium
          </span>
        );
      case 'hard':
        return (
          <span className="text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/30 px-2 py-0.5 rounded-full uppercase">
            Hard
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-slate-900 border border-indigo-500/30 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center">
        {/* Glow backdrop */}
        <div className="pointer-events-none absolute -top-20 left-1/2 -translate-x-1/2 w-48 h-48 bg-indigo-500/20 blur-[80px] rounded-full" />

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-black text-white font-heading tracking-wide">
            Choose a Word to Draw!
          </h2>
        </div>
        <p className="text-xs text-slate-400 mb-5">
          Pick one of the 3 choices before the timer runs out.
        </p>

        {/* Timer Bar */}
        <div className="w-full mb-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-1.5 px-1">
            <span className="text-slate-400 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-amber-400" /> Auto-picking in
            </span>
            <span className="font-mono font-bold text-amber-400">{timeLeft}s</span>
          </div>
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-1000 ease-linear rounded-full"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* 3 Word Cards */}
        <div className="w-full grid grid-cols-1 gap-3">
          {words.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectWord(item.word)}
              className="group relative flex items-center justify-between p-4 bg-slate-800/70 hover:bg-indigo-950/40 border border-slate-700/80 hover:border-indigo-500/60 rounded-2xl shadow-sm hover:shadow-indigo-950/40 transition-all duration-200 cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-lg font-black tracking-wider text-white uppercase group-hover:text-indigo-200 transition-colors font-heading">
                  {item.word}
                </span>
                <span className="text-xs text-slate-400">
                  {item.word.length} letters
                </span>
              </div>

              <div className="flex items-center gap-2">
                {getDifficultyBadge(item.difficulty)}
                <div className="w-7 h-7 rounded-full bg-slate-700/60 group-hover:bg-indigo-600 flex items-center justify-center text-slate-400 group-hover:text-white transition-all shadow-sm">
                  <Check className="w-3.5 h-3.5" />
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
