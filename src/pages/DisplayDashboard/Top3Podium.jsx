import React from 'react';
import { Crown, Medal, Trophy, Sparkles } from 'lucide-react';

export const Top3Podium = ({ top3 = [] }) => {
  const first = top3[0] || null;
  const second = top3[1] || null;
  const third = top3[2] || null;

  return (
    <div className="w-full flex items-end justify-center gap-3 sm:gap-6 pt-10 pb-6 px-2 sm:px-4 max-w-4xl mx-auto min-h-[380px]">
      {/* 2nd Place (Left) */}
      <div className="flex-1 flex flex-col items-center transition-all duration-700 ease-out order-1">
        {second ? (
          <div className="w-full flex flex-col items-center animate-pop">
            {/* Mascot Avatar */}
            <div className="relative mb-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-slate-300/60 transition-transform duration-500 hover:scale-110"
                style={{
                  backgroundColor: second.color || '#94a3b8',
                  boxShadow: '0 0 20px rgba(148, 163, 184, 0.4)'
                }}
              >
                {second.mascot || '🥈'}
              </div>
            </div>

            {/* Name & Points */}
            <div className="text-center mb-3">
              <div className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[120px] sm:max-w-[160px]">
                {second.name}
              </div>
              <div className="text-xl sm:text-2xl font-black text-slate-300 font-mono tracking-tight">
                {second.score.toLocaleString()} <span className="text-xs font-medium text-slate-400">pts</span>
              </div>
            </div>

            {/* Podium Pillar */}
            <div className="w-full bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700/90 rounded-t-2xl border-t-2 border-x-2 border-slate-400/50 p-4 flex flex-col items-center justify-center shadow-xl h-44 sm:h-52 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-400/10 via-transparent to-transparent"></div>
              <Medal className="w-10 h-10 sm:w-12 sm:h-12 text-slate-300 mb-1 drop-shadow" />
              <div className="text-2xl sm:text-3xl font-black text-slate-200 font-mono">2</div>
              <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">อันดับ 2</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center opacity-40">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600 text-sm">
              ว่าง
            </div>
            <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-36 flex items-center justify-center text-slate-600 text-xs">
              รอผู้เข้าชิง
            </div>
          </div>
        )}
      </div>

      {/* 1st Place (Center - Tallest & Glorious) */}
      <div className="flex-1 flex flex-col items-center transition-all duration-700 ease-out order-2 z-10">
        {first ? (
          <div className="w-full flex flex-col items-center animate-pop">
            {/* Animated Crown */}
            <div className="relative mb-2">
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-amber-400 animate-bounce">
                <Crown className="w-8 h-8 sm:w-10 sm:h-10 fill-amber-400 text-amber-300 filter drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
              </div>
              <div
                className="w-20 h-20 sm:w-26 sm:h-26 rounded-3xl flex items-center justify-center text-4xl sm:text-5xl shadow-2xl border-4 border-amber-300 transition-transform duration-500 hover:scale-110"
                style={{
                  backgroundColor: first.color || '#f59e0b',
                  boxShadow: '0 0 35px rgba(245, 158, 11, 0.6)'
                }}
              >
                {first.mascot || '👑'}
              </div>
            </div>

            {/* Name & Points */}
            <div className="text-center mb-3">
              <div className="font-extrabold text-base sm:text-lg text-amber-300 truncate max-w-[140px] sm:max-w-[190px]">
                {first.name}
              </div>
              <div className="text-2xl sm:text-4xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                {first.score.toLocaleString()} <span className="text-xs font-semibold text-amber-200">pts</span>
              </div>
            </div>

            {/* 1st Podium Pillar */}
            <div className="w-full bg-gradient-to-t from-amber-950 via-amber-900/90 to-amber-600/80 rounded-t-2xl border-t-4 border-x-2 border-amber-400 p-4 flex flex-col items-center justify-center shadow-2xl h-56 sm:h-68 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-400/25 via-transparent to-transparent animate-pulse"></div>
              <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-300 mb-1 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
              <div className="text-3xl sm:text-5xl font-black text-amber-200 font-mono drop-shadow">1</div>
              <div className="text-xs sm:text-sm font-bold text-amber-300 tracking-wider uppercase">แชมป์อันดับ 1</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center opacity-40">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600">
              <Trophy className="w-8 h-8" />
            </div>
            <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-48 flex items-center justify-center text-slate-600 text-xs">
              รอผู้เข้าชิงอันดับ 1
            </div>
          </div>
        )}
      </div>

      {/* 3rd Place (Right) */}
      <div className="flex-1 flex flex-col items-center transition-all duration-700 ease-out order-3">
        {third ? (
          <div className="w-full flex flex-col items-center animate-pop">
            {/* Mascot Avatar */}
            <div className="relative mb-2">
              <div
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl shadow-lg border-2 border-amber-700/60 transition-transform duration-500 hover:scale-110"
                style={{
                  backgroundColor: third.color || '#d97706',
                  boxShadow: '0 0 20px rgba(217, 119, 6, 0.4)'
                }}
              >
                {third.mascot || '🥉'}
              </div>
            </div>

            {/* Name & Points */}
            <div className="text-center mb-3">
              <div className="font-bold text-sm sm:text-base text-slate-100 truncate max-w-[120px] sm:max-w-[160px]">
                {third.name}
              </div>
              <div className="text-xl sm:text-2xl font-black text-amber-500 font-mono tracking-tight">
                {third.score.toLocaleString()} <span className="text-xs font-medium text-amber-600/70">pts</span>
              </div>
            </div>

            {/* 3rd Podium Pillar */}
            <div className="w-full bg-gradient-to-t from-slate-950 via-amber-950/70 to-amber-800/80 rounded-t-2xl border-t-2 border-x-2 border-amber-600/50 p-4 flex flex-col items-center justify-center shadow-xl h-36 sm:h-44 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600/10 via-transparent to-transparent"></div>
              <Medal className="w-9 h-9 sm:w-11 sm:h-11 text-amber-500 mb-1 drop-shadow" />
              <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">3</div>
              <div className="text-[11px] font-semibold text-amber-400 tracking-wider uppercase">อันดับ 3</div>
            </div>
          </div>
        ) : (
          <div className="w-full flex flex-col items-center opacity-40">
            <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600 text-sm">
              ว่าง
            </div>
            <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-28 flex items-center justify-center text-slate-600 text-xs">
              รอผู้เข้าชิง
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
