import React from 'react';
import { Crown, Pencil, CheckCircle2, Trophy } from 'lucide-react';
import { type GamePlayer } from '../types/game';
import { getAvatarUrl } from '../store/playerStore';

interface ScoreboardProps {
  players: GamePlayer[];
  currentUserId?: string;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({ players, currentUserId }) => {
  // Sort players by score descending
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);

  return (
    <aside className="w-full h-full flex flex-col bg-slate-900/85 backdrop-blur-md border border-slate-800/90 rounded-2xl shadow-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-slate-800/60 border-b border-slate-700/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-heading">
            Leaderboard
          </h2>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
          {players.length} {players.length === 1 ? 'Player' : 'Players'}
        </span>
      </div>

      {/* Players List */}
      <div className="flex-1 overflow-y-auto p-2.5 space-y-2 max-h-[220px] lg:max-h-[540px]">
        {sortedPlayers.map((player, index) => {
          const isFirst = index === 0 && player.score > 0;
          const isCurrentUser = player.id === currentUserId;

          return (
            <div
              key={player.id}
              className={`relative flex items-center justify-between gap-2.5 p-2.5 rounded-xl border transition-all ${
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
              <div className="flex items-center gap-2.5 min-w-0">
                {/* Rank Badge */}
                <div className="flex items-center justify-center w-5 text-xs font-bold">
                  {isFirst ? (
                    <Crown className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
                  ) : (
                    <span className="text-slate-500">#{index + 1}</span>
                  )}
                </div>

                {/* Avatar */}
                <div className="relative shrink-0">
                  <img
                    src={getAvatarUrl(player.avatar)}
                    alt={player.username}
                    className="w-8 h-8 rounded-full border border-slate-600/70 bg-slate-700 object-cover shadow-sm"
                  />
                  {player.isDrawing && (
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-indigo-600 rounded-full flex items-center justify-center text-[9px] text-white shadow-sm ring-1 ring-slate-900 animate-pulse">
                      <Pencil className="w-2.5 h-2.5" />
                    </span>
                  )}
                </div>

                {/* Username & Status Subtext */}
                <div className="min-w-0 flex flex-col">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-xs font-bold truncate max-w-[100px] sm:max-w-[120px] ${
                        isCurrentUser ? 'text-indigo-300' : 'text-slate-200'
                      }`}
                    >
                      {player.username}
                    </span>
                    {isCurrentUser && (
                      <span className="text-[9px] font-semibold text-indigo-400 bg-indigo-950/60 border border-indigo-500/30 px-1 rounded">
                        You
                      </span>
                    )}
                  </div>

                  {/* Status label */}
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
                </div>
              </div>

              {/* Score */}
              <div className="flex flex-col items-end shrink-0">
                <span className="text-xs font-black text-white font-mono tracking-tight">
                  {player.score.toLocaleString()}
                </span>
                <span className="text-[9px] font-medium text-slate-400 uppercase">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};
