import React from 'react';
import { Trophy, Crown, Medal, Award } from 'lucide-react';

export const StudentLeaderboard = ({ groups = [], myGroupId }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h3 className="font-bold text-sm text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span>กระดานคะแนนเรียลไทม์ ({groups.length} กลุ่ม)</span>
        </h3>
      </div>

      <div className="space-y-2">
        {groups.map((group, idx) => {
          const isMe = group.id === myGroupId;
          const rank = group.rank || idx + 1;

          let rankBadge = (
            <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 font-mono font-bold text-xs flex items-center justify-center text-slate-300">
              #{rank}
            </div>
          );

          if (rank === 1) {
            rankBadge = (
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 border border-amber-400 font-mono font-bold text-xs flex items-center justify-center text-amber-400 shadow-sm">
                🥇
              </div>
            );
          } else if (rank === 2) {
            rankBadge = (
              <div className="w-7 h-7 rounded-lg bg-slate-400/20 border border-slate-400 font-mono font-bold text-xs flex items-center justify-center text-slate-300 shadow-sm">
                🥈
              </div>
            );
          } else if (rank === 3) {
            rankBadge = (
              <div className="w-7 h-7 rounded-lg bg-amber-700/20 border border-amber-600 font-mono font-bold text-xs flex items-center justify-center text-amber-500 shadow-sm">
                🥉
              </div>
            );
          }

          return (
            <div
              key={group.id}
              className={`p-3 rounded-2xl border transition-all flex items-center gap-3 ${
                isMe
                  ? 'bg-indigo-950/60 border-indigo-500 shadow-lg shadow-indigo-500/10'
                  : 'glass-card border-slate-800'
              }`}
            >
              {rankBadge}

              {/* Mascot */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0 border border-white/10"
                style={{ backgroundColor: `${group.color || '#6366f1'}33` }}
              >
                {group.mascot || '🚀'}
              </div>

              {/* Name */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-white truncate">{group.name}</span>
                  {isMe && (
                    <span className="px-1.5 py-0.2 rounded bg-indigo-500 text-white text-[10px] font-bold">
                      กลุ่มเรา
                    </span>
                  )}
                </div>
              </div>

              {/* Score */}
              <div className="font-mono font-black text-base text-amber-400 shrink-0">
                {group.score.toLocaleString()} <span className="text-xs font-normal text-slate-400">pts</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
