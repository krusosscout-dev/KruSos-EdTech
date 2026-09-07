import React from 'react';
import { Award, ChevronRight } from 'lucide-react';

export const RankList = ({ others = [], highestScore = 1 }) => {
  if (!others || others.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto text-center py-6 px-4 glass-card rounded-2xl border border-slate-800 text-slate-500 text-sm">
        ยังไม่มีกลุ่มในอันดับที่ 4 ขึ้นไป
      </div>
    );
  }

  const maxPoints = Math.max(highestScore, 1);

  return (
    <div className="w-full max-w-4xl mx-auto space-y-2.5 px-2 sm:px-4">
      <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 px-2 mb-1">
        <Award className="w-4 h-4 text-indigo-400" />
        <span>อันดับที่ 4 เป็นต้นไป ({others.length} กลุ่ม)</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {others.map((group, idx) => {
          const rank = group.rank || idx + 4;
          const percentage = Math.min(100, Math.max(8, (group.score / maxPoints) * 100));

          return (
            <div
              key={group.id}
              className="glass-card rounded-xl p-3 border border-slate-800/90 flex items-center gap-3 transition-all hover:border-slate-700 relative overflow-hidden"
            >
              {/* Rank Number */}
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-mono font-black text-sm text-slate-300 border border-slate-700 shrink-0">
                #{rank}
              </div>

              {/* Mascot */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10"
                style={{ backgroundColor: `${group.color || '#6366f1'}33` }}
              >
                {group.mascot || '⚡'}
              </div>

              {/* Group details + Score Progress */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-semibold text-sm text-slate-200 truncate pr-2">
                    {group.name}
                  </div>
                  <div className="font-mono font-black text-base text-indigo-300 shrink-0">
                    {group.score.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">pts</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500 ease-out"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: group.color || '#6366f1'
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
