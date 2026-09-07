import React, { useEffect, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Trophy, Users, Flame, QrCode, Sparkles, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';
import { Navbar } from '../../components/Navbar';
import { Top3Podium } from './Top3Podium';
import { RankList } from './RankList';
import { LiveToast } from './LiveToast';
import { GrandSummary } from './GrandSummary';
import { LuckyWheelModal } from '../../components/LuckyWheelModal';

export const ProjectorScreen = ({ roomId, onBack }) => {
  const { roomState, joinRoom, latestScoreToast, grandSummary } = useSocket();
  const [showWheel, setShowWheel] = useState(false);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId, 'display');
    }
  }, [roomId]);

  if (!roomState && !grandSummary) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-medium">กำลังเชื่อมต่อจอแสดงผลห้อง {roomId}...</p>
      </div>
    );
  }

  if (roomState?.room?.status === 'ended' || grandSummary) {
    return (
      <GrandSummary
        summary={grandSummary || {
          room: roomState.room,
          champion: roomState.groups[0],
          top3: roomState.top3,
          allGroups: roomState.groups,
          totalGroups: roomState.totalGroups,
          totalMissionsCompleted: roomState.totalMissionsCompleted,
          totalScoreGiven: roomState.totalScoreGiven
        }}
        roomId={roomId}
        onRestart={onBack}
      />
    );
  }

  const { room, top3 = [], others = [], recentTransactions = [] } = roomState || {};
  const groups = roomState?.groups || [];
  const joinUrl = `${window.location.origin}/?join=${roomId}`;
  const highestScore = top3[0]?.score || 1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col">
      {/* Live celebratory Toast */}
      <LiveToast toast={latestScoreToast} />

      {/* Top Navbar */}
      <Navbar role="display" roomId={roomId} onBack={onBack} />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        {/* Top Header Bar: Room Info, Wheel Button & Join QR Banner */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40">
              <Trophy className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                {room?.title || `ห้องกิจกรรม ${roomId}`}
              </h1>
              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                <span className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-emerald-400" />
                  <span>{roomState?.totalGroups || 0} กลุ่ม</span>
                </span>
                <span>•</span>
                <span>ภารกิจสำเร็จ {roomState?.totalMissionsCompleted || 0} ครั้ง</span>
                {room?.status === 'paused' && (
                  <span className="bg-amber-900/80 text-amber-300 px-2 py-0.5 rounded-full text-xs font-semibold border border-amber-600">
                    ⏸️ พักกิจกรรมชั่วคราว
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Lucky Wheel Action Button on Screen */}
            <button
              onClick={() => setShowWheel(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 font-black text-sm shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>🎡 วงล้อสุ่ม</span>
            </button>

            {/* Join Prompt & Mini QR for screen */}
            <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-1.5 rounded-xl border border-slate-700/80">
              <div className="bg-white p-1 rounded-lg">
                <QRCodeSVG value={joinUrl} size={50} level="M" />
              </div>
              <div className="text-left">
                <div className="text-[10px] font-medium text-slate-400">สแกนเข้าห้อง</div>
                <div className="font-mono font-black text-xl text-amber-400 tracking-wider">
                  {roomId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Live Podium (Top 3) */}
        <section className="my-2">
          <Top3Podium top3={top3} />
        </section>

        {/* Bottom Section: Rank 4+ List and Recent Live Ticker */}
        <section className="space-y-4">
          <RankList others={others} highestScore={highestScore} />

          {/* Recent Mission Activity Ticker */}
          {recentTransactions.length > 0 && (
            <div className="p-3 rounded-xl glass-card border border-slate-800 text-xs flex items-center gap-3 overflow-hidden">
              <div className="flex items-center gap-1 font-bold text-amber-400 shrink-0 uppercase tracking-wider">
                <Flame className="w-4 h-4" />
                <span>กิจกรรมล่าสุด:</span>
              </div>
              <div className="flex-1 overflow-x-auto whitespace-nowrap flex items-center gap-4 scrollbar-none py-1">
                {recentTransactions.slice(0, 5).map((tx) => (
                  <div key={tx.id} className="inline-flex items-center gap-1.5 text-slate-300">
                    <span className="font-bold text-white">{tx.groupName}</span>
                    <span className="text-slate-400">({tx.missionName})</span>
                    <span className="bg-emerald-950 text-emerald-300 font-bold px-1.5 py-0.5 rounded text-[11px] border border-emerald-800">
                      +{tx.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Lucky Wheel Modal on Projector */}
      {showWheel && (
        <LuckyWheelModal
          roomId={roomId}
          groups={groups}
          onClose={() => setShowWheel(false)}
        />
      )}
    </div>
  );
};
