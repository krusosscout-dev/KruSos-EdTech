import React, { useRef, useEffect } from 'react';

/**
 * ScoreWheelInput
 * Modern, spinner-free score input component.
 * - Absolutely NO native up/down stepper arrows.
 * - Supports mouse wheel scrolling (Wheel Up: +score, Wheel Down: -score).
 * - Non-passive event listener prevents page scroll while adjusting score.
 * - Allows direct keyboard typing with decimal support.
 * - Provides immediate visual feedback (empty, active score, full score highlight).
 */
export const ScoreWheelInput = ({
  value,
  maxScore = 10,
  minScore = 0,
  step,
  onChange,
  placeholder = '-',
  className = '',
  title
}) => {
  const inputRef = useRef(null);

  // Determine smart step: if maxScore <= 5, step by 0.5, else step by 1
  const defaultStep = step !== undefined ? step : (maxScore <= 5 ? 0.5 : 1);

  // Attach non-passive wheel listener to prevent window/table scroll while adjusting score
  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;

    const onWheel = (e) => {
      e.preventDefault();
      e.stopPropagation();

      const isUp = e.deltaY < 0;
      // If Shift key is pressed, fine-tune by 0.5, else use defaultStep
      const effectiveStep = e.shiftKey ? 0.5 : defaultStep;

      let current = (value !== undefined && value !== '' && value !== null) ? parseFloat(value) : 0;
      if (isNaN(current)) current = 0;

      let next;
      if (isUp) {
        next = Math.min(maxScore, Math.round((current + effectiveStep) * 10) / 10);
      } else {
        next = Math.max(minScore, Math.round((current - effectiveStep) * 10) / 10);
      }

      onChange(next);
    };

    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [value, maxScore, minScore, defaultStep, onChange]);

  const hasScore = value !== undefined && value !== '' && value !== null;
  const numVal = hasScore ? parseFloat(value) : null;
  const isFull = hasScore && numVal >= maxScore;

  // Keyboard Up/Down arrow support
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      let current = (value !== undefined && value !== '' && value !== null) ? parseFloat(value) : 0;
      if (isNaN(current)) current = 0;
      const next = Math.min(maxScore, Math.round((current + defaultStep) * 10) / 10);
      onChange(next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let current = (value !== undefined && value !== '' && value !== null) ? parseFloat(value) : 0;
      if (isNaN(current)) current = 0;
      const next = Math.max(minScore, Math.round((current - defaultStep) * 10) / 10);
      onChange(next);
    }
  };

  // Direct typing with decimal tolerance
  const handleInputChange = (e) => {
    const raw = e.target.value.trim();
    if (raw === '') {
      onChange('');
      return;
    }
    // Allow numbers and trailing decimal point (e.g. "8.")
    if (/^\d*\.?\d*$/.test(raw)) {
      const parsed = parseFloat(raw);
      if (!isNaN(parsed)) {
        if (parsed > maxScore) {
          onChange(maxScore);
        } else if (parsed < minScore) {
          onChange(minScore);
        } else {
          onChange(raw.endsWith('.') ? raw : parsed);
        }
      }
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      inputMode="decimal"
      value={hasScore ? value : ''}
      placeholder={placeholder}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      className={`w-14 h-9 text-center font-bold text-base rounded-xl border transition-all outline-none cursor-pointer no-spin select-none ${
        isFull
          ? 'bg-emerald-500/20 border-emerald-500 text-emerald-200 font-black shadow-sm ring-1 ring-emerald-500/30'
          : hasScore
          ? 'bg-slate-700 border-slate-500 text-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 font-bold'
          : 'bg-slate-800 border-slate-600 hover:border-slate-500 text-slate-400'
      } ${className}`}
      title={title || `เลื่อนลูกกลิ้งเมาส์ (Scroll) เพื่อเพิ่ม/ลดคะแนน (คะแนนเต็ม ${maxScore})`}
    />
  );
};
