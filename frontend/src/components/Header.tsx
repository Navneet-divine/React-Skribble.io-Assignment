import React from 'react';
import { Sparkles, Users } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="flex flex-col items-center justify-center text-center pt-8 pb-4">
      {/* Remote team badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-3.5 shadow-sm">
        <Users className="w-3.5 h-3.5 text-indigo-400" />
        <span>Team Building & Remote Socials</span>
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
      </div>

      {/* Custom Brand Logo */}
      <div className="flex items-center gap-3 select-none">
        <div className="relative group cursor-pointer">
          {/* Logo Icon Mark */}
          <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-amber-400 p-[2px] shadow-xl shadow-indigo-600/30 transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center overflow-hidden">
              <svg
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-8 h-8 md:w-9 md:h-9"
              >
                {/* Stylized sync doodle loop */}
                <path
                  d="M14 26C14 19.3726 19.3726 14 26 14C32.6274 14 38 19.3726 38 26C38 32.6274 32.6274 38 26 38C22.5 38 19.5 36.5 17.5 34"
                  stroke="url(#doodle-grad-1)"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Pencil / Stylus drawing tip */}
                <path
                  d="M31 11L37 17L21 33L15 34L16 28L31 11Z"
                  fill="url(#doodle-grad-2)"
                  stroke="#1E1B4B"
                  strokeWidth="1.5"
                  strokeLinejoin="round"
                />
                <circle cx="15.5" cy="33.5" r="1.5" fill="#F59E0B" />
                <defs>
                  <linearGradient id="doodle-grad-1" x1="14" y1="14" x2="38" y2="38" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#6366F1" />
                    <stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                  <linearGradient id="doodle-grad-2" x1="15" y1="11" x2="37" y2="33" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FBBF24" />
                    <stop offset="1" stopColor="#F59E0B" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Active online pulse dot */}
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-slate-950"></span>
          </span>
        </div>

        {/* Brand Name Typography */}
        <div className="text-left">
          <h1 className="text-4xl md:text-5xl font-black tracking-tight font-heading">
            <span className="text-white">Doodle</span>
            <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 bg-clip-text text-transparent">Sync</span>
          </h1>
        </div>
      </div>

      <p className="text-slate-400 text-sm md:text-base mt-2.5 max-w-md font-normal">
        Real-time collaborative drawing and guessing. Connect with colleagues, sketch ideas, and claim the leaderboard!
      </p>
    </header>
  );
};
