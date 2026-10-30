import React from 'react';
import { Pencil, MessageSquareText, Trophy, HelpCircle } from 'lucide-react';

export const HowToPlay: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-8 px-4">
      <div className="bg-slate-900/60 backdrop-blur-md border border-slate-800/80 rounded-3xl p-6 md:p-8 shadow-xl">
        <div className="flex items-center gap-2.5 mb-6 text-slate-200 font-heading font-bold text-base md:text-lg">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <HelpCircle className="w-4 h-4" />
          </div>
          <span>How to Play DoodleSync</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 text-left">
          {/* Step 1 */}
          <div className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-amber-500/30 hover:bg-slate-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 font-heading">1. Draw</div>
              <div className="text-xs text-slate-400 leading-relaxed mt-1">
                When it’s your turn, choose a secret word and sketch it live on the canvas for everyone to see.
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-indigo-500/30 hover:bg-slate-800/60 transition-all group">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <MessageSquareText className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 font-heading">2. Guess</div>
              <div className="text-xs text-slate-400 leading-relaxed mt-1">
                Watch the drawing unfold and type your guesses into the chat before the countdown timer expires.
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col gap-3 p-4 md:p-5 rounded-2xl bg-slate-800/40 border border-slate-700/40 hover:border-emerald-500/30 hover:bg-slate-800/60 transition-all group sm:col-span-2 md:col-span-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 transition-transform group-hover:scale-110">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-slate-100 font-heading">3. Win</div>
              <div className="text-xs text-slate-400 leading-relaxed mt-1">
                The faster you guess correctly, the more points you earn. Climb the podium and win the round!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
