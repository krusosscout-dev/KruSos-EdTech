import React, { useState, useEffect } from 'react';
import { Trophy, QrCode, Sparkles, Award, History, LogOut, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { Navbar } from '../../components/Navbar';
import { RequestScoreModal } from './RequestScoreModal';
import { StudentLeaderboard } from './StudentLeaderboard';

export const StudentDashboard = ({ roomId, onLeave }) => {
  const { roomState, currentGroup, joinRoom, leaveGroup } = useSocket();
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'leaderboard'
  const [showScoreModal, setShowScoreModal] = useState(false);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId, 'student', currentGroup?.id);
    }
  }, [roomId, currentGroup?.id]);

  if (!currentGroup) {
    return null;
  }

  const room = roomState?.room;
  const isPaused = room?.status === 'paused';
  const isEnded = room?.status === 'ended';

  // Filter transactions for this group
  const myTransactions = (roomState?.recentTransactions || []).filter(
    (tx) => tx.groupId === currentGroup.id
  );

  const handleLeave = () => {
    if (window.confirm('คุณต้องการออกจากกลุ่มนี้ใช่หรือไม่?')) {
      leaveGroup();
      if (onLeave) onLeave();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-12">
      <Navbar role="student" roomId={roomId} />

      <main className="flex-1 max-w-lg w-full mx-auto p-4 space-y-4">
        {/* Room Status Warnings */}
        {isPaused && (
          <div className="p-3 rounded-2xl bg-amber-950/80 border border-amber-600/60 text-amber-300 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span>คุณครูกำลังพักกิจกรรมชั่วคราว ไม่สามารถขอคะแนนได้ในขณะนี้</span>
          </div>
        )}

        {isEnded && (
          <div className="p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500 text-indigo-200 text-xs text-center space-y-1">
            <div className="text-sm font-bold text-amber-300">🎉 สิ้นสุดกิจกรรมแล้ว!</div>
            <p>กรุณาดูผลการสรุปคะแนนบนหน้าจอใหญ่ของคุณครู</p>
          </div>
        )}

        {/* Group Score Card */}
        <div
          className="rounded-3xl p-6 border shadow-2xl relative overflow-hidden text-center transition-all animate-pop"
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            borderColor: currentGroup.color || '#6366f1',
            boxShadow: `0 10px 30px -5px ${currentGroup.color || '#6366f1'}44`
          }}
        >
          {/* Header Info */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-3xl">{currentGroup.mascot || '🚀'}</span>
              <div className="text-left">
                <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                  {currentGroup.name}
                </h2>
                <div className="text-[11px] text-slate-400">กลุ่มของคุณ</div>
              </div>
            </div>

            {/* Rank badge */}
            <div className="px-3 py-1 rounded-full bg-slate-900 border border-slate-700 font-mono text-xs font-bold text-amber-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>อันดับ #{currentGroup.rank || 1}</span>
            </div>
          </div>

          {/* Large Live Score Display */}
          <div className="py-3">
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold mb-1">
              คะแนนสะสมปัจจุบัน
            </div>
            <div className="text-5xl sm:text-6xl font-black font-mono tracking-tight text-white drop-shadow">
              {(currentGroup.score || 0).toLocaleString()}
            </div>
            <div className="text-xs text-indigo-400 font-medium mt-1">คะแนน (Points)</div>
          </div>

          {/* Big Action Button: Request Score QR */}
          <div className="mt-4 pt-4 border-t border-slate-800">
            <button
              onClick={() => setShowScoreModal(true)}
              disabled={isPaused || isEnded}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-indigo-600 to-pink-500 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed text-white font-extrabold text-base shadow-xl shadow-indigo-600/30 flex items-center justify-center gap-2 transition-transform active:scale-95"
            >
              <QrCode className="w-6 h-6 text-amber-300" />
              <span>ขอรับคะแนน (สร้าง QR Code)</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              เมื่อทำภารกิจเสร็จ กดปุ่มนี้เพื่อสร้าง QR Code ให้ครูสแกน
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-2xl bg-slate-900 p-1 border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'dashboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <History className="w-4 h-4" />
            <span>ประวัติภารกิจ ({myTransactions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`flex-1 py-2.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>ลีดเดอร์บอร์ด</span>
          </button>
        </div>

        {/* Tab 1: Mission Log */}
        {activeTab === 'dashboard' && (
          <div className="space-y-2">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
              ภารกิจที่ได้รับคะแนนแล้ว
            </div>

            {myTransactions.length === 0 ? (
              <div className="glass-card rounded-2xl p-6 text-center text-slate-500 text-xs">
                ยังไม่มีประวัติการได้คะแนน กดปุ่ม &quot;ขอรับคะแนน&quot; ด้านบนเพื่อเริ่มสะสมคะแนนแรก!
              </div>
            ) : (
              myTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="glass-card rounded-2xl p-3.5 border border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-600/40 flex items-center justify-center text-emerald-400 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-slate-200">{tx.missionName}</div>
                      <div className="text-[11px] text-slate-400">
                        {new Date(tx.timestamp).toLocaleTimeString('th-TH')} {tx.note ? `• ${tx.note}` : ''}
                      </div>
                    </div>
                  </div>

                  <div className="font-mono font-black text-emerald-400 text-base">
                    +{tx.points}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab 2: Leaderboard */}
        {activeTab === 'leaderboard' && (
          <StudentLeaderboard
            groups={roomState?.groups || []}
            myGroupId={currentGroup.id}
          />
        )}

        {/* Leave Group Button */}
        <div className="pt-4 text-center">
          <button
            onClick={handleLeave}
            className="text-xs text-slate-500 hover:text-rose-400 flex items-center justify-center gap-1 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>ออกจากกลุ่มนี้ / เปลี่ยนกลุ่ม</span>
          </button>
        </div>
      </main>

      {/* Modal: Request Score QR */}
      {showScoreModal && (
        <RequestScoreModal
          roomId={roomId}
          group={currentGroup}
          roomMissions={room?.missions || []}
          onClose={() => setShowScoreModal(false)}
        />
      )}
    </div>
  );
};
