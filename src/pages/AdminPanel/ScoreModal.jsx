import React, { useState } from 'react';
import { X, Sparkles, Trophy, Plus, Minus, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const PRESET_POINTS = [5, 10, 20, 50, 100];

export const ScoreModal = ({ roomId, data, onClose, onSuccess }) => {
  const { adminSubmitScore } = useSocket();
  const [points, setPoints] = useState(10);
  const [customMission, setCustomMission] = useState(data.missionName || 'ภารกิจทั่วไป');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e?.preventDefault();
    const pts = parseInt(points, 10);
    if (isNaN(pts) || pts === 0) {
      setError('กรุณาระบุคะแนนที่ถูกต้อง');
      return;
    }

    setLoading(true);
    setError('');

    const res = await adminSubmitScore({
      roomId,
      groupId: data.groupId,
      missionName: customMission.trim() || data.missionName || 'ภารกิจทั่วไป',
      points: pts,
      token: data.token || null,
      note: note.trim()
    });

    setLoading(false);
    if (res.success) {
      if (onSuccess) onSuccess(res.transaction);
      onClose();
    } else {
      setError(res.error || 'ไม่สามารถบันทึกคะแนนได้');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-5">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center text-3xl shadow-lg mb-2 border border-white/20"
            style={{ backgroundColor: data.groupColor || '#6366f1' }}
          >
            {data.groupMascot || '🚀'}
          </div>
          <h2 className="text-xl font-bold text-white">{data.groupName}</h2>
          <div className="text-xs text-slate-400 mt-0.5">
            คะแนนปัจจุบัน: <span className="font-mono font-bold text-indigo-300">{(data.currentScore || 0).toLocaleString()} pts</span>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mission Name Display / Edit */}
          <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              ภารกิจที่ทำสำเร็จ (ระบุโดยนักเรียน)
            </label>
            <input
              type="text"
              value={customMission}
              onChange={(e) => setCustomMission(e.target.value)}
              className="w-full bg-transparent text-amber-300 font-bold text-sm outline-none border-b border-dashed border-slate-700 pb-1"
            />
            {data.timestamp && (
              <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-400" />
                <span>ส่งเมื่อ {data.timestamp} • ผ่านการตรวจสอบ Dynamic QR</span>
              </div>
            )}
          </div>

          {/* Quick Preset Points */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              เลือกคะแนนที่ต้องการมอบให้:
            </label>
            <div className="grid grid-cols-5 gap-2 mb-2">
              {PRESET_POINTS.map((pt) => (
                <button
                  key={pt}
                  type="button"
                  onClick={() => setPoints(pt)}
                  className={`py-2.5 rounded-xl font-mono font-bold text-sm border transition-all ${
                    points === pt
                      ? 'bg-gradient-to-r from-amber-500 to-amber-400 text-slate-950 border-amber-300 shadow-md scale-105'
                      : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-700'
                  }`}
                >
                  +{pt}
                </button>
              ))}
            </div>

            {/* Custom Score & Deduction */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPoints((prev) => Math.max(-50, prev - 5))}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-rose-950/60 border border-slate-700 hover:border-rose-600 text-rose-400 font-bold text-xs flex items-center gap-1"
                title="หักคะแนน 5 แต้ม"
              >
                <Minus className="w-3.5 h-3.5" /> 5
              </button>

              <div className="flex-1 relative">
                <input
                  type="text"
                  inputMode="numeric"
                  value={points}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === '' || /^-?\d*$/.test(v)) {
                      setPoints(v === '' || v === '-' ? v : parseInt(v, 10));
                    }
                  }}
                  onWheel={(e) => {
                    e.preventDefault();
                    const isUp = e.deltaY < 0;
                    const curr = typeof points === 'number' ? points : parseInt(points, 10) || 0;
                    const step = e.shiftKey ? 1 : 5;
                    const next = isUp ? Math.min(100, curr + step) : Math.max(-100, curr - step);
                    setPoints(next);
                  }}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-lg text-white outline-none focus:border-indigo-500 no-spin cursor-pointer"
                  title="เลื่อนลูกกลิ้งเมาส์เพื่อเพิ่ม/ลดคะแนน (+/-)"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 font-medium pointer-events-none">
                  pts
                </span>
              </div>

              <button
                type="button"
                onClick={() => setPoints((prev) => prev + 5)}
                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-emerald-400 font-bold text-xs flex items-center gap-1"
                title="เพิ่มคะแนน 5 แต้ม"
              >
                <Plus className="w-3.5 h-3.5" /> 5
              </button>
            </div>
          </div>

          {/* Optional Note */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              หมายเหตุ / ข้อความชมเชย (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น ทำงานเร็วและเรียบร้อยมาก"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs outline-none focus:border-indigo-500"
            />
          </div>

          {/* Confirm Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:opacity-95 text-white font-bold shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                <span>ยืนยันมอบ {points >= 0 ? `+${points}` : points} คะแนน</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
