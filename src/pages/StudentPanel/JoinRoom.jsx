import React, { useState, useEffect } from 'react';
import { Users, Sparkles, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const MASCOTS = ['🚀', '⚡', '🦁', '🐉', '🤖', '🦅', '🐯', '🦄', '🌟', '🎯', '👾', '🏎️', '🦖', '🥑', '🏆', '🔥'];

const COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Fuchsia', value: '#d946ef' },
  { name: 'Violet', value: '#8b5cf6' },
  { name: 'Orange', value: '#f97316' },
];

export const JoinRoom = ({ initialRoomId = '', onJoined }) => {
  const { joinOrCreateGroup, roomState, joinRoom } = useSocket();
  const [roomId, setRoomId] = useState(initialRoomId || '');
  const [groupName, setGroupName] = useState('');
  const [mascot, setMascot] = useState('🚀');
  const [color, setColor] = useState('#6366f1');
  const [mode, setMode] = useState('new'); // 'new' | 'existing'
  const [selectedExistingId, setSelectedExistingId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialRoomId) {
      setRoomId(initialRoomId.toUpperCase());
      joinRoom(initialRoomId, 'viewer');
    }
  }, [initialRoomId]);

  const handleRoomIdBlur = () => {
    if (roomId.trim().length >= 4) {
      joinRoom(roomId.trim(), 'viewer');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!roomId.trim()) {
      setError('กรุณาระบุรหัสห้องกิจกรรม (PIN)');
      return;
    }

    if (mode === 'new' && !groupName.trim()) {
      setError('กรุณาตั้งชื่อกลุ่มของท่าน');
      return;
    }

    if (mode === 'existing' && !selectedExistingId) {
      setError('กรุณาเลือกกลุ่มที่ท่านต้องการเข้าร่วม');
      return;
    }

    setLoading(true);
    setError('');

    const res = await joinOrCreateGroup({
      roomId: roomId.trim().toUpperCase(),
      name: groupName.trim(),
      color,
      mascot,
      existingGroupId: mode === 'existing' ? selectedExistingId : null
    });

    setLoading(false);
    if (res.success) {
      onJoined(res.group, roomId.trim().toUpperCase());
    } else {
      setError(res.error || 'ไม่สามารถเข้าร่วมห้องได้');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-indigo-950/30 to-slate-950 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-pop">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-pink-500 mx-auto flex items-center justify-center text-2xl shadow-lg mb-3">
            {mascot}
          </div>
          <h2 className="text-2xl font-black text-white">เข้าร่วมห้องกิจกรรม</h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ระบบบันทึกคะแนนกลุ่มเรียลไทม์ - ครูซอส
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Room PIN */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              รหัสห้องกิจกรรม (Room PIN)
            </label>
            <input
              type="text"
              placeholder="เช่น 123456"
              maxLength={8}
              value={roomId}
              onChange={(e) => setRoomId(e.target.value.toUpperCase())}
              onBlur={handleRoomIdBlur}
              className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 font-mono text-center tracking-widest text-lg font-bold text-amber-300 outline-none uppercase"
              required
            />
          </div>

          {/* Mode Tabs if existing groups in room */}
          {roomState?.groups && roomState.groups.length > 0 && (
            <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setMode('new')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'new' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                + สร้างกลุ่มใหม่
              </button>
              <button
                type="button"
                onClick={() => setMode('existing')}
                className={`flex-1 py-1.5 rounded-lg font-semibold transition-all ${
                  mode === 'existing' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                เลือกกลุ่มที่มีอยู่ ({roomState.groups.length})
              </button>
            </div>
          )}

          {mode === 'existing' && roomState?.groups && roomState.groups.length > 0 ? (
            /* Select existing group */
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                เลือกกลุ่มของคุณ:
              </label>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {roomState.groups.map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => setSelectedExistingId(g.id)}
                    className={`w-full p-3 rounded-xl border text-left flex items-center gap-3 transition-all ${
                      selectedExistingId === g.id
                        ? 'bg-indigo-950 border-indigo-500 shadow-md shadow-indigo-500/20'
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span className="text-2xl">{g.mascot}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm text-white truncate">{g.name}</div>
                      <div className="text-xs text-indigo-300 font-mono">{g.score} คะแนน</div>
                    </div>
                    {selectedExistingId === g.id && <Check className="w-5 h-5 text-indigo-400" />}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Create new group form */
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  ชื่อกลุ่มของคุณ
                </label>
                <input
                  type="text"
                  placeholder="เช่น กลุ่มมังกรไฟ, ทีมพิชิตโจทย์ 1"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 text-white text-sm outline-none"
                  required={mode === 'new'}
                />
              </div>

              {/* Mascot Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เลือกสัญลักษณ์ประจำกลุ่ม (Mascot)
                </label>
                <div className="grid grid-cols-8 gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {MASCOTS.map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMascot(m)}
                      className={`h-9 rounded-lg flex items-center justify-center text-lg transition-transform ${
                        mascot === m ? 'bg-indigo-600 scale-110 shadow' : 'hover:bg-slate-800'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  เลือกสีประจำกลุ่ม
                </label>
                <div className="flex items-center justify-between gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-transform flex items-center justify-center ${
                        color === c.value ? 'scale-125 ring-2 ring-white ring-offset-2 ring-offset-slate-900' : 'opacity-80 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                      title={c.name}
                    >
                      {color === c.value && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <span>เข้าสู่หน้าจอของกลุ่ม</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
