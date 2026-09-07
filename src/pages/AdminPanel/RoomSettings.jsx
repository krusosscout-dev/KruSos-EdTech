import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Play, Pause, RotateCcw, Flag, QrCode, Copy, Check, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

export const RoomSettings = ({ roomId, room, onClose }) => {
  const { changeRoomStatus, resetScores } = useSocket();
  const [copied, setCopied] = React.useState(false);

  const joinUrl = `${window.location.origin}/?join=${roomId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(joinUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTogglePause = async () => {
    const nextStatus = room?.status === 'paused' ? 'active' : 'paused';
    await changeRoomStatus(roomId, nextStatus);
  };

  const handleResetScores = async () => {
    if (window.confirm('⚠️ คุณแน่ใจหรือไม่ว่าต้องการรีเซ็ตคะแนนทั้งหมดในห้องนี้เป็น 0? (การกระทำนี้ไม่สามารถย้อนกลับได้)')) {
      await resetScores(roomId);
    }
  };

  const handleEndSession = async () => {
    if (window.confirm('🏁 คุณต้องการ "ปิดกิจกรรม (End Session)" และประกาศผลผู้ชนะเลิศอย่างเป็นทางการใช่หรือไม่?')) {
      await changeRoomStatus(roomId, 'ended');
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-pop space-y-5">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-indigo-950 border border-indigo-500/40 text-indigo-400">
            <QrCode className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">การจัดการห้องกิจกรรม</h2>
            <p className="text-xs text-slate-400">
              รหัสห้อง (PIN): <span className="font-mono font-bold text-amber-300">{roomId}</span>
            </p>
          </div>
        </div>

        {/* Room QR Code Section for Display / Late joiners */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          <div className="bg-white p-2.5 rounded-2xl shadow-lg shrink-0">
            <QRCodeSVG value={joinUrl} size={110} level="M" />
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <div className="text-xs font-semibold text-slate-300">ลิงก์เข้าร่วมสำหรับนักเรียน:</div>
            <div className="font-mono text-xs text-indigo-300 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800 truncate">
              {joinUrl}
            </div>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 text-xs px-3 py-1 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-200 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'คัดลอกลิงก์แล้ว' : 'คัดลอกลิงก์'}</span>
            </button>
          </div>
        </div>

        {/* Activity Controls */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            ควบคุมสถานะกิจกรรม
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Pause / Resume */}
            <button
              onClick={handleTogglePause}
              className={`p-3.5 rounded-2xl border flex items-center justify-center gap-2 font-bold text-sm transition-all ${
                room?.status === 'paused'
                  ? 'bg-emerald-950/60 border-emerald-600 text-emerald-300 hover:bg-emerald-900/60'
                  : 'bg-amber-950/60 border-amber-600 text-amber-300 hover:bg-amber-900/60'
              }`}
            >
              {room?.status === 'paused' ? (
                <>
                  <Play className="w-4 h-4" />
                  <span>เริ่มกิจกรรมต่อ (Resume)</span>
                </>
              ) : (
                <>
                  <Pause className="w-4 h-4" />
                  <span>พักกิจกรรมชั่วคราว (Pause)</span>
                </>
              )}
            </button>

            {/* Reset Scores */}
            <button
              onClick={handleResetScores}
              className="p-3.5 rounded-2xl bg-slate-800 hover:bg-rose-950/50 border border-slate-700 hover:border-rose-600 text-slate-300 hover:text-rose-300 flex items-center justify-center gap-2 font-bold text-sm transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>รีเซ็ตคะแนนทั้งหมด</span>
            </button>
          </div>

          {/* End Session Button */}
          <button
            onClick={handleEndSession}
            disabled={room?.status === 'ended'}
            className="w-full mt-2 p-4 rounded-2xl bg-gradient-to-r from-rose-600 via-pink-600 to-amber-600 hover:opacity-95 disabled:opacity-40 text-white font-extrabold text-sm shadow-xl shadow-rose-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Flag className="w-5 h-5" />
            <span>{room?.status === 'ended' ? 'กิจกรรมสิ้นสุดแล้ว' : 'ปิดกิจกรรมและสรุปผล (End Session)'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
