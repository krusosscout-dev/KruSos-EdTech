import React, { useState } from 'react';
import { Trophy, Volume2, VolumeX, Wifi, WifiOff, Users, ArrowLeft, Shield, Globe, Settings, Database, Check } from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import kruSauceLogo from '../assets/logo.js';

export const Navbar = ({ role = '', roomId = '', onBack = null }) => {
  const { connected, syncMode, customServerUrl, setServerUrl, soundMuted, toggleSound } = useSocket();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [inputUrl, setInputUrl] = useState(customServerUrl || '');
  const [fbConfigInput, setFbConfigInput] = useState(() => localStorage.getItem('kru_sauce_fb_config') || '');

  const handleSaveConfig = (e) => {
    e.preventDefault();
    setServerUrl(inputUrl);
    if (fbConfigInput.trim()) {
      localStorage.setItem('kru_sauce_fb_config', fbConfigInput.trim());
    } else {
      localStorage.removeItem('kru_sauce_fb_config');
    }
    setShowConfigModal(false);
    window.location.reload();
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800/80 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Left: Brand / Logo */}
          <div className="flex items-center space-x-3">
            {onBack && (
              <button
                onClick={onBack}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                title="ย้อนกลับ"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20 shrink-0">
                <img
                  src={kruSauceLogo}
                  alt="ครูซอสสอนสังคม"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <div>
                <div className="font-bold text-base sm:text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-indigo-200 to-pink-400 flex items-center gap-2">
                  <span>KruSos EdTech</span>
                </div>
                <div className="text-[11px] text-slate-400 flex items-center gap-1.5 font-normal">
                  <span className="text-amber-300 font-medium">ครูซอสสอนสังคม</span>
                  <span className="text-slate-600">•</span>
                  <span>โรงเรียนวัดบางปูน</span>
                  {roomId && (
                    <>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono bg-indigo-950/80 text-indigo-300 px-1.5 py-0.2 rounded border border-indigo-800/50 text-[10px] font-semibold">
                        PIN: {roomId}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Actions & Indicators */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Role Badge */}
            {role && (
              <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium bg-slate-800/80 border border-slate-700 text-slate-300">
                {role === 'admin' ? (
                  <>
                    <Shield className="w-3.5 h-3.5 text-rose-400" />
                    <span className="text-rose-300">แอดมิน (ครู)</span>
                  </>
                ) : (
                  <>
                    <Users className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-300">กลุ่มนักเรียน</span>
                  </>
                )}
              </div>
            )}

            {/* Cloud Server / Sync Config Button */}
            <button
              onClick={() => setShowConfigModal(true)}
              className="p-2 rounded-xl border border-slate-700 bg-slate-800/60 hover:bg-slate-700 text-slate-300 transition-all text-xs flex items-center gap-1"
              title="ตั้งค่าเซิร์ฟเวอร์ Real-time / Vercel"
            >
              <Globe className="w-4 h-4 text-indigo-400" />
            </button>

            {/* Sound FX Toggle */}
            <button
              onClick={toggleSound}
              className={`p-2 rounded-xl border transition-all ${
                soundMuted
                  ? 'bg-slate-800/50 border-slate-700 text-slate-400 hover:text-slate-200'
                  : 'bg-indigo-950/50 border-indigo-600/50 text-indigo-400 hover:text-indigo-300'
              }`}
              title={soundMuted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

            {/* Connection Status Indicator */}
            <div
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-medium border ${
                connected
                  ? 'bg-emerald-950/50 border-emerald-600/40 text-emerald-400'
                  : 'bg-amber-950/50 border-amber-600/40 text-amber-400'
              }`}
              title={
                connected
                  ? `เชื่อมต่อแบบ Real-time (${syncMode})`
                  : 'กำลังรอการเชื่อมต่อ (คลิกปุ่มลูกโลกด้านข้างเพื่อตั้งค่า Server URL)'
              }
            >
              {connected ? (
                <>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                  <span className="hidden md:inline">{syncMode === 'firebase' ? 'Firebase' : 'Live'}</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Offline</span>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cloud Server / Vercel Config Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-400" />
              <span>การเชื่อมต่อ Real-time สำหรับ Vercel</span>
            </h3>

            <p className="text-xs text-slate-400 leading-relaxed">
              หากเปิดใช้งานบน <strong>Vercel (vercel.app)</strong> คุณครูสามารถเชื่อมต่อกับ Real-time Backend (Render, Railway, Fly.io) หรือ Firebase Realtime Database ได้ที่นี่:
            </p>

            <form onSubmit={handleSaveConfig} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  1. WebSocket Server URL (เช่น Render / Railway):
                </label>
                <input
                  type="url"
                  placeholder="https://your-backend.onrender.com"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500 font-mono"
                />
                <span className="text-[10px] text-slate-500">ปล่อยว่างหากรันเครื่องเดียวกัน (Localhost)</span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  2. หรือใส่ Firebase Config JSON (Serverless 100%):
                </label>
                <textarea
                  rows={3}
                  placeholder='{"apiKey": "...", "databaseURL": "https://..."}'
                  value={fbConfigInput}
                  onChange={(e) => setFbConfigInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-indigo-300 text-xs outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowConfigModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ปิด
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-1"
                >
                  <Check className="w-4 h-4" />
                  <span>บันทึกและเชื่อมต่อ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
