import React, { useEffect } from 'react';
import { Trophy, Crown, Medal, Award, Flame, CheckCircle2, Download, Sparkles, RefreshCw } from 'lucide-react';
import { triggerVictoryFireworks } from '../../components/ConfettiEffect';

export const GrandSummary = ({ summary, roomId, onRestart = null }) => {
  useEffect(() => {
    // Launch fireworks on load
    triggerVictoryFireworks();
  }, []);

  if (!summary) return null;

  const { champion, top3 = [], allGroups = [], totalGroups, totalScoreGiven, totalMissionsCompleted, popularMissions = [] } = summary;

  const handleDownloadReport = () => {
    window.open(`/api/rooms/${roomId}/export/csv`, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/40 to-slate-950 text-white p-4 sm:p-8 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-5xl w-full z-10 space-y-8 animate-pop">
        {/* Header Title */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-sm sm:text-base animate-bounce">
            <Sparkles className="w-4 h-4" />
            <span>ประกาศผลกิจกรรมอย่างเป็นทางการ (Grand Finale)</span>
            <Sparkles className="w-4 h-4" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 drop-shadow">
            สรุปผลคะแนนกิจกรรม
          </h1>
          <p className="text-sm sm:text-base text-slate-400">
            ห้องกิจกรรม PIN: <span className="font-mono text-indigo-300 font-bold">{roomId}</span>
          </p>
        </div>

        {/* Champion Spotlight Box */}
        {champion && (
          <div className="relative glass-panel rounded-3xl p-6 sm:p-10 border-2 border-amber-400/80 shadow-2xl shadow-amber-500/20 text-center overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Trophy className="w-64 h-64 text-amber-300" />
            </div>

            <div className="relative z-10 flex flex-col items-center">
              <div className="relative mb-4">
                <Crown className="w-14 h-14 sm:w-18 sm:h-18 text-amber-400 fill-amber-400 filter drop-shadow-[0_0_15px_rgba(251,191,36,0.9)] animate-bounce" />
                <div
                  className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl shadow-2xl border-4 border-amber-300 mt-2"
                  style={{
                    backgroundColor: champion.color || '#f59e0b',
                    boxShadow: '0 0 40px rgba(245, 158, 11, 0.7)'
                  }}
                >
                  {champion.mascot || '👑'}
                </div>
              </div>

              <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-amber-400 mb-1">
                🏆 ผู้ชนะเลิศอันดับที่ 1 🏆
              </div>
              <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-2">
                {champion.name}
              </h2>
              <div className="text-3xl sm:text-5xl font-black text-amber-300 font-mono tracking-tight drop-shadow mb-6">
                {champion.score.toLocaleString()} <span className="text-base sm:text-xl font-medium text-amber-400/80">คะแนน</span>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm">
                <div className="px-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700 text-slate-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>สุดยอดทีมแห่งความร่วมมือ</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Top 2 & 3 Quick Cards */}
        {top3.length > 1 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {top3.slice(1, 3).map((group, idx) => (
              <div
                key={group.id}
                className="glass-card rounded-2xl p-5 border border-slate-700 flex items-center gap-4"
              >
                <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center font-mono font-black text-xl text-slate-200 shrink-0">
                  #{idx + 2}
                </div>
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border border-white/20"
                  style={{ backgroundColor: group.color || '#6366f1' }}
                >
                  {group.mascot || '🥈'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-semibold text-slate-400 uppercase">
                    {idx === 0 ? 'รองชนะเลิศอันดับ 1' : 'รองชนะเลิศอันดับ 2'}
                  </div>
                  <div className="font-bold text-lg text-white truncate">{group.name}</div>
                  <div className="font-mono font-extrabold text-xl text-indigo-300">
                    {group.score.toLocaleString()} pts
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Analytics Statistics Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
          <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-medium mb-1">กลุ่มทั้งหมด</div>
            <div className="text-2xl sm:text-3xl font-black text-indigo-400 font-mono">{totalGroups || 0}</div>
            <div className="text-[11px] text-slate-500">ทีมที่เข้าร่วม</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center">
            <div className="text-xs text-slate-400 font-medium mb-1">ภารกิจที่สำเร็จ</div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono">{totalMissionsCompleted || 0}</div>
            <div className="text-[11px] text-slate-500">ครั้งที่ได้รับคะแนน</div>
          </div>

          <div className="glass-card rounded-2xl p-4 border border-slate-800 text-center col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 font-medium mb-1">คะแนนรวมทั้งห้อง</div>
            <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">{(totalScoreGiven || 0).toLocaleString()}</div>
            <div className="text-[11px] text-slate-500">คะแนนที่แจกทั้งหมด</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={handleDownloadReport}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>ดาวน์โหลดรายงานสรุปคะแนน (Excel / CSV)</span>
          </button>

          <button
            onClick={() => triggerVictoryFireworks()}
            className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 font-semibold flex items-center justify-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>จุดพลุฉลองอีกครั้ง 🎉</span>
          </button>
        </div>
      </div>
    </div>
  );
};
