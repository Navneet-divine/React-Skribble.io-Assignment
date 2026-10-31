import React, { useState } from 'react';
import {
  Volume2,
  VolumeX,
  Heart,
  Shield,
  FileText,
  Mail,
  Info,
  BookOpen,
  Pencil,
  MessageSquare,
  Clock,
  Sparkles,
  Users2,
  Trophy,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';

type ModalType = 'about' | 'rules' | 'privacy' | 'terms' | 'contact' | null;

const CURRENT_YEAR = new Date().getFullYear();

const GAME_RULES = [
  {
    number: '1',
    title: 'Take Your Turn Drawing',
    description:
      'Each player gets a turn to draw a secret word. Choose one of the available words and draw it on the canvas.',
    icon: Pencil,
    color: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
    borderColor: 'border-amber-500/20',
  },
  {
    number: '2',
    title: 'Guess the Word',
    description:
      'Other players must guess the drawing by typing their answers in the chat before the timer runs out.',
    icon: MessageSquare,
    color: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
    borderColor: 'border-indigo-500/20',
  },
  {
    number: '3',
    title: 'Watch the Timer',
    description:
      'Every drawing turn has a time limit. Submit your guesses as quickly as possible.',
    icon: Clock,
    color: 'text-rose-400',
    bgColor: 'bg-rose-500/10',
    borderColor: 'border-rose-500/20',
  },
  {
    number: '4',
    title: 'Earn Points',
    description:
      'Correct guesses earn points. Players who guess faster receive more points. The drawer can also earn points when others guess correctly.',
    icon: Sparkles,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
    borderColor: 'border-emerald-500/20',
  },
  {
    number: '5',
    title: 'Everyone Gets a Turn',
    description:
      'Each player gets an opportunity to draw during every round. Take part and have fun!',
    icon: Users2,
    color: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
    borderColor: 'border-sky-500/20',
  },
  {
    number: '6',
    title: 'Highest Score Wins',
    description:
      'After all rounds are completed, the player with the highest total score wins!',
    icon: Trophy,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
  },
];

import { useSoundStore } from '../store/soundStore';

export const Footer: React.FC = () => {
  const { isMuted, toggleMute } = useSoundStore();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <>
      <footer className="w-full mt-16 pb-12 border-t border-slate-800/80 pt-8 text-xs text-slate-400 bg-slate-950/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            {/* Brand Info & Audio Controls */}
            <div className="flex items-center gap-4">
              <button
                type="button"
                onClick={toggleMute}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 border border-slate-800 transition-colors cursor-pointer"
                title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : (
                  <Volume2 className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-xs font-medium">Audio {isMuted ? 'Off' : 'On'}</span>
              </button>

              <span className="text-slate-600 hidden md:inline">•</span>

              <div className="flex items-center gap-1.5 text-slate-400">
                <span>Made with</span>
                <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 inline" />
                <span>for remote teams</span>
              </div>
            </div>

            {/* Clean Navigation Links */}
            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-slate-400 font-medium">
              <button
                type="button"
                onClick={() => setActiveModal('about')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                About DoodleSync
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('rules')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                How to Play
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button
                type="button"
                onClick={() => setActiveModal('contact')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Contact
              </button>
            </nav>
          </div>

          {/* Copyright notice */}
          <div className="text-center md:text-left text-slate-500 text-[11px] mt-6">
            © {CURRENT_YEAR} DoodleSync. Built for interactive team building and social game nights.
          </div>
        </div>
      </footer>

      {/* shadcn Dialog Modal for Game Rules */}
      <Dialog open={activeModal === 'rules'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-2xl max-h-[88vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl md:text-2xl">
                  DoodleSync – Game Rules
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-400 mt-0.5">
                  Master the game flow, guessing tactics, and scoring system
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-2">
            {GAME_RULES.map((rule) => {
              const Icon = rule.icon;
              return (
                <div
                  key={rule.number}
                  className={`p-4 rounded-2xl bg-slate-800/40 border ${rule.borderColor} flex gap-3.5 items-start hover:bg-slate-800/60 transition-colors`}
                >
                  <div
                    className={`w-9 h-9 rounded-xl ${rule.bgColor} ${rule.color} flex items-center justify-center shrink-0 font-bold font-heading text-sm`}
                  >
                    {rule.number}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-100 font-heading">
                      <span>{rule.title}</span>
                      <Icon className={`w-3.5 h-3.5 ${rule.color}`} />
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {rule.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Got it, let&apos;s play!
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* shadcn Dialog Modal for About */}
      <Dialog open={activeModal === 'about'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5 text-indigo-400 mb-1">
              <Info className="w-5 h-5" />
              <DialogTitle className="text-xl">About DoodleSync</DialogTitle>
            </div>
            <DialogDescription>
              The collaborative drawing & guessing platform for distributed teams.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300 py-2 leading-relaxed">
            <p>
              DoodleSync is engineered specifically for remote teams, virtual team building, and social game sessions.
            </p>
            <p className="text-xs text-slate-400">
              No account creation or installations required. Pick your avatar, enter your name, and hop right into a game room!
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* shadcn Dialog Modal for Privacy */}
      <Dialog open={activeModal === 'privacy'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5 text-emerald-400 mb-1">
              <Shield className="w-5 h-5" />
              <DialogTitle className="text-xl">Privacy Policy</DialogTitle>
            </div>
            <DialogDescription>
              We treat player privacy with absolute transparency.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-sm text-slate-300 py-2">
            <p className="text-xs leading-relaxed text-slate-300">
              DoodleSync does not track your personal identity or sell data to advertisers.
            </p>
            <ul className="text-xs text-slate-400 space-y-2 list-disc list-inside">
              <li>Player username and avatar preferences are cached locally in browser storage.</li>
              <li>Real-time canvas strokes and chat messages exist solely in memory for the active room session.</li>
            </ul>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* shadcn Dialog Modal for Terms */}
      <Dialog open={activeModal === 'terms'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5 text-amber-400 mb-1">
              <FileText className="w-5 h-5" />
              <DialogTitle className="text-xl">Terms of Service</DialogTitle>
            </div>
            <DialogDescription>
              Guidelines for respectful multiplayer sessions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 text-xs text-slate-300 py-2 leading-relaxed">
            <p>
              By using DoodleSync, you agree to foster a positive, inclusive, and fun gaming environment.
            </p>
            <p className="text-slate-400">
              Inappropriate drawings, hate speech, or harassment violate our community terms and room hosts have full authority to remove disruptive players.
            </p>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* shadcn Dialog Modal for Contact */}
      <Dialog open={activeModal === 'contact'} onOpenChange={(open) => !open && closeModal()}>
        <DialogContent className="max-w-md">
          <DialogHeader className="text-left">
            <div className="flex items-center gap-2.5 text-sky-400 mb-1">
              <Mail className="w-5 h-5" />
              <DialogTitle className="text-xl">Contact Us</DialogTitle>
            </div>
            <DialogDescription>
              We’d love to hear your thoughts and suggestions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-xs text-slate-300 leading-relaxed">
              Have feedback, bug reports, or feature ideas for your company&apos;s team building? Get in touch with our team!
            </p>
            <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 flex items-center justify-between">
              <span>Direct Email:</span>
              <span className="font-mono text-indigo-400 font-semibold">team@doodlesync.io</span>
            </div>
          </div>
          <DialogFooter>
            <button
              type="button"
              onClick={closeModal}
              className="w-full sm:w-auto px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
