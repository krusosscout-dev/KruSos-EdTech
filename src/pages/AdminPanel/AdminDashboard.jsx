import React, { useState, useEffect } from 'react';
import { Camera, Plus, Settings, FileText, Users, Trophy, Sparkles, ShieldAlert, Trash2, QrCode } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { Navbar } from '../../components/Navbar';
import { CameraScanner } from './CameraScanner';
import { ScoreModal } from './ScoreModal';
import { RoomSettings } from './RoomSettings';
import { ReportExport } from './ReportExport';
import { LuckyWheelModal } from '../../components/LuckyWheelModal';

export const AdminDashboard = ({ roomId, onBack }) => {
  const { roomState, joinRoom, adminValidateQr, deleteGroup } = useSocket();
  const [showScanner, setShowScanner] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreModalData, setScoreModalData] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId, 'admin');
    }
  }, [roomId]);

  const groups = roomState?.groups || [];
  const room = roomState?.room;

  const handleScanSuccess = async (rawDecodedText) => {
    setShowScanner(false);
    const validation = await adminValidateQr(rawDecodedText);

    if (validation.valid && validation.data) {
      setScoreModalData(validation.data);
      setShowScoreModal(true);
    } else {
      alert(`⚠️ ${validation.reason || 'QR Code ไม่ถูกต้อง หรือหมดอายุแล้ว'}`);
    }
  };

  const handleManualScore = (group) => {
    setScoreModalData({
      groupId: group.id,
      groupName: group.name,
      groupColor: group.color,
      groupMascot: group.mascot,
      currentScore: group.score,
      missionName: 'ภารกิจทั่วไป (ให้คะแนนตรง)',
      token: null,
      timestamp: null
    });
    setShowScoreModal(true);
  };

  const handleDeleteGroup = async (groupId, groupName) => {
    if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบกลุ่ม "${groupName}"?`)) {
      await deleteGroup(roomId, groupId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-12">
      <Navbar role="admin" roomId={roomId} onBack={onBack} />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Status Alerts */}
        {room?.status === 'paused' && (
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 shrink-0" />
              <span>ห้องกิจกรรมอยู่ในสถานะ &quot;พักชั่วคราว&quot;</span>
            </div>
            <button
              onClick={() => setShowSettings(true)}
              className="px-3 py-1 rounded-lg bg-amber-600 text-slate-950 font-bold"
            >
              เปิดการตั้งค่า
            </button>
          </div>
        )}

        {/* Action Header Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
          {/* Main QR Scanner Button */}
          <button
            onClick={() => setShowScanner(true)}
            className="sm:col-span-2 p-5 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-3 transition-transform active:scale-95 text-base sm:text-lg"
          >
            <Camera className="w-7 h-7 text-amber-300 animate-pulse" />
            <span>เปิดกล้องสแกน QR Code</span>
          </button>

          {/* Lucky Wheel Button */}
          <button
            onClick={() => setShowWheel(true)}
            className="p-5 rounded-3xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 hover:opacity-95 text-slate-950 font-black text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-transform active:scale-95"
          >
            <Sparkles className="w-6 h-6 fill-slate-950" />
            <span>🎡 วงล้อสุ่มหรรษา</span>
          </button>
        </div>

        {/* Quick Stats & Tools Overview */}
        <div className="grid grid-cols-3 gap-3">
          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 font-medium">กลุ่มที่เข้าร่วม</div>
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">
              {groups.length}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 text-center">
            <div className="text-[11px] text-slate-400 font-medium">ภารกิจที่ตรวจแล้ว</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">
              {roomState?.totalMissionsCompleted || 0}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-3 sm:p-4 border border-slate-800 text-center flex flex-col items-center justify-center">
            <div className="text-[11px] text-slate-400 font-medium mb-1">จัดการห้อง / รายงาน</div>
            <div className="flex gap-1.5">
              <button
                onClick={() => setShowSettings(true)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-indigo-950 border border-indigo-700 hover:bg-indigo-900 text-indigo-300 font-bold transition-colors"
                title="ดู QR Code ห้อง และตั้งค่า"
              >
                PIN / QR
              </button>
              <button
                onClick={() => setShowReport(true)}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-emerald-950 border border-emerald-700 hover:bg-emerald-900 text-emerald-300 font-bold transition-colors"
                title="ส่งออกรายงาน Excel / CSV"
              >
                รายงาน
              </button>
            </div>
          </div>
        </div>

        {/* Groups Management List */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h2 className="font-bold text-base text-slate-200 flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <span>รายชื่อกลุ่มและคะแนนสะสม ({groups.length} กลุ่ม)</span>
            </h2>
          </div>

          {groups.length === 0 ? (
            <div className="glass-card rounded-3xl p-10 text-center border border-slate-800 text-slate-500 text-sm space-y-2">
              <Users className="w-10 h-10 mx-auto text-slate-600" />
              <p>ยังไม่มีกลุ่มนักเรียนเข้าร่วมห้องกิจกรรม</p>
              <p className="text-xs text-slate-600">
                ให้นักเรียนสแกน Room QR หรือใส่รหัส PIN: <span className="text-indigo-400 font-bold font-mono">{roomId}</span>
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {groups.map((group, idx) => (
                <div
                  key={group.id}
                  className="glass-card rounded-2xl p-4 border border-slate-800/80 flex items-center justify-between gap-3 hover:border-slate-700 transition-all"
                >
                  {/* Rank & Mascot */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-black text-xs text-slate-300 shrink-0">
                      #{group.rank || idx + 1}
                    </div>

                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 border border-white/10 shadow-sm"
                      style={{ backgroundColor: `${group.color || '#6366f1'}33` }}
                    >
                      {group.mascot || '🚀'}
                    </div>

                    <div className="min-w-0">
                      <div className="font-bold text-sm text-white truncate">{group.name}</div>
                      <div className="text-xs text-slate-400 font-mono">
                        <span className="text-indigo-300 font-bold">{group.score.toLocaleString()}</span> คะแนน
                      </div>
                    </div>
                  </div>

                  {/* Quick Action Buttons */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      onClick={() => handleManualScore(group)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/40 text-emerald-300 text-xs font-bold flex items-center gap-1 transition-colors"
                      title="ให้คะแนนตรง"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>ให้แต้ม</span>
                    </button>

                    <button
                      onClick={() => handleDeleteGroup(group.id, group.name)}
                      className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-950 border border-slate-700 hover:border-rose-600 text-slate-400 hover:text-rose-400 transition-colors"
                      title="ลบกลุ่ม"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* Modal: Lucky Wheel */}
      {showWheel && (
        <LuckyWheelModal
          roomId={roomId}
          groups={groups}
          onClose={() => setShowWheel(false)}
        />
      )}

      {/* Modal: Camera Scanner */}
      {showScanner && (
        <CameraScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}

      {/* Modal: Scoring */}
      {showScoreModal && scoreModalData && (
        <ScoreModal
          roomId={roomId}
          data={scoreModalData}
          onClose={() => {
            setShowScoreModal(false);
            setScoreModalData(null);
          }}
        />
      )}

      {/* Modal: Room Settings */}
      {showSettings && (
        <RoomSettings
          roomId={roomId}
          room={room}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* Modal: Report Export */}
      {showReport && (
        <ReportExport
          roomId={roomId}
          roomState={roomState}
          onClose={() => setShowReport(false)}
        />
      )}
    </div>
  );
};
