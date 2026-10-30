import React, { useState } from 'react';
import {
  Sliders,
  Clock,
  RotateCcw,
  Users,
  FileText,
  Copy,
  Check,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Globe,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog';
import { CountrySelect } from './CountrySelect';
import { usePlayerStore } from '../store/playerStore';
import { useRoomStore } from '../store/roomStore';
import {
  ROUND_OPTIONS,
  DRAW_TIME_OPTIONS,
  MAX_PLAYERS_OPTIONS,
  type RoomSettings,
  type RoomInfo,
} from '../types/room';
import { createMultiplayerRoom } from '../lib/socket';

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEnterLobby?: (room: RoomInfo) => void;
}

export const CreateRoomModal: React.FC<CreateRoomModalProps> = ({
  isOpen,
  onClose,
  onEnterLobby,
}) => {
  const { language, username, avatar } = usePlayerStore();
  const { createRoom } = useRoomStore();

  // Settings State
  const [rounds, setRounds] = useState<number>(3);
  const [drawTime, setDrawTime] = useState<number>(80);
  const [maxPlayers, setMaxPlayers] = useState<number>(8);
  const [customWordsInput, setCustomWordsInput] = useState<string>('');
  const [onlyCustomWords, setOnlyCustomWords] = useState<boolean>(false);

  // Created Room State (Step 2)
  const [createdRoom, setCreatedRoom] = useState<RoomInfo | null>(null);
  const [hasCopied, setHasCopied] = useState(false);

  // Parse comma-separated custom words
  const parsedWords = customWordsInput
    .split(',')
    .map((w) => w.trim())
    .filter((w) => w.length > 0);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const settings: RoomSettings = {
      rounds,
      drawTime,
      maxPlayers,
      language,
      customWords: parsedWords,
      onlyCustomWords,
    };

    const effectiveUsername = username.trim() || usePlayerStore.getState().ensureUsername();

    const hostData = {
      username: effectiveUsername,
      avatar,
    };

    try {
      const res = await createMultiplayerRoom(settings, hostData);
      if (res && res.success && res.room) {
        useRoomStore.getState().syncRoomData(res.room, hostData.username);
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
        const roomInfo: RoomInfo = {
          id: res.roomId || res.room.id,
          inviteLink: `${baseUrl}/?room=${res.roomId || res.room.id}`,
          isHost: true,
          settings,
          createdAt: Date.now(),
        };
        setCreatedRoom(roomInfo);
      } else {
        const newRoom = createRoom(settings, hostData);
        setCreatedRoom(newRoom);
      }
    } catch {
      const newRoom = createRoom(settings, hostData);
      setCreatedRoom(newRoom);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyLink = async () => {
    if (!createdRoom) return;
    try {
      await navigator.clipboard.writeText(createdRoom.inviteLink);
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    } catch {
      // Fallback
      setHasCopied(true);
      setTimeout(() => setHasCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setCreatedRoom(null);
    setHasCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
        {!createdRoom ? (
          /* STEP 1: Room Settings Form */
          <div>
            <DialogHeader className="text-left mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <DialogTitle className="text-xl md:text-2xl font-bold font-heading">
                    Create Private Room
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-400 mt-0.5">
                    Customize game rules for your team and invite colleagues.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleCreate} className="space-y-5">
              {/* 1. Rounds Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <RotateCcw className="w-3.5 h-3.5 text-indigo-400" />
                  <span>Number of Rounds</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {ROUND_OPTIONS.map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRounds(r)}
                      className={`h-9 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        rounds === r
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 ring-2 ring-indigo-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {r} {r === 3 && <span className="text-[10px] font-normal opacity-80">(Default)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. Drawing Turn Time Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Draw Time (Seconds)</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {DRAW_TIME_OPTIONS.map((t) => (
                    <button
                      key={t.value}
                      type="button"
                      onClick={() => setDrawTime(t.value)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-medium text-center transition-all cursor-pointer ${
                        drawTime === t.value
                          ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20 ring-2 ring-amber-400/60'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Max Players Selection */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Max Players</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {MAX_PLAYERS_OPTIONS.map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setMaxPlayers(p)}
                      className={`h-9 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        maxPlayers === p
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400/50'
                          : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {p} Players {p === 8 && <span className="text-[10px] font-normal opacity-80">(Standard)</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Word Language / Country Dictionary */}
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-300 mb-2">
                  <Globe className="w-3.5 h-3.5 text-sky-400" />
                  <span>Word Dictionary Language</span>
                </label>
                <CountrySelect />
              </div>

              {/* 5. Custom Words Input (Skribbl style) */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Custom Words (Optional)</span>
                  </label>
                  {parsedWords.length > 0 && (
                    <span className="text-[11px] font-semibold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">
                      {parsedWords.length} words added
                    </span>
                  )}
                </div>

                <textarea
                  value={customWordsInput}
                  onChange={(e) => setCustomWordsInput(e.target.value)}
                  placeholder="e.g. coffee, standup, sprint, react, deployment, remote..."
                  rows={2}
                  className="w-full p-3 bg-slate-900/90 text-sm text-slate-100 placeholder-slate-500 rounded-xl border border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none font-mono"
                />

                <label className="flex items-center gap-2.5 cursor-pointer select-none text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={onlyCustomWords}
                    onChange={(e) => setOnlyCustomWords(e.target.checked)}
                    disabled={parsedWords.length === 0}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900 cursor-pointer disabled:opacity-40"
                  />
                  <span className={parsedWords.length === 0 ? 'text-slate-500' : 'text-slate-300'}>
                    Only use custom words (disables standard dictionary)
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-2xl bg-indigo-600/90 hover:bg-indigo-600 active:scale-[0.99] text-white font-heading font-semibold text-base flex items-center justify-center gap-2 border border-indigo-400/30 shadow-md shadow-indigo-600/20 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-indigo-300" />
                  <span>Generate Room & Invite Link</span>
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* STEP 2: Room Created & Shareable Link */
          <div className="py-2 text-center animate-in fade-in-0 zoom-in-95 duration-200">
            {/* Success icon badge */}
            <div className="w-14 h-14 rounded-3xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
              <Check className="w-7 h-7" />
            </div>

            <DialogTitle className="text-2xl font-bold font-heading text-white">
              Private Room Ready!
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Share the invitation link with your team members so they can join your lobby.
            </DialogDescription>

            {/* Room Code Badge */}
            <div className="mt-5 p-4 rounded-2xl bg-slate-800/60 border border-slate-700/80">
              <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mb-1">
                Room Code
              </div>
              <div className="font-mono text-3xl font-black text-amber-400 tracking-wider">
                {createdRoom.id}
              </div>
            </div>

            {/* Shareable Link Box */}
            <div className="mt-4 text-left">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Shareable Invitation Link
              </label>
              <div className="flex items-center gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800">
                <input
                  type="text"
                  readOnly
                  value={createdRoom.inviteLink}
                  className="w-full bg-transparent px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none select-all"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
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
            </div>

            {/* Settings Quick Recap */}
            <div className="mt-5 grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Rounds</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.rounds}</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Turn Time</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.drawTime}s</div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/40 border border-slate-800">
                <div className="text-slate-400 text-[10px]">Max Players</div>
                <div className="font-bold text-slate-200 mt-0.5">{createdRoom.settings.maxPlayers}</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex flex-col sm:flex-row items-center gap-2.5">
              <button
                type="button"
                onClick={() => setCreatedRoom(null)}
                className="w-full sm:w-auto px-4 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Reconfigure</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (onEnterLobby) {
                    onEnterLobby(createdRoom);
                  } else {
                    alert(`Entering waiting lobby for ${createdRoom.id} as host: ${username || 'Host'}! (Phase 3 Lobby Ready)`);
                    handleResetAndClose();
                  }
                }}
                className="w-full flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-heading font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <span>Enter Waiting Lobby</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
