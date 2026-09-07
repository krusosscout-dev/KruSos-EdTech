import React, { useState } from 'react';
import { Plus, FileText, Calendar, Award, Trash2, Edit3, CheckCircle2, BarChart2, X, AlertCircle } from 'lucide-react';

const CATEGORIES = ['ใบงาน', 'ชิ้นงาน/โครงงาน', 'กิจกรรมกลุ่ม', 'สอบย่อย', 'สอบกลางภาค', 'สอบปลายภาค', 'การบ้าน'];

export const AssignmentHub = ({ subject, onAddAssignment, onDeleteAssignment, onUpdateAssignment }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingAsg, setEditingAsg] = useState(null);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('ใบงาน');
  const [maxScore, setMaxScore] = useState(10);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [description, setDescription] = useState('');

  const { assignments = [], students = [], scores = {} } = subject;

  const handleOpenAdd = () => {
    setTitle(`งานที่ ${assignments.length + 1}: `);
    setCategory('ใบงาน');
    setMaxScore(10);
    setDate(new Date().toISOString().slice(0, 10));
    setDescription('');
    setEditingAsg(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (asg) => {
    setEditingAsg(asg);
    setTitle(asg.title);
    setCategory(asg.category || 'ใบงาน');
    setMaxScore(asg.maxScore || 10);
    setDate(asg.date || new Date().toISOString().slice(0, 10));
    setDescription(asg.description || '');
    setShowAddModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (editingAsg) {
      onUpdateAssignment(editingAsg.id, {
        title: title.trim(),
        category,
        maxScore: parseFloat(maxScore) || 10,
        date,
        description: description.trim()
      });
    } else {
      onAddAssignment({
        title: title.trim(),
        category,
        maxScore: parseFloat(maxScore) || 10,
        date,
        description: description.trim()
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-pop">
      {/* Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-5 rounded-3xl border border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-400" />
            <span>หน้ารวมภารกิจและชิ้นงานเก็บคะแนน ({assignments.length} งาน)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            ระบุรายละเอียดว่างานแต่ละชิ้นคืออะไร พร้อมกำหนดคะแนนเต็มเพื่อสร้างช่องคะแนนในสมุดเกรด
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="w-full sm:w-auto px-5 py-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ เพิ่มงานใหม่ / ช่องคะแนน</span>
        </button>
      </div>

      {/* Assignments List Grid */}
      {assignments.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-3">
          <FileText className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">ยังไม่มีรายการงานในวิชานี้</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            กดปุ่ม &quot;+ เพิ่มงานใหม่ / ช่องคะแนน&quot; ด้านบนเพื่อกำหนดงานชิ้นแรก
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map((asg, index) => {
            // Compute completion stats
            let submittedCount = 0;
            let sumScore = 0;
            students.forEach((std) => {
              const sc = scores[std.id]?.[asg.id];
              if (sc !== undefined && sc !== '') {
                submittedCount++;
                sumScore += parseFloat(sc);
              }
            });

            const avgScore = submittedCount > 0 ? (sumScore / submittedCount).toFixed(1) : 0;
            const percentage = students.length > 0 ? Math.round((submittedCount / students.length) * 100) : 0;

            return (
              <div
                key={asg.id}
                className="glass-card rounded-2xl p-5 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950 border border-indigo-700 text-indigo-300 font-mono font-bold text-xs">
                        งานที่ {index + 1}
                      </span>
                      <span className="px-2.5 py-0.5 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 text-[11px] font-medium">
                        {asg.category || 'ใบงาน'}
                      </span>
                      {asg.date && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                          <Calendar className="w-3 h-3" />
                          <span>{asg.date}</span>
                        </span>
                      )}
                    </div>

                    {/* Max Score Badge */}
                    <div className="bg-gradient-to-r from-amber-500/20 to-amber-400/20 border border-amber-500/40 text-amber-300 font-mono font-black text-sm px-3 py-1 rounded-xl shrink-0">
                      เต็ม {asg.maxScore} แต้ม
                    </div>
                  </div>

                  {/* Title & Description */}
                  <h4 className="font-bold text-base text-white mb-1.5">{asg.title}</h4>
                  <p className="text-xs text-slate-400 line-clamp-2">
                    {asg.description || 'ไม่มีคำอธิบายรายละเอียด'}
                  </p>
                </div>

                {/* Bottom Stats & Actions */}
                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      ตรวจแล้ว: <strong className="text-white">{submittedCount}/{students.length}</strong> คน ({percentage}%)
                    </span>
                    <span>•</span>
                    <span>
                      เฉลี่ย: <strong className="text-amber-400 font-mono">{avgScore}</strong>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(asg)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                      title="แก้ไขข้อมูลงาน"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบช่องคะแนน "${asg.title}"? คะแนนที่เคยกรอกในช่องนี้จะถูกลบออกด้วย`)) {
                          onDeleteAssignment(asg.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="ลบช่องคะแนนนี้"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal: Add/Edit Assignment */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop space-y-4">
            <button
              onClick={() => setShowAddModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>{editingAsg ? 'แก้ไขรายละเอียดงาน' : 'เพิ่มงานใหม่ / สร้างช่องคะแนน'}</span>
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่องาน / ภารกิจเก็บคะแนน
                </label>
                <input
                  type="text"
                  placeholder="เช่น ใบงานที่ 1: วงจรไฟฟ้าอย่างง่าย"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500 font-medium"
                  required
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ประเภทงาน
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    คะแนนเต็ม
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={maxScore}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || /^\d*\.?\d*$/.test(v)) setMaxScore(v);
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      const isUp = e.deltaY < 0;
                      const curr = parseFloat(maxScore) || 10;
                      const step = e.shiftKey ? 1 : 5;
                      const next = isUp ? Math.min(1000, curr + step) : Math.max(1, curr - step);
                      setMaxScore(next);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold text-xs outline-none focus:border-indigo-500 text-center no-spin cursor-pointer"
                    title="เลื่อนลูกกลิ้งเมาส์เพื่อเพิ่ม/ลดคะแนนเต็ม"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  วันที่สั่งงาน / วันที่ตรวจ
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  คำอธิบายหรือรายละเอียดงาน (ถ้ามี)
                </label>
                <textarea
                  rows={2}
                  placeholder="เช่น ให้นักเรียนตอบคำถาม 5 ข้อลงในสมุด หรือสร้างผังงาน..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 text-xs outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingAsg ? 'บันทึกการแก้ไข' : 'สร้างช่องคะแนน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
