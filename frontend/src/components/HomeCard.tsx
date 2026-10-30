import React, { useState } from 'react';
import { Play, PlusCircle, User, AlertCircle, X, LogIn, Sparkles, Dices } from 'lucide-react';
import { usePlayerStore } from '../store/playerStore';
import { AvatarPicker } from './AvatarPicker';
import { CountrySelect } from './CountrySelect';

interface HomeCardProps {
  onPlayPublic?: () => void;
  onCreatePrivateRoom?: () => void;
  onOpenJoinRoom?: () => void;
}

export const HomeCard: React.FC<HomeCardProps> = ({
  onPlayPublic,
  onCreatePrivateRoom,
  onOpenJoinRoom,
}) => {
  const { username, setUsername, ensureUsername, randomizeUsername } = usePlayerStore();
  const [error, setError] = useState<string | null>(null);

  // Detect if user was invited via URL query e.g. /?room=DOODLE-45YC
  const [invitedRoomId] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });

  const validateAndProceed = (action: () => void) => {
    // If username is empty or too short, automatically generate a meaningful name just like Skribbl.io!
    let current = username.trim();
    if (!current || current.length < 2) {
      current = ensureUsername();
    }
    setError(null);
    action();
  };

  const handlePlay = (e: React.FormEvent) => {
    e.preventDefault();
    validateAndProceed(() => {
      if (onPlayPublic) {
        onPlayPublic();
      }
    });
  };

  const handleCreateRoom = () => {
    validateAndProceed(() => {
      if (onCreatePrivateRoom) {
        onCreatePrivateRoom();
      } else {
        alert(`Setting up private room for: ${username}! (Phase 2 will configure room options)`);
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto bg-slate-900/90 backdrop-blur-xl border border-slate-800 rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl shadow-indigo-950/40 relative">
      <form onSubmit={handlePlay} className="space-y-5">
        {/* Room Invitation Banner if shared link */}
        {invitedRoomId && (
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <div className="truncate">
              <span>Invited to private room: </span>
              <span className="font-mono font-bold text-white tracking-wider">{invitedRoomId}</span>
            </div>
          </div>
        )}

        {/* Username Input & Language Row */}
        <div className="space-y-3">
          <div className="relative">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="username-input"
              type="text"
              value={username}
              maxLength={20}
              placeholder="Enter your name (or auto-generate)..."
              onChange={(e) => {
                setUsername(e.target.value);
                if (error) setError(null);
              }}
              className="w-full pl-10 pr-16 py-3 bg-slate-800/90 text-white placeholder-slate-400 text-base font-medium rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all shadow-inner"
            />
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {username && (
                <button
                  type="button"
                  onClick={() => setUsername('')}
                  title="Clear name"
                  className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => randomizeUsername()}
                title="Randomize player name"
                className="p-1 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-700/60 transition-colors cursor-pointer"
              >
                <Dices className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-rose-400 text-xs px-1">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Country / Language Selector */}
          <div>
            <CountrySelect />
          </div>
        </div>

        {/* Avatar Customization Section */}
        <div className="py-2">
          <AvatarPicker />
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5 pt-2">
          {/* Public Play Button */}
          <button
            id="play-button"
            type="submit"
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.99] text-white font-heading font-bold text-lg flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
          >
            <Play className="w-5 h-5 fill-white" />
            <span>{invitedRoomId ? `Join ${invitedRoomId} & Play!` : 'Play!'}</span>
          </button>

          {/* Create Private Room Button */}
          <button
            id="create-room-button"
            type="button"
            onClick={handleCreateRoom}
            className="w-full py-3 px-6 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-[0.99] text-white font-heading font-semibold text-base flex items-center justify-center gap-2 border border-indigo-400/30 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Create Private Room</span>
          </button>

          {/* Join with Room Code */}
          {onOpenJoinRoom && (
            <button
              id="join-code-button"
              type="button"
              onClick={onOpenJoinRoom}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-700/60 transition-colors cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-indigo-400" />
              <span>Join with Room Code</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
};
