import React, { useState } from 'react';
import {
  Copy,
  Check,
  Crown,
  Users,
  Play,
  LogOut,
  Clock,
  RotateCcw,
  Globe,
  Sparkles,
  UserX,
  FileText,
} from 'lucide-react';
import { useRoomStore } from '../store/roomStore';
import { usePlayerStore, getAvatarUrl } from '../store/playerStore';
import { socket, startMultiplayerGame, leaveMultiplayerRoom } from '../lib/socket';

interface WaitingLobbyProps {
  onStartGame?: () => void;
  onLeaveLobby?: () => void;
}

export const WaitingLobby: React.FC<WaitingLobbyProps> = ({
  onStartGame,
  onLeaveLobby,
}) => {
  const { currentRoom, isHost, players, kickPlayer, leaveRoom, syncRoomData } = useRoomStore();
  const { username } = usePlayerStore();
  const [hasCopied, setHasCopied] = useState(false);

  // Sync real-time updates from server (player joins, quits, game start)
  React.useEffect(() => {
    const handleRoomData = (data: any) => {
      syncRoomData(data, username);
      if (data.status === 'choosing' || data.status === 'drawing') {
        onStartGame?.();
      }
    };

    socket.on('room:data', handleRoomData);
    return () => {
      socket.off('room:data', handleRoomData);
    };
  }, [syncRoomData, username, onStartGame]);

  const canStartGame = players.length >= 2;

  const handleStart = () => {
    if (!canStartGame) return;
    startMultiplayerGame();
    if (onStartGame) onStartGame();
  };

  if (!currentRoom) {
    return (
      <div className="w-full max-w-md mx-auto my-12 text-center p-8 bg-slate-900 border border-slate-800 rounded-3xl">
        <p className="text-slate-400 mb-4">No active room found.</p>
        <button
          type="button"
          onClick={onLeaveLobby}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold cursor-pointer"
        >
          Return to Homepage
        </button>
      </div>
    );
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentRoom.inviteLink);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleLeave = () => {
    leaveMultiplayerRoom();
    leaveRoom();
    if (onLeaveLobby) onLeaveLobby();
  };

  const hostPlayer = players.find((p) => p.isHost) || players[0];
  const maxPlayers = currentRoom.settings.maxPlayers;
  const remainingSlots = Math.max(0, maxPlayers - players.length);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      {/* Lobby Navigation Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-3xl bg-slate-900/80 backdrop-blur-md border border-slate-800 shadow-xl mb-6">
        {/* Room Code Badge */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              Private Room
            </div>
            <div className="font-mono text-xl md:text-2xl font-black text-amber-400 tracking-wider">
              {currentRoom.id}
            </div>
          </div>
        </div>

        {/* Quick Settings Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
            <span>{currentRoom.settings.rounds} Rounds</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{currentRoom.settings.drawTime}s Draw</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
            <Globe className="w-3.5 h-3.5 text-sky-400" />
            <span className="uppercase">{currentRoom.settings.language}</span>
          </span>
        </div>

        {/* Leave Room Button */}
        <button
          type="button"
          onClick={handleLeave}
          className="w-full sm:w-auto px-3.5 py-2 rounded-xl bg-slate-800/80 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-700/60 hover:border-rose-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Leave Room</span>
        </button>
      </div>

      {/* Main Grid: Players on Left, Room Actions & Invite on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 spans): Connected Players */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              <h2 className="text-base font-bold font-heading text-white">
                Players in Lobby ({players.length} / {maxPlayers})
              </h2>
            </div>
          </div>

          {/* Players Roster Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {players.map((player) => {
              const isCurrentUser = player.username === username;
              return (
                <div
                  key={player.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                    player.isHost
                      ? 'bg-gradient-to-r from-amber-500/10 via-slate-900 to-slate-900 border-amber-500/40 shadow-sm'
                      : isCurrentUser
                      ? 'bg-indigo-500/10 border-indigo-500/40'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Avatar circle */}
                    <div
                      className="w-12 h-12 rounded-2xl p-1 shrink-0 border border-slate-700/60 overflow-hidden flex items-center justify-center shadow-md"
                      style={{ backgroundColor: `#${player.avatar.backgroundColor}` }}
                    >
                      <img
                        src={getAvatarUrl(player.avatar)}
                        alt={player.username}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Name & Badges */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-slate-100 truncate">
                          {player.username}
                        </span>
                        {isCurrentUser && (
                          <span className="text-[10px] font-semibold text-indigo-300 bg-indigo-500/20 px-1.5 py-0.2 rounded-md">
                            You
                          </span>
                        )}
                      </div>

                      {player.isHost ? (
                        <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400 mt-0.5">
                          <Crown className="w-3 h-3 fill-amber-400" />
                          <span>Room Host</span>
                        </div>
                      ) : (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span>Ready</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Host Authority: Kick player option */}
                  {isHost && !player.isHost && (
                    <button
                      type="button"
                      onClick={() => kickPlayer(player.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Kick player"
                    >
                      <UserX className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}

            {/* Empty slots placeholders */}
            {Array.from({ length: Math.min(2, remainingSlots) }).map((_, i) => (
              <div
                key={`empty-${i}`}
                className="p-3.5 rounded-2xl border border-dashed border-slate-800 flex items-center gap-3 opacity-50"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800/40 border border-slate-800 flex items-center justify-center text-slate-500 text-xs">
                  +
                </div>
                <div className="text-xs text-slate-500 font-medium">
                  Waiting for teammate to join...
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 span): Game Control & Share Card */}
        <div className="space-y-4">
          {/* Main Action Box */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <h3 className="text-sm font-bold font-heading uppercase tracking-wider text-slate-300">
              Lobby Controls
            </h3>

            {isHost ? (
              /* Host Controls: Start Game */
              <div className="space-y-3">
                <button
                  type="button"
                  disabled={!canStartGame}
                  onClick={handleStart}
                  className={`w-full py-4 px-6 rounded-2xl font-heading font-bold text-base sm:text-lg flex items-center justify-center gap-2 transition-all ${
                    canStartGame
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-white shadow-xl shadow-emerald-500/25 cursor-pointer'
                      : 'bg-slate-800 text-slate-500 border border-slate-700/60 cursor-not-allowed opacity-80'
                  }`}
                >
                  <Play className={`w-5 h-5 ${canStartGame ? 'fill-white' : 'fill-slate-500'}`} />
                  <span>{canStartGame ? `Start Game (${players.length} Players)` : 'Need 2+ Players to Start'}</span>
                </button>

                {!canStartGame ? (
                  <p className="text-[11px] text-amber-300 text-center font-medium leading-relaxed bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-xl">
                    ⚠️ At least 2 players are required to start (1 drawer & 1 guesser). Copy the invite link below and send it to your teammate!
                  </p>
                ) : (
                  <p className="text-[11px] text-emerald-400/90 text-center leading-relaxed font-medium">
                    ✓ Ready to launch! Click Start Game to begin Round 1.
                  </p>
                )}
              </div>
            ) : (
              /* Non-Host View: Waiting status */
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center space-y-3">
                <div className="flex items-center justify-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                  <span className="text-xs font-semibold text-amber-300">
                    Waiting for Host to start...
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  The host (<strong className="text-slate-200">{hostPlayer?.username}</strong>) will launch the first drawing round shortly!
                </p>
              </div>
            )}

            {/* Quick Share Link Widget */}
            <div className="pt-2 border-t border-slate-800/80">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Invite Teammates Link
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={currentRoom.inviteLink}
                  className="w-full bg-transparent px-2 text-xs text-slate-400 font-mono truncate focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shrink-0 ${
                    hasCopied
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm'
                  }`}
                >
                  {hasCopied ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1.5">
                Paste into Slack, Microsoft Teams, or Zoom chat.
              </p>
            </div>
          </div>

          {/* Custom Words Box (if host provided custom words) */}
          {currentRoom.settings.customWords && currentRoom.settings.customWords.length > 0 && (
            <div className="p-4 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Custom Word Bank</span>
                </span>
                <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20">
                  {currentRoom.settings.customWords.length} words
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {currentRoom.settings.customWords.map((word, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-300 border border-slate-700/60"
                  >
                    {word}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
