import React, { useState, useEffect, useRef } from 'react';
import { X, Play, RotateCcw, Trophy, Sparkles, Award, Gift, Users, Plus, Trash2, CheckCircle2 } from 'lucide-react';
import { soundFX } from './AudioController';
import { triggerScoreConfetti, triggerVictoryFireworks } from './ConfettiEffect';
import { useSocket } from '../context/SocketContext';

const DEFAULT_REWARDS = [
  { text: '+10 แต้ม', color: '#10b981', icon: '⭐', points: 10 },
  { text: '+20 แต้ม', color: '#6366f1', icon: '⚡', points: 20 },
  { text: '+50 แต้ม', color: '#f59e0b', icon: '🔥', points: 50 },
  { text: 'โบนัส +100!', color: '#ec4899', icon: '👑', points: 100 },
  { text: 'ตอบคำถามชิงแต้ม', color: '#06b6d4', icon: '🎤', points: 0 },
  { text: '+30 แต้ม', color: '#8b5cf6', icon: '🎯', points: 30 },
  { text: 'คูณ 2 แต้มภารกิจถัดไป', color: '#f97316', icon: '🚀', points: 0 },
  { text: '+15 แต้ม', color: '#14b8a6', icon: '🌟', points: 15 },
];

export const LuckyWheelModal = ({ roomId, groups = [], onClose, onAwardPoints = null }) => {
  const { adminSubmitScore } = useSocket();
  const canvasRef = useRef(null);
  const [wheelMode, setWheelMode] = useState('groups'); // 'groups' | 'rewards'
  const [customItems, setCustomItems] = useState(DEFAULT_REWARDS);
  const [newItemText, setNewItemText] = useState('');
  const [newItemPoints, setNewItemPoints] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState(null);
  const [selectedGroupForReward, setSelectedGroupForReward] = useState(groups[0]?.id || '');
  const [awardedNotice, setAwardedNotice] = useState('');

  // Slices to draw
  const items = wheelMode === 'groups'
    ? groups.map(g => ({
        id: g.id,
        text: g.name,
        color: g.color || '#6366f1',
        icon: g.mascot || '🚀',
        rawGroup: g
      }))
    : customItems;

  const currentRotationRef = useRef(0);
  const animationFrameRef = useRef(null);
  const lastTickSegmentRef = useRef(-1);

  // Draw the Wheel Canvas
  const drawWheel = (rotationAngle) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) - 20;

    ctx.clearRect(0, 0, width, height);

    if (items.length === 0) {
      ctx.fillStyle = '#64748b';
      ctx.font = 'bold 16px Prompt';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('ไม่มีรายการในวงล้อ', centerX, centerY);
      return;
    }

    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(rotationAngle);

    // Draw Slices
    items.forEach((item, index) => {
      const startAngle = index * sliceAngle;
      const endAngle = startAngle + sliceAngle;

      // Slice sector
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, startAngle, endAngle);
      ctx.closePath();

      ctx.fillStyle = item.color || '#3b82f6';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#0f172a';
      ctx.stroke();

      // Slice Content (Text & Icon)
      ctx.save();
      ctx.rotate(startAngle + sliceAngle / 2);
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 15px Prompt, Kanit, sans-serif';
      ctx.shadowColor = 'rgba(0,0,0,0.8)';
      ctx.shadowBlur = 4;

      const label = `${item.icon ? item.icon + ' ' : ''}${item.text}`;
      const truncated = label.length > 14 ? label.substring(0, 13) + '..' : label;
      ctx.fillText(truncated, radius - 25, 0);
      ctx.restore();
    });

    // Outer Glow Ring
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, 2 * Math.PI);
    ctx.lineWidth = 8;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    // Center Hub
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, 2 * Math.PI);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f59e0b';
    ctx.stroke();

    ctx.restore();

    // Draw Top Pointer Triangle (Fixed at Top pointing down)
    ctx.save();
    ctx.translate(centerX, centerY - radius + 5);
    ctx.beginPath();
    ctx.moveTo(-16, -20);
    ctx.lineTo(16, -20);
    ctx.lineTo(0, 16);
    ctx.closePath();
    ctx.fillStyle = '#f59e0b';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();
    ctx.restore();
  };

  useEffect(() => {
    drawWheel(currentRotationRef.current);
  }, [items, wheelMode]);

  // Spin Physics
  const spinWheel = () => {
    if (isSpinning || items.length === 0) return;

    setIsSpinning(true);
    setWinner(null);
    setAwardedNotice('');

    const startAngle = currentRotationRef.current % (2 * Math.PI);
    const numSlices = items.length;
    const sliceAngle = (2 * Math.PI) / numSlices;

    // Pick random target slice index
    const targetSliceIndex = Math.floor(Math.random() * numSlices);

    // Compute end angle so that pointer (top at -PI/2) lands in the center of targetSliceIndex
    // In canvas: angle under top pointer is (-PI/2 - rotation) % 2PI
    const pointerOffset = -Math.PI / 2;
    const targetSliceCenter = targetSliceIndex * sliceAngle + sliceAngle / 2;
    
    // Add 6 to 9 full spins
    const fullSpins = (6 + Math.floor(Math.random() * 4)) * 2 * Math.PI;
    const finalAngle = fullSpins + (pointerOffset - targetSliceCenter) + (Math.random() * 0.4 - 0.2) * sliceAngle;

    const duration = 4800; // 4.8 seconds
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease Out Cubic physics deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentAngle = startAngle + (finalAngle - startAngle) * easeOut;

      currentRotationRef.current = currentAngle;
      drawWheel(currentAngle);

      // Play tick sound when passing slice lines
      const normalizedAngle = (-Math.PI / 2 - currentAngle) % (2 * Math.PI);
      const positiveAngle = (normalizedAngle + 2 * Math.PI) % (2 * Math.PI);
      const currentSegment = Math.floor(positiveAngle / sliceAngle);

      if (currentSegment !== lastTickSegmentRef.current) {
        lastTickSegmentRef.current = currentSegment;
        soundFX.playClick();
      }

      if (progress < 1) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        const winningItem = items[targetSliceIndex];
        setWinner(winningItem);
        soundFX.playFanfare();
        triggerScoreConfetti(0.5, 0.4);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  // Award Points to Winner
  const handleAwardBonusPoints = async (groupId, pts, missionTitle) => {
    if (!groupId) return;
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const res = await adminSubmitScore({
      roomId,
      groupId,
      missionName: missionTitle || '🎁 โบนัสจากวงล้อสุ่มหรรษา',
      points: pts,
      token: null,
      note: 'ได้รับจากวงล้อสุ่ม'
    });

    if (res.success) {
      setAwardedNotice(`🎉 มอบ ${pts} แต้มให้กลุ่ม "${group.name}" เรียบร้อยแล้ว!`);
      triggerVictoryFireworks();
    }
  };

  const handleAddCustomItem = (e) => {
    e.preventDefault();
    if (!newItemText.trim()) return;
    const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#06b6d4', '#8b5cf6', '#f97316'];
    const randomColor = colors[customItems.length % colors.length];
    setCustomItems([
      ...customItems,
      {
        text: newItemText.trim(),
        color: randomColor,
        icon: '🎁',
        points: parseInt(newItemPoints, 10) || 0
      }
    ]);
    setNewItemText('');
  };

  const handleRemoveCustomItem = (index) => {
    setCustomItems(customItems.filter((_, i) => i !== index));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl relative animate-pop space-y-4 max-h-[95vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span>วงล้อสุ่มหรรษา (Lucky Wheel)</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-950 border border-amber-600 text-amber-300 font-mono">
                ROOM: {roomId}
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              สุ่มกลุ่มตอบคำถาม หรือสุ่มแจกคะแนนโบนัสและภารกิจพิเศษ
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs shrink-0">
          <button
            onClick={() => {
              setWheelMode('groups');
              setWinner(null);
            }}
            disabled={isSpinning}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              wheelMode === 'groups'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>สุ่มกลุ่มในห้อง ({groups.length} กลุ่ม)</span>
          </button>

          <button
            onClick={() => {
              setWheelMode('rewards');
              setWinner(null);
            }}
            disabled={isSpinning}
            className={`flex-1 py-2 rounded-lg font-bold flex items-center justify-center gap-1.5 transition-all ${
              wheelMode === 'rewards'
                ? 'bg-amber-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-4 h-4" />
            <span>สุ่มคะแนนโบนัส / รางวัล</span>
          </button>
        </div>

        {/* Center: Canvas Wheel */}
        <div className="flex-1 flex flex-col items-center justify-center relative py-2">
          {items.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm">
              {wheelMode === 'groups'
                ? 'ยังไม่มีกลุ่มนักเรียนในห้องกิจกรรม กรุณาให้นักเรียนเข้าร่วมห้องก่อน'
                : 'ไม่มีรายการรางวัลในวงล้อ'}
            </div>
          ) : (
            <div className="relative">
              <canvas
                ref={canvasRef}
                width={340}
                height={340}
                className="max-w-full drop-shadow-2xl"
              />
            </div>
          )}

          {/* Winner Announcement Spotlight */}
          {winner && (
            <div className="mt-2 w-full glass-panel rounded-2xl p-4 border-2 border-amber-400 text-center animate-pop shadow-xl space-y-2">
              <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4" />
                <span>🎉 ผลการสุ่ม:</span>
              </div>
              <div className="text-2xl font-black text-white flex items-center justify-center gap-2">
                <span>{winner.icon}</span>
                <span>{winner.text}</span>
              </div>

              {/* Action if Group won */}
              {wheelMode === 'groups' && winner.rawGroup && (
                <div className="pt-2 flex items-center justify-center gap-2">
                  <button
                    onClick={() => handleAwardBonusPoints(winner.rawGroup.id, 20, '🎁 ผู้โชคดีจากวงล้อสุ่มกลุ่ม')}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-xs shadow hover:opacity-90 flex items-center gap-1.5"
                  >
                    <Award className="w-4 h-4" />
                    <span>มอบโบนัส +20 แต้มทันที</span>
                  </button>
                </div>
              )}

              {/* Action if Reward won */}
              {wheelMode === 'rewards' && winner.points > 0 && (
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2 text-xs">
                  <span className="text-slate-300">มอบให้กลุ่ม:</span>
                  <select
                    value={selectedGroupForReward}
                    onChange={(e) => setSelectedGroupForReward(e.target.value)}
                    className="px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white font-semibold outline-none"
                  >
                    {groups.map(g => (
                      <option key={g.id} value={g.id}>
                        {g.mascot} {g.name}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAwardBonusPoints(selectedGroupForReward, winner.points, `🎁 รางวัลวงล้อ: ${winner.text}`)}
                    className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold"
                  >
                    ยืนยันให้แต้ม (+{winner.points})
                  </button>
                </div>
              )}

              {awardedNotice && (
                <div className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1 mt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{awardedNotice}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Spin & Actions Control Bar */}
        <div className="shrink-0 pt-2 flex flex-col sm:flex-row gap-2.5">
          <button
            onClick={spinWheel}
            disabled={isSpinning || items.length === 0}
            className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-pink-600 hover:opacity-95 disabled:opacity-40 text-slate-950 font-black text-lg shadow-xl shadow-amber-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95"
          >
            {isSpinning ? (
              <div className="w-6 h-6 border-3 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Play className="w-6 h-6 fill-slate-950" />
                <span>หมุนวงล้อสุ่มเลย!</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
