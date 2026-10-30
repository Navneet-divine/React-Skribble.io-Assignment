import React from 'react';
import { ShieldAlert, AlertTriangle, X, PenTool } from 'lucide-react';

interface SpoilerWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  message?: string;
}

export const SpoilerWarningModal: React.FC<SpoilerWarningModalProps> = ({
  isOpen,
  onClose,
  message = "You are the drawer! You cannot spoil the secret word in chat.",
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/40 rounded-3xl p-6 sm:p-7 shadow-2xl shadow-amber-950/60 overflow-hidden animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-20 bg-amber-500/15 blur-2xl pointer-events-none rounded-full" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center text-center space-y-4 pt-2">
          {/* Glowing Warning Badge */}
          <div className="relative">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500/20 to-rose-500/20 border border-amber-500/40 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <ShieldAlert className="w-8 h-8 text-amber-400" />
            </div>
            <div className="absolute -bottom-1 -right-1 p-1 bg-rose-500 rounded-full border-2 border-slate-900">
              <AlertTriangle className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Heading */}
          <div className="space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-bold uppercase tracking-widest font-heading">
              Drawing Rules
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading tracking-wide">
              No Spoilers Allowed! 🤫
            </h2>
          </div>

          {/* Body Text */}
          <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-slate-200 text-sm leading-relaxed">
            <p className="font-semibold text-amber-300 mb-1.5">
              {message}
            </p>
            <p className="text-xs text-slate-400">
              As the drawer, use your canvas to sketch clever visual clues for your teammates. Typing the word or hints in chat ruins the fun!
            </p>
          </div>

          {/* Action Button */}
          <button
            onClick={onClose}
            autoFocus
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-heading tracking-wider shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <PenTool className="w-4 h-4" />
            <span>Got it, I'll draw instead!</span>
          </button>
        </div>
      </div>
    </div>
  );
};
