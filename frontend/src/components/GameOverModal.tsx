import React, { useEffect, useState } from 'react';
import { Trophy, Sparkles, Crown, ArrowRight, PartyPopper, Medal } from 'lucide-react';
import { type GamePlayer } from '../types/game';
import { getAvatarUrl } from '../store/playerStore';

interface GameOverModalProps {
  isOpen: boolean;
  players: GamePlayer[];
  onReturnToLobby: () => void;
  autoRedirectSeconds?: number;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  isOpen,
  players,
  onReturnToLobby,
  autoRedirectSeconds = 6,
}) => {
  const [countdown, setCountdown] = useState(autoRedirectSeconds);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(autoRedirectSeconds);
      return;
    }

    setCountdown(autoRedirectSeconds);
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onReturnToLobby();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, autoRedirectSeconds, onReturnToLobby]);

  if (!isOpen) return null;

  const sortedPlayers = [...players].sort((a, b) => (b.score || 0) - (a.score || 0));
  const topScore = sortedPlayers[0]?.score || 0;
  const winners = sortedPlayers.filter((p) => (p.score || 0) === topScore);
  const isMultipleWinners = winners.length > 1;
  const isAllWinners = isMultipleWinners && winners.length === sortedPlayers.length;

  let title = '';
  let subtitle = '';

  if (!isMultipleWinners) {
    title = `👑 ${sortedPlayers[0]?.username || 'Player'} Wins!`;
    subtitle = `Congratulations to ${sortedPlayers[0]?.username || 'the winner'} for scoring ${topScore} points!`;
  } else if (isAllWinners) {
    if (sortedPlayers.length === 2) {
      title = '👑 Both Are Winners!';
      subtitle = topScore === 0
        ? 'Great game! Both players finished with equal scores — both are winners!'
        : `Incredible game! Both players share 1st place with ${topScore} points!`;
    } else {
      title = '🎉 Everyone is a Winner!';
      subtitle = topScore === 0
        ? 'Fantastic match! All players finished with equal scores — everyone is a winner!'
        : `Outstanding match! Everyone finished with ${topScore} points — everyone is a winner!`;
    }
  } else {
    if (winners.length === 2) {
      title = '👑 Both Players Are Winners!';
      subtitle = `Congratulations to ${winners[0]?.username} and ${winners[1]?.username} for sharing 1st place with ${topScore} points!`;
    } else {
      title = '👑 Multiple Winners!';
      subtitle = `Congratulations to all 1st place winners with ${topScore} points!`;
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border border-amber-500/50 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-amber-950/70 overflow-hidden text-center animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-72 h-28 bg-amber-500/20 blur-3xl pointer-events-none rounded-full" />

        {/* Top Celebration Icon */}
        <div className="relative mx-auto mb-3 w-20 h-20 flex items-center justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/30 via-yellow-500/20 to-amber-600/30 border border-amber-400/50 flex items-center justify-center shadow-xl shadow-amber-500/30">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>
          <div className="absolute -top-2 -right-2 p-1.5 bg-gradient-to-tr from-amber-400 to-yellow-300 rounded-full border-2 border-slate-900 shadow-md">
            <PartyPopper className="w-4 h-4 text-slate-950" />
          </div>
        </div>

        {/* Heading & Subtitle */}
        <div className="space-y-1.5 mb-5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider font-heading">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Match Complete</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-wide">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            {subtitle}
          </p>
        </div>

        {/* Player Ranked Cards */}
        <div className="space-y-2 mb-6 max-h-[220px] overflow-y-auto pr-1">
          {sortedPlayers.map((player, idx) => {
            const isWinner = (player.score || 0) === topScore;
            const isSecond = !isWinner && (player.score || 0) === (sortedPlayers.find(p => (p.score || 0) < topScore)?.score ?? -1);
            const isThird = !isWinner && !isSecond && idx === 2;

            return (
              <div
                key={player.id || idx}
                className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                  isWinner
                    ? 'bg-amber-500/15 border-amber-500/40 shadow-sm shadow-amber-500/10'
                    : 'bg-slate-800/60 border-slate-700/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={getAvatarUrl(player.avatar)}
                      alt={player.username}
                      className={`w-10 h-10 rounded-full border bg-slate-800 object-cover ${
                        isWinner ? 'border-amber-400' : 'border-slate-700'
                      }`}
                    />
                    {isWinner && (
                      <span className="absolute -top-1 -right-1 p-0.5 bg-amber-400 rounded-full text-slate-950 shadow-sm">
                        <Crown className="w-3 h-3" />
                      </span>
                    )}
                  </div>

                  <div className="text-left truncate">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-white truncate font-heading">
                        {player.username}
                      </span>
                      {isWinner ? (
                        <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-500/40">
                          👑 Winner
                        </span>
                      ) : isSecond ? (
                        <span className="text-[10px] font-semibold text-slate-300 bg-slate-700/60 px-1.5 py-0.5 rounded border border-slate-600">
                          🥈 2nd Place
                        </span>
                      ) : isThird ? (
                        <span className="text-[10px] font-semibold text-amber-500 bg-amber-950/40 px-1.5 py-0.5 rounded border border-amber-800/60">
                          🥉 3rd Place
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                          #{idx + 1}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {isWinner ? 'Winner' : isSecond ? 'Runner Up' : `Rank #${idx + 1}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 pl-2">
                  <Medal className={`w-4 h-4 ${isWinner ? 'text-amber-400' : 'text-slate-400'}`} />
                  <span className={`text-base font-black font-mono ${isWinner ? 'text-amber-300' : 'text-slate-200'}`}>
                    {player.score ?? 0}
                  </span>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">pts</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Button & Countdown Notice */}
        <div className="space-y-2.5">
          <button
            onClick={onReturnToLobby}
            autoFocus
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black font-heading tracking-wider shadow-lg shadow-amber-500/25 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Return to Lobby Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <p className="text-xs text-slate-400 font-medium">
            Redirecting both players to lobby in <span className="font-mono text-amber-400 font-bold">{countdown}s</span>...
          </p>
        </div>
      </div>
    </div>
  );
};
