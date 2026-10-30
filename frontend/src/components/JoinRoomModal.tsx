import React, { useState } from 'react';
import { LogIn, KeyRound, AlertCircle, ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { usePlayerStore } from '../store/playerStore';
import { useRoomStore } from '../store/roomStore';

interface JoinRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (roomId: string) => void;
}

export const JoinRoomModal: React.FC<JoinRoomModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { username, avatar } = usePlayerStore();
  const { joinRoom } = useRoomStore();

  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    let cleaned = roomCode.trim().toUpperCase();

    if (!cleaned) {
      setError('Please enter a room code');
      return;
    }

    // Auto-prefix with DOODLE- if user only typed 4 chars (e.g. "7K9A")
    if (!cleaned.startsWith('DOODLE-') && cleaned.length === 4) {
      cleaned = `DOODLE-${cleaned}`;
    }

    if (!cleaned.startsWith('DOODLE-') || cleaned.length < 9) {
      setError('Invalid code format. Example: DOODLE-7K9A');
      return;
    }

    if (!username.trim()) {
      setError('Please set a username on the homepage before joining.');
      return;
    }

    setError(null);
    joinRoom(cleaned, { username: username.trim(), avatar }, false);
    onSuccess(cleaned);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader className="text-left">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <LogIn className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold font-heading">
                Join a Room
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-400 mt-0.5">
                Enter your team&apos;s invitation code to jump in.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleJoin} className="space-y-4 my-2">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
              Room Code
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                <KeyRound className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => {
                  setRoomCode(e.target.value);
                  if (error) setError(null);
                }}
                maxLength={15}
                placeholder="e.g. DOODLE-7K9A or 7K9A"
                className="w-full pl-10 pr-4 py-3 bg-slate-800/90 text-white placeholder-slate-500 font-mono text-base uppercase font-bold rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all tracking-wider"
              />
            </div>

            {error && (
              <div className="flex items-center gap-1.5 text-rose-400 text-xs mt-2 px-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-heading font-semibold text-base flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
            >
              <span>Join Lobby</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
