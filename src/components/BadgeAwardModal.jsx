import React from 'react';
import { Award, X, CheckCircle2, Sparkles } from 'lucide-react';
import { AVAILABLE_BADGES } from '../services/badgeService';

export const BadgeAwardModal = ({
  isOpen,
  onClose,
  student,
  subject,
  onSaveSubject
}) => {
  if (!isOpen || !student || !subject) return null;

  const currentBadgeIds = subject.studentBadges?.[student.id] || [];

  const handleToggle = (badgeId) => {
    const exists = currentBadgeIds.includes(badgeId);
    const updatedList = exists
      ? currentBadgeIds.filter((id) => id !== badgeId)
      : [...currentBadgeIds, badgeId];

    const updatedSubject = {
      ...subject,
      studentBadges: {
        ...(subject.studentBadges || {}),
        [student.id]: updatedList
      }
    };

    onSaveSubject(updatedSubject);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 animate-pop">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                มอบเหรียญเกียรติยศ & ตราความดี
              </h3>
              <p className="text-xs text-slate-300">
                เลขที่ {student.studentNumber} {student.title || ''}{student.name} • {subject.name}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-400">
          💡 คลิกที่เหรียญเพื่อมอบหรือยกเลิก เหรียญที่เลือกจะแสดงในโปรไฟล์ของนักเรียนทันที
        </p>

        {/* Badges Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
          {AVAILABLE_BADGES.map((b) => {
            const isAwarded = currentBadgeIds.includes(b.id);
            return (
              <div
                key={b.id}
                onClick={() => handleToggle(b.id)}
                className={`p-3 rounded-2xl border-2 transition-all cursor-pointer select-none space-y-1 relative ${
                  isAwarded
                    ? 'bg-indigo-950/70 border-amber-400 shadow-lg shadow-amber-500/10 scale-[1.02]'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700 opacity-70 hover:opacity-100'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{b.icon}</span>
                  {isAwarded ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>มอบแล้ว</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500">คลิกเพื่อมอบ</span>
                  )}
                </div>

                <div className="font-bold text-xs text-white">
                  {b.name}
                </div>

                <div className="text-[10px] text-slate-400 leading-tight">
                  {b.description}
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-800 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md"
          >
            เรียบร้อย
          </button>
        </div>
      </div>
    </div>
  );
};
