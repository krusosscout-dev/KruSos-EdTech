import React from 'react';
import { Sparkles, Trophy } from 'lucide-react';

export const LiveToast = ({ toast }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-20 right-6 z-50 animate-pop max-w-md w-full shadow-2xl">
      <div
        className="rounded-2xl p-4 border flex items-center gap-3 backdrop-blur-xl transition-all"
        style={{
          backgroundColor: 'rgba(15, 23, 42, 0.95)',
          borderColor: toast.groupColor || '#6366f1',
          boxShadow: `0 10px 30px -5px ${toast.groupColor || '#6366f1'}66`
        }}
      >
        {/* Mascot / Avatar */}
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-inner border border-white/20 shrink-0"
          style={{ backgroundColor: `${toast.groupColor || '#6366f1'}33` }}
        >
          {toast.groupMascot || '🌟'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-amber-400 font-semibold tracking-wider uppercase">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>ภารกิจสำเร็จ!</span>
          </div>
          <div className="font-bold text-base text-white truncate">
            {toast.groupName}
          </div>
          <div className="text-xs text-slate-300 truncate">
            ภารกิจ: <span className="text-indigo-200 font-medium">{toast.missionName}</span>
          </div>
        </div>

        {/* Points Badge */}
        <div className="bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 font-black px-3.5 py-2 rounded-xl text-lg flex items-center gap-1 shadow-lg shrink-0 animate-bounce">
          <span>+{toast.points}</span>
        </div>
      </div>
    </div>
  );
};
