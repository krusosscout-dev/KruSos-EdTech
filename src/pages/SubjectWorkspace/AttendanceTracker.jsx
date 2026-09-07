import React, { useState } from 'react';
import { Calendar, Clock, Check, X, AlertCircle, Plus, Minus, CheckCircle2, Award, History, Sparkles, ShieldCheck } from 'lucide-react';

const STATUS_OPTIONS = [
  { key: 'present', label: 'มา', symbol: '/', color: 'bg-emerald-600 border-emerald-400 text-white' },
  { key: 'absent', label: 'ขาด', symbol: 'ข', color: 'bg-rose-600 border-rose-400 text-white' },
  { key: 'late', label: 'สาย', symbol: 'ส', color: 'bg-amber-600 border-amber-400 text-white' },
  { key: 'leave', label: 'ลา', symbol: 'ล', color: 'bg-sky-600 border-sky-400 text-white' },
  { key: 'activity', label: 'กิจกรรม', symbol: 'ก', color: 'bg-purple-600 border-purple-400 text-white' },
];

export const AttendanceTracker = ({ subject, onSaveAttendance }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedPeriod, setSelectedPeriod] = useState('คาบ 1 (08:30 - 09:30)');
  const [activeSessionId, setActiveSessionId] = useState(() => `att_${new Date().toISOString().slice(0, 10)}`);

  const { students = [], attendance = [] } = subject;

  // Find existing session or initialize new
  const currentSession = attendance.find(a => a.date === selectedDate) || {
    id: `att_${selectedDate}`,
    date: selectedDate,
    period: selectedPeriod,
    records: {}
  };

  const records = currentSession.records || {};

  // Status handler
  const handleSetStatus = (studentId, status) => {
    const prev = records[studentId] || { status: 'present', periodBonusPoints: 0, note: '' };
    const updated = {
      ...currentSession,
      records: {
        ...records,
        [studentId]: { ...prev, status }
      }
    };
    onSaveAttendance(updated);
  };

  // Bonus Points handler (independent from grade scores)
  const handleStepBonus = (studentId, delta) => {
    const prev = records[studentId] || { status: 'present', periodBonusPoints: 0, note: '' };
    const currentBonus = parseInt(prev.periodBonusPoints || 0, 10);
    const updated = {
      ...currentSession,
      records: {
        ...records,
        [studentId]: {
          ...prev,
          periodBonusPoints: Math.max(0, currentBonus + delta)
        }
      }
    };
    onSaveAttendance(updated);
  };

  const handleUpdateNote = (studentId, note) => {
    const prev = records[studentId] || { status: 'present', periodBonusPoints: 0, note: '' };
    const updated = {
      ...currentSession,
      records: {
        ...records,
        [studentId]: { ...prev, note }
      }
    };
    onSaveAttendance(updated);
  };

  // Quick mark all present
  const handleMarkAllPresent = () => {
    const updatedRecords = { ...records };
    students.forEach(std => {
      const prev = updatedRecords[std.id] || { periodBonusPoints: 0, note: '' };
      updatedRecords[std.id] = { ...prev, status: 'present' };
    });
    onSaveAttendance({
      ...currentSession,
      records: updatedRecords
    });
  };

  return (
    <div className="space-y-5 animate-pop">
      {/* Session Config & Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-5 rounded-3xl border border-slate-800">
        <div className="flex items-center gap-3 w-full sm:w-auto flex-wrap">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              วันที่เช็คชื่อ:
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              คาบเรียน:
            </label>
            <input
              type="text"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              placeholder="เช่น คาบ 2 (09:30 - 10:30)"
              className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white font-medium outline-none focus:border-indigo-500 w-48"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={handleMarkAllPresent}
            className="px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-sm"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>มาครบทุกคน (All Present)</span>
          </button>
        </div>
      </div>

      {/* Separation Notice Banner (Requirement 5) */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/60 border border-indigo-500/40 text-indigo-200 text-xs flex items-center gap-2.5 shadow-sm">
        <ShieldCheck className="w-5 h-5 text-indigo-400 shrink-0" />
        <span>
          <strong>การทำงานแยกส่วน:</strong> การเช็คชื่อและการบวกแต้มรายคาบในหน้านี้ เป็นคะแนนพฤติกรรม/จิตพิสัยสะสมในชั้นเรียน จะถูกบันทึกแยกต่างหาก <strong>โดยไม่กระทบกับคะแนนเก็บตัดเกรด</strong> ของนักเรียนครับ
        </span>
      </div>

      {/* Attendance Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <th className="p-3 w-14 text-center">เลขที่</th>
                <th className="p-3 min-w-[170px]">ชื่อ-นามสกุล</th>
                <th className="p-3 text-center min-w-[220px]">สถานะการเข้าเรียน</th>
                <th className="p-3 text-center min-w-[160px]">แต้มจิตพิสัยรายคาบ (+/-)</th>
                <th className="p-3 min-w-[180px]">บันทึกพฤติกรรม / หมายเหตุ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {students.map((std) => {
                const rec = records[std.id] || { status: 'present', periodBonusPoints: 0, note: '' };
                const status = rec.status || 'present';
                const bonus = parseInt(rec.periodBonusPoints || 0, 10);

                return (
                  <tr key={std.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-base text-slate-200">
                      {std.studentNumber}
                    </td>

                    <td className="p-3 font-bold text-base text-white">
                      <span>{std.title || ''}{std.name}</span>
                    </td>

                    {/* Status Toggle Buttons */}
                    <td className="p-2.5 text-center">
                      <div className="inline-flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                        {STATUS_OPTIONS.map((opt) => (
                          <button
                            key={opt.key}
                            type="button"
                            onClick={() => handleSetStatus(std.id, opt.key)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-xs transition-all border ${
                              status === opt.key
                                ? opt.color + ' shadow-md scale-105'
                                : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* Stepper Period Bonus Points */}
                    <td className="p-2.5 text-center">
                      <div
                        onWheel={(e) => {
                          e.preventDefault();
                          const step = e.shiftKey ? 5 : 1;
                          const delta = e.deltaY < 0 ? step : -step;
                          handleStepBonus(std.id, delta);
                        }}
                        title="เลื่อนลูกกลิ้งเมาส์เพื่อเพิ่ม/ลดคะแนนโบนัส (กด Shift เพื่อ +/- 5 แต้ม)"
                        className="inline-flex items-center gap-1.5 bg-slate-950 px-2 py-1 rounded-xl border border-slate-800 cursor-ns-resize"
                      >
                        <button
                          type="button"
                          onClick={() => handleStepBonus(std.id, -1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-rose-400 flex items-center justify-center transition-colors"
                          title="ลด 1 แต้ม"
                        >
                          <Minus className="w-3 h-3" />
                        </button>

                        <span className={`font-mono font-bold text-sm w-10 text-center ${bonus > 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                          {bonus > 0 ? `+${bonus}` : bonus}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleStepBonus(std.id, 1)}
                          className="w-6 h-6 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-emerald-400 flex items-center justify-center transition-colors"
                          title="เพิ่ม 1 แต้ม"
                        >
                          <Plus className="w-3 h-3" />
                        </button>

                        {/* Quick +5 button */}
                        <button
                          type="button"
                          onClick={() => handleStepBonus(std.id, 5)}
                          className="px-1.5 py-0.5 rounded text-[10px] bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono font-bold hover:bg-indigo-900"
                          title="เพิ่ม 5 แต้มโบนัส"
                        >
                          +5
                        </button>
                      </div>
                    </td>

                    {/* Note input */}
                    <td className="p-2.5">
                      <input
                        type="text"
                        placeholder="เช่น ช่วยตอบคำถาม, มีจิตสาธารณะ..."
                        value={rec.note || ''}
                        onChange={(e) => handleUpdateNote(std.id, e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-indigo-500"
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
