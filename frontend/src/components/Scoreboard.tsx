import React from 'react';
import { Crown, Pencil, CheckCircle2, Trophy } from 'lucide-react';
import { type GamePlayer } from '../types/game';
import { getAvatarUrl } from '../store/playerStore';

interface ScoreboardProps {
  players: GamePlayer[];
  currentUserId?: string;
  compact?: boolean;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentUserId, compact = false }) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-full h-full flex flex-col min-h-0 bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className={`${compact ? 'px-2.5 py-1.5' : 'px-4 py-3'} bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between shrink-0`}>
        <div className="flex items-center gap-1.5">
          <Trophy className={`${compact ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400`} />
          <h2 className={`${compact ? 'text-[11px]' : 'text-xs'} font-bold uppercase tracking-wider text-slate-300 font-heading`}>
            {compact ? 'Scores' : 'Leaderboard'}
          </h2>
        </div>
        <span className={`${compact ? 'text-[10px] px-1.5 py-0.2' : 'text-[11px] px-2 py-0.5'} font-semibold text-slate-400 bg-slate-800 rounded-full border border-slate-700`}>
          {compact ? `${players.length}P` : `${players.length} ${players.length === 1 ? 'Player' : 'Players'}`}
        </span>
      </div>

      {/* Players List */}
      <div className={`flex-1 min-h-0 overflow-y-auto ${compact ? 'p-1.5 space-y-1' : 'p-2.5 space-y-2'} max-h-[220px] lg:max-h-[540px]`}>
        {sortedPlayers.map((player, index) => {
          const isFirst = index === 0 && player.score > 0;
          const isCurrentUser = player.id === currentUserId;

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between ${
                compact ? 'gap-1.5 p-1.5 rounded-lg' : 'gap-2.5 p-2.5 rounded-xl'
              } border transition-all ${
                player.hasGuessed
                  ? 'bg-emerald-950/25 border-emerald-500/40'
                  : player.isDrawing
                  ? 'bg-indigo-950/30 border-indigo-500/50 shadow-indigo-950/50'
                  : isCurrentUser
                  ? 'bg-slate-800/80 border-indigo-400/30'
                  : 'bg-slate-800/40 border-slate-700/40 hover:bg-slate-800/60'
              }`}
            >
              {/* Rank & Avatar */}
              <div className="flex items-center gap-1.5 min-w-0">
                {/* Rank Badge */}
                <div className={`flex items-center justify-center ${compact ? 'w-3.5 text-[10px]' : 'w-5 text-xs'} font-bold`}>
                  {isFirst ? (
                    <Crown className={`${compact ? 'w-3 h-3' : 'w-4 h-4'} text-amber-400 shrink-0`} />
                  ) : (
                    <span className="text-slate-500">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={getAvatarUrl(player.avatar)}
                    alt={player.username}
                    className={`${compact ? 'w-5 h-5' : 'w-8 h-8'} rounded-full border border-slate-600/70 bg-slate-700 object-cover shadow-sm`}
                  />
                  {player.isDrawing && (
                    <span className={`absolute -bottom-1 -right-1 ${compact ? 'w-3 h-3 text-[7px]' : 'w-4 h-4 text-[9px]'} bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-sm ring-1 ring-slate-900 animate-pulse`}>
                      <Pencil className={compact ? 'w-2 h-2' : 'w-2.5 h-2.5'} />
                    </span>
                  )}
                </div>

                {/* Username & Status Subtext */}
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-1">
                    <span
                      className={`${compact ? 'text-[11px] max-w-[65px] xs:max-w-[85px] sm:max-w-[110px]' : 'text-xs max-w-[100px] sm:max-w-[120px]'} font-bold truncate ${
                        isCurrentUser ? 'text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      {player.username}
                    </span>
                    {isCurrentUser && !compact && (
                      <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1 rounded">
                        You
                      </span>
                    )}
                  </div>

                  {/* Status label (Full on desktop, micro badge on compact) */}
                  {!compact ? (
                    <div className="flex items-center gap-1 text-[10px]">
                      {player.isDrawing ? (
                        <span className="text-amber-400 font-semibold flex items-center gap-1">
                          Drawing...
                        </span>
                      ) : player.hasGuessed ? (
                        <span className="text-emerald-400 font-semibold flex items-center gap-0.5">
                          <CheckCircle2 className="w-2.5 h-2.5" /> Guessed
                        </span>
                      ) : (
                        <span className="text-slate-500">Guessing</span>
                      )}
                    </div>
                  ) : player.hasGuessed ? (
                    <span className="text-emerald-400 text-[9px] font-bold flex items-center gap-0.5">
                      <CheckCircle2 className="w-2 h-2" /> Done
                    </span>
                  ) : null}
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col items-end shrink-0">
                <span className={`${compact ? 'text-[11px]' : 'text-xs'} font-black text-white font-mono tracking-tight`}>
                  {player.score.toLocaleString()}
                </span>
                {!compact && <span className="text-[9px] font-medium text-slate-400 uppercase">pts</span>}
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
