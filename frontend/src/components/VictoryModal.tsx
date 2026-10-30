import React, { useState } from 'react';
import { Trophy, Crown, Sparkles, Check, Copy, ArrowRight } from 'lucide-react';

interface VictoryModalProps {
  isOpen: boolean;
  winnerName: string;
  reason: string;
  isNewHost: boolean;
  roomId: string;
  onContinue: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({
  isOpen,
  winnerName,
  reason,
  isNewHost,
  roomId,
  onContinue,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyInvite = () => {
    const inviteLink = `${window.location.origin}/?room=${roomId}`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/70 overflow-hidden animate-in zoom-in-95 duration-200 text-center"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Golden Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-24 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Top Trophy & Crown Icon */}
        <div className="relative mx-auto mb-4 w-20 h-20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/25 via-yellow-500/20 to-amber-600/30 border border-amber-400/50 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-amber-400 animate-pulse" />
          </div>
          {isNewHost && (
            <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full border-2 border-slate-900 shadow-md">
              <Crown className="w-4 h-4 text-slate-950" />
            </div>
          )}
        </div>

        {/* Heading */}
        <div className="space-y-1 mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-heading">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Match Concluded</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-wide">
            🏆 Victory by Default!
          </h2>
          <p className="text-sm font-bold text-amber-400">
            {winnerName} is the winner!
          </p>
        </div>

        {/* Explanation Card */}
        <div className="bg-slate-800/60 border border-slate-700/60 rounded-2xl p-4 text-slate-300 text-xs sm:text-sm leading-relaxed mb-5 text-left space-y-2">
          <p className="font-medium text-slate-200">
            {reason}
          </p>
          {isNewHost && (
            <div className="flex items-start gap-2 pt-2 border-t border-slate-700/50 text-emerald-400 font-semibold text-xs">
              <Crown className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You have been promoted to Room Host for lobby <strong className="font-mono text-white">{roomId}</strong>!</span>
            </div>
          )}
          <p className="text-slate-400 text-xs pt-1">
            You've been safely returned to the lobby. Invite another player to start the next match whenever you're ready!
          </p>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={onContinue}
            autoFocus
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black font-heading tracking-wider shadow-lg shadow-emerald-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
          >
            <span>Return to Lobby</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={handleCopyInvite}
            type="button"
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Invite Link Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-indigo-400" />
                <span>Copy Invite Link ({roomId})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
