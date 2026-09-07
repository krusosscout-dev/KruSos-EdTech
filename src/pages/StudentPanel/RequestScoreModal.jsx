import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, QrCode, Sparkles, Clock, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const PRESET_MISSIONS = [
  'ภารกิจที่ 1: ตอบคำถามท้าทาย',
  'ภารกิจที่ 2: ประกอบชิ้นงานทดลอง',
  'ภารกิจที่ 3: นำเสนอหน้าชั้นเรียน',
  'ภารกิจที่ 4: ช่วยเหลือเพื่อนร่วมห้อง',
  'ภารกิจที่ 5: พิชิตโจทย์พิเศษ'
];

export const RequestScoreModal = ({ roomId, group, onClose, roomMissions = [] }) => {
  const { requestScoreQr, roomState } = useSocket();
  const [missionName, setMissionName] = useState('');
  const [qrData, setQrData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(300); // 5 minutes validity

  const missionsList = (roomMissions && roomMissions.length > 0) ? roomMissions : PRESET_MISSIONS;

  // Handle countdown when QR is generated
  useEffect(() => {
    if (!qrData) return;
    setCountdown(300);
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setQrData(null);
          setError('QR Code หมดอายุแล้ว กรุณากดสร้างใหม่');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [qrData]);

  const handleGenerateQR = async (e) => {
    e?.preventDefault();
    if (!missionName.trim()) {
      setError('กรุณาระบุชื่อภารกิจที่ทำสำเร็จ');
      return;
    }

    setLoading(true);
    setError('');

    const res = await requestScoreQr({
      roomId,
      groupId: group.id,
      missionName: missionName.trim()
    });

    setLoading(false);
    if (res.success) {
      setQrData(res.token);
    } else {
      setError(res.error || 'ไม่สามารถสร้าง QR Code ได้');
    }
  };

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 mx-auto flex items-center justify-center text-indigo-400 mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-white">ขอรับคะแนนกิจกรรม</h2>
          <p className="text-xs text-slate-400">
            กลุ่ม: <span className="font-semibold text-indigo-300">{group.name}</span>
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!qrData ? (
          /* Step 1: Input Mission Form */
          <form onSubmit={handleGenerateQR} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">
                เลือกภารกิจด่วน หรือพิมพ์ภารกิจเอง:
              </label>

              {/* Quick Preset Chips */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {missionsList.map((m, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMissionName(typeof m === 'string' ? m : m.title)}
                    className={`text-xs px-2.5 py-1.5 rounded-lg border transition-all text-left ${
                      missionName === (typeof m === 'string' ? m : m.title)
                        ? 'bg-indigo-600 text-white border-indigo-400 shadow'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {typeof m === 'string' ? m : m.title}
                  </button>
                ))}
              </div>

              <input
                type="text"
                placeholder="พิมพ์ชื่อภารกิจหรือสิ่งที่ทำสำเร็จ..."
                value={missionName}
                onChange={(e) => setMissionName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-950 border border-slate-700 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 text-white text-sm outline-none transition-all"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || !missionName.trim()}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 disabled:opacity-50 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <span>สร้าง QR Code ขอรับคะแนน</span>
                </>
              )}
            </button>
          </form>
        ) : (
          /* Step 2: Display Dynamic QR Code */
          <div className="flex flex-col items-center space-y-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">ภารกิจที่ขอรับคะแนน:</div>
              <div className="font-bold text-amber-400 text-base">{missionName}</div>
            </div>

            {/* QR Code Container with Glowing Frame */}
            <div className="p-4 bg-white rounded-2xl shadow-2xl border-4 border-indigo-500 relative">
              <QRCodeSVG
                value={qrData}
                size={210}
                level="Q"
                includeMargin={false}
              />
            </div>

            {/* Dynamic Countdown Timer & Anti-Cheat badge */}
            <div className="w-full bg-slate-950/80 rounded-2xl p-3 border border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5 text-amber-400 font-mono font-bold">
                <Clock className="w-4 h-4 animate-spin" />
                <span>
                  หมดอายุใน {minutes}:{seconds < 10 ? `0${seconds}` : seconds} นาที
                </span>
              </div>
              <div className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-4 h-4" />
                <span>ป้องกันการสแกนซ้ำ</span>
              </div>
            </div>

            <p className="text-xs text-slate-400 text-center">
              📱 ยื่นหน้าจอนี้ให้คุณครูสแกนเพื่อรับคะแนน
            </p>

            <button
              onClick={() => {
                setQrData(null);
                setMissionName('');
              }}
              className="text-xs text-slate-400 hover:text-slate-200 underline pt-1"
            >
              เปลี่ยนภารกิจ / สร้าง QR ใหม่
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
