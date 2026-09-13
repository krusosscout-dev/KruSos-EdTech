import React, { useState, useEffect } from 'react';
import {
  AlertTriangle, Trash2, CheckCircle2, Info, X
} from 'lucide-react';

// Global Promise-based resolvers
let activeResolver = null;

export const confirmDialog = ({
  title = 'ยืนยันการดำเนินการ',
  message = '',
  detail = '',
  type = 'warning', // 'danger' | 'warning' | 'info' | 'success'
  confirmText = 'ยืนยัน',
  cancelText = 'ยกเลิก'
}) => {
  return new Promise((resolve) => {
    activeResolver = resolve;
    window.dispatchEvent(
      new CustomEvent('krusos-modern-dialog', {
        detail: {
          isOpen: true,
          isAlert: false,
          title,
          message,
          detail,
          type,
          confirmText,
          cancelText
        }
      })
    );
  });
};

export const alertDialog = ({
  title = 'แจ้งเตือน',
  message = '',
  detail = '',
  type = 'info', // 'info' | 'warning' | 'danger' | 'success'
  confirmText = 'รับทราบ'
}) => {
  return new Promise((resolve) => {
    activeResolver = resolve;
    window.dispatchEvent(
      new CustomEvent('krusos-modern-dialog', {
        detail: {
          isOpen: true,
          isAlert: true,
          title,
          message,
          detail,
          type,
          confirmText,
          cancelText: ''
        }
      })
    );
  });
};

export const ModernDialogContainer = () => {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    isAlert: false,
    title: '',
    message: '',
    detail: '',
    type: 'warning',
    confirmText: 'ตกลง',
    cancelText: 'ยกเลิก'
  });

  useEffect(() => {
    const handleOpen = (e) => {
      setDialogState(e.detail);
    };

    window.addEventListener('krusos-modern-dialog', handleOpen);
    return () => window.removeEventListener('krusos-modern-dialog', handleOpen);
  }, []);

  const handleClose = (result) => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
    if (activeResolver) {
      activeResolver(result);
      activeResolver = null;
    }
  };

  // Keyboard support: Enter = Confirm, Escape = Cancel
  useEffect(() => {
    if (!dialogState.isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleClose(false);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        handleClose(true);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen]);

  if (!dialogState.isOpen) return null;

  // Visual theming based on type
  const typeConfig = {
    danger: {
      border: 'border-rose-500/60 shadow-rose-500/20',
      iconBg: 'bg-rose-500/20 text-rose-400 border border-rose-500/40',
      icon: <Trash2 className="w-8 h-8" />,
      btnConfirm: 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-600/40'
    },
    warning: {
      border: 'border-amber-500/60 shadow-amber-500/20',
      iconBg: 'bg-amber-500/20 text-amber-300 border border-amber-500/40',
      icon: <AlertTriangle className="w-8 h-8" />,
      btnConfirm: 'bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-black shadow-amber-500/40'
    },
    info: {
      border: 'border-indigo-500/60 shadow-indigo-500/20',
      iconBg: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40',
      icon: <Info className="w-8 h-8" />,
      btnConfirm: 'bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white shadow-indigo-600/40'
    },
    success: {
      border: 'border-emerald-500/60 shadow-emerald-500/20',
      iconBg: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40',
      icon: <CheckCircle2 className="w-8 h-8" />,
      btnConfirm: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-600/40'
    }
  };

  const currentTheme = typeConfig[dialogState.type] || typeConfig.warning;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in select-none"
      onClick={() => handleClose(false)}
    >
      <div
        className={`relative w-full max-w-md rounded-3xl bg-slate-900/95 border-2 ${currentTheme.border} p-6 sm:p-7 shadow-2xl animate-pop text-center space-y-5`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button in top right */}
        <button
          type="button"
          onClick={() => handleClose(false)}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          title="ปิด (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Glowing Icon Badge */}
        <div className="flex justify-center">
          <div className={`w-16 h-16 rounded-2xl ${currentTheme.iconBg} flex items-center justify-center shadow-lg animate-pulse`}>
            {currentTheme.icon}
          </div>
        </div>

        {/* Title & Message */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-black text-white tracking-tight">
            {dialogState.title}
          </h3>
          <p className="text-sm text-slate-200 leading-relaxed whitespace-pre-line font-medium">
            {dialogState.message}
          </p>
          {dialogState.detail && (
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300 mt-2 text-left leading-relaxed">
              {dialogState.detail}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className={`grid gap-3 pt-2 ${dialogState.isAlert ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {!dialogState.isAlert && (
            <button
              type="button"
              onClick={() => handleClose(false)}
              className="w-full py-3 rounded-2xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs transition-all border border-slate-700/80 shadow-md"
            >
              {dialogState.cancelText || 'ยกเลิก'}
            </button>
          )}

          <button
            type="button"
            onClick={() => handleClose(true)}
            className={`w-full py-3 rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-1.5 ${currentTheme.btnConfirm}`}
            autoFocus
          >
            {dialogState.confirmText || 'ยืนยัน'}
          </button>
        </div>
      </div>
    </div>
  );
};
