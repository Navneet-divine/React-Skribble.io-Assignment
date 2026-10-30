import React from 'react';
import { Lock, Zap, Trophy, Globe2 } from 'lucide-react';

const FEATURES = [
  {
    icon: Lock,
    title: 'Private Rooms',
    description: 'Create rooms and invite your teammates.',
    color: 'from-indigo-500 to-indigo-600',
    iconColor: 'text-indigo-400',
    bgColor: 'bg-indigo-500/10',
  },
  {
    icon: Zap,
    title: 'Real-time Fun',
    description: 'Draw, chat and guess together live.',
    color: 'from-amber-500 to-amber-600',
    iconColor: 'text-amber-400',
    bgColor: 'bg-amber-500/10',
  },
  {
    icon: Trophy,
    title: 'Leaderboards',
    description: 'Compete with friends and teammates.',
    color: 'from-emerald-500 to-emerald-600',
    iconColor: 'text-emerald-400',
    bgColor: 'bg-emerald-500/10',
  },
  {
    icon: Globe2,
    title: 'Play Anywhere',
    description: 'Enjoy game nights with remote teams.',
    color: 'from-sky-500 to-sky-600',
    iconColor: 'text-sky-400',
    bgColor: 'bg-sky-500/10',
  },
];

export const Features: React.FC = () => {
  return (
    <section className="w-full max-w-5xl mx-auto mt-16 mb-8 px-4 sm:px-6">
      {/* Section Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
          Features
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-2 font-heading tracking-tight">
          Made for Playing Together
        </h2>
        <p className="text-slate-400 text-sm mt-1 max-w-md mx-auto">
          Everything your distributed team needs for an unforgettable virtual social.
        </p>
      </div>

      {/* 4 Feature Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={idx}
              className="group p-5 rounded-2xl bg-slate-900/60 backdrop-blur-md border border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 transition-all duration-200 flex flex-col items-start"
            >
              <div
                className={`w-10 h-10 rounded-xl ${feature.bgColor} ${feature.iconColor} flex items-center justify-center mb-4 transition-transform group-hover:scale-110`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-100 font-heading mb-1.5">
                {feature.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
