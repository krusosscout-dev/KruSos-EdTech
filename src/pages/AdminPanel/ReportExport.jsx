import React from 'react';
import { X, Download, FileText, Table, CheckCircle2 } from 'lucide-react';

export const ReportExport = ({ roomId, roomState, onClose }) => {
  const transactions = roomState?.recentTransactions || [];
  const groups = roomState?.groups || [];

  const handleDownloadCSV = () => {
    window.open(`/api/rooms/${roomId}/export/csv`, '_blank');
  };

  const handleDownloadJSON = () => {
    window.open(`/api/rooms/${roomId}/export/json`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-700 w-full max-w-2xl rounded-3xl p-6 shadow-2xl relative animate-pop space-y-5 max-h-[90vh] flex flex-col">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-3 rounded-2xl bg-emerald-950 border border-emerald-500/40 text-emerald-400">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">รายงานคะแนนและประวัติภารกิจ</h2>
            <p className="text-xs text-slate-400">
              ห้อง PIN: <span className="font-mono font-bold text-amber-300">{roomId}</span>
            </p>
          </div>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
          <button
            onClick={handleDownloadCSV}
            className="p-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all"
          >
            <Download className="w-5 h-5" />
            <span>ดาวน์โหลด CSV (Excel รองรับภาษาไทย)</span>
          </button>

          <button
            onClick={handleDownloadJSON}
            className="p-4 rounded-2xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 transition-all"
          >
            <Table className="w-5 h-5 text-indigo-400" />
            <span>ดาวน์โหลดไฟล์ JSON Raw Data</span>
          </button>
        </div>

        {/* Table Preview of Transactions */}
        <div className="flex-1 overflow-hidden flex flex-col min-h-0 bg-slate-950 rounded-2xl border border-slate-800 p-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-1">
            ตัวอย่างประวัติการให้คะแนน ({transactions.length} รายการ)
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {transactions.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs">
                ยังไม่มีประวัติการให้คะแนนในห้องนี้
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="font-mono text-slate-500 text-[11px]">
                      {new Date(tx.timestamp).toLocaleTimeString('th-TH')}
                    </span>
                    <span className="font-bold text-white truncate">{tx.groupName}</span>
                    <span className="text-indigo-300 truncate">({tx.missionName})</span>
                  </div>

                  <div className="font-mono font-bold text-emerald-400 shrink-0">
                    +{tx.points}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
