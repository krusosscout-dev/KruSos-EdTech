import React, { useState } from 'react';
import {
  Search, Award, Sparkles, Info, X, FileText, Calendar,
  BarChart2, ArrowRight, Plus, CheckCircle2
} from 'lucide-react';
import { ScoreWheelInput } from '../../components/ScoreWheelInput';

// Category style mapping with vibrant, high-contrast badges
const getCategoryStyle = (category = '') => {
  const cat = (category || '').toLowerCase();
  if (cat.includes('ใบงาน')) return { bg: 'bg-blue-500/25 text-blue-200 border-blue-400/50', label: 'ใบงาน' };
  if (cat.includes('ชิ้นงาน')) return { bg: 'bg-emerald-500/25 text-emerald-200 border-emerald-400/50', label: 'ชิ้นงาน' };
  if (cat.includes('สอบย่อย')) return { bg: 'bg-amber-500/25 text-amber-200 border-amber-400/50', label: 'สอบย่อย' };
  if (cat.includes('โครงงาน')) return { bg: 'bg-purple-500/25 text-purple-200 border-purple-400/50', label: 'โครงงาน' };
  if (cat.includes('ปลายภาค') || cat.includes('กลางภาค')) return { bg: 'bg-rose-500/25 text-rose-200 border-rose-400/50', label: 'สอบวัดผล' };
  return { bg: 'bg-indigo-500/25 text-indigo-200 border-indigo-400/50', label: category || 'ภารกิจ' };
};

export const GradebookTable = ({ subject, onUpdateScore, onAddAssignment, onGoToGrading, onGoToAssignments }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  // Quick Add Assignment Modal State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('ใบงาน');
  const [newMaxScore, setNewMaxScore] = useState(10);
  const [newDesc, setNewDesc] = useState('');

  const { students = [], assignments = [], scores = {} } = subject;

  // Filter students by search term
  const filteredStudents = students.filter((s) => {
    const q = searchTerm.toLowerCase().trim();
    return (
      s.name.toLowerCase().includes(q) ||
      String(s.studentNumber).includes(q) ||
      String(s.studentCode || '').includes(q)
    );
  });

  const totalMaxScore = assignments.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);

  // Mouse wheel scroll handler (Wheel up: +1, Wheel down: -1)
  const handleWheel = (e, studentId, assignment) => {
    e.preventDefault();
    const delta = e.deltaY < 0 ? 1 : -1;
    const currentVal = scores[studentId]?.[assignment.id];
    let num = currentVal !== undefined && currentVal !== '' ? parseFloat(currentVal) : 0;
    num = Math.max(0, Math.min(assignment.maxScore, num + delta));
    onUpdateScore(studentId, assignment.id, num);
  };

  // Quick Add Assignment Handlers
  const handleOpenAddModal = () => {
    setNewTitle(`ใบงานที่ ${assignments.length + 1}: `);
    setNewCategory('ใบงาน');
    setNewMaxScore(10);
    setNewDesc('');
    setShowAddModal(true);
  };

  const handleQuickAddSubmit = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    if (onAddAssignment) {
      onAddAssignment({
        title: newTitle.trim(),
        category: newCategory,
        maxScore: parseFloat(newMaxScore) || 10,
        date: new Date().toISOString().slice(0, 10),
        description: newDesc.trim()
      });
    }
    setShowAddModal(false);
  };

  // Compute stats for assignment detail modal
  const getAssignmentStats = (asg) => {
    if (!asg) return null;
    let submittedCount = 0;
    let sum = 0;
    let max = 0;
    let min = asg.maxScore;
    let fullCount = 0;

    students.forEach((s) => {
      const val = scores[s.id]?.[asg.id];
      if (val !== undefined && val !== '') {
        const num = parseFloat(val);
        submittedCount++;
        sum += num;
        if (num > max) max = num;
        if (num < min) min = num;
        if (num >= asg.maxScore) fullCount++;
      }
    });

    const avg = submittedCount > 0 ? (sum / submittedCount).toFixed(1) : '0.0';
    return {
      submittedCount,
      totalCount: students.length,
      percentage: students.length > 0 ? ((submittedCount / students.length) * 100).toFixed(0) : 0,
      avg,
      max: submittedCount > 0 ? max : 0,
      min: submittedCount > 0 ? min : 0,
      fullCount
    };
  };

  const activeStats = selectedAssignment ? getAssignmentStats(selectedAssignment) : null;

  return (
    <div className="space-y-5 animate-pop">
      {/* Search and Summary Bar with High Contrast & Brightness */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-slate-800 p-4 rounded-2xl border-2 border-slate-700 shadow-xl">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาเลขที่ หรือชื่อนักเรียน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30"
          />
        </div>

        <div className="flex items-center gap-2.5 text-xs flex-wrap justify-end">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 font-semibold shadow-sm">
            <span>นักเรียน:</span>
            <strong className="text-white font-mono text-sm">{students.length}</strong>
            <span>คน</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 font-semibold shadow-sm">
            <span>งานที่บันทึก:</span>
            <strong className="text-white font-mono text-sm">{assignments.length}</strong>
            <span>ช่อง</span>
          </span>

          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-900/60 border border-amber-500/40 text-amber-200 font-semibold shadow-sm">
            <span>คะแนนเต็มรวม:</span>
            <strong className="text-amber-300 font-mono text-base font-black">{totalMaxScore}</strong>
            <span>แต้ม</span>
          </span>

          {onAddAssignment && (
            <button
              onClick={handleOpenAddModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95"
              title="เพิ่มช่องคะแนนงานใหม่ลงในตารางนี้ทันที (เพิ่มได้ไม่จำกัดจำนวนช่อง)"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มช่องคะแนน</span>
            </button>
          )}

          {onGoToGrading && (
            <button
              onClick={onGoToGrading}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs shadow-md flex items-center gap-1.5 transition-transform active:scale-95 ml-1"
              title="เปิดหน้าสรุปผลและตัดเกรด 100 คะแนน"
            >
              <Award className="w-4 h-4" />
              <span>ไปที่หน้าตัดเกรด (100 คะแนน)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {assignments.length === 0 ? (
        <div className="bg-slate-800 rounded-3xl p-12 text-center border-2 border-slate-700 text-slate-300 space-y-3 shadow-xl">
          <Award className="w-12 h-12 text-indigo-400 mx-auto" />
          <h3 className="text-lg font-bold text-white">ยังไม่มีช่องคะแนนงานในวิชานี้</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            กรุณาไปที่แท็บ &quot;หน้ารวมงาน&quot; ด้านบน แล้วกดปุ่ม &quot;+ เพิ่มงานใหม่&quot; เพื่อสร้างช่องคะแนนเก็บ
          </p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-slate-800 rounded-3xl p-12 text-center border-2 border-slate-700 text-slate-300 space-y-3 shadow-xl">
          <h3 className="text-lg font-bold text-white">ยังไม่มีรายชื่อนักเรียนในวิชานี้</h3>
          <p className="text-xs text-slate-400">
            กรุณาไปที่แท็บ &quot;รายชื่อนักเรียน&quot; เพื่อเพิ่มนักเรียนหรืออัปโหลดไฟล์ Excel
          </p>
        </div>
      ) : (
        /* Gradebook Table Container with Clear Separation & Scroll */
        <div className="bg-slate-800 rounded-2xl border-2 border-slate-700 shadow-2xl overflow-hidden relative">
          {/* Top Instruction Banner */}
          <div className="px-5 py-2.5 bg-slate-800 border-b border-slate-700 flex items-center justify-between text-xs text-slate-300 flex-wrap gap-2">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>💡 <strong>วิธีใส่คะแนน:</strong> พิมพ์ตัวเลข หรือ <strong>เลื่อนลูกกลิ้งเมาส์ (Scroll)</strong> บนช่องคะแนนเพื่อปรับขึ้น-ลงได้ทันที</span>
            </span>
            <span className="text-slate-400">
              คลิกที่หัวตารางชื่องาน เพื่อดูรายละเอียดและสถิติคะแนน
            </span>
          </div>

          <div className="overflow-x-auto max-w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-800 text-slate-200 border-b-2 border-slate-600 uppercase font-bold text-xs">
                  {/* Pinned Left: Student Number */}
                  <th className="p-3.5 w-14 min-w-[52px] max-w-[52px] text-center sticky left-0 bg-slate-800 z-30 border-r border-slate-700 shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                    เลขที่
                  </th>

                  {/* Pinned Left: Student Name (Large Font 15px) */}
                  <th className="p-3.5 min-w-[190px] max-w-[210px] sticky left-14 bg-slate-800 z-30 border-r-2 border-slate-600 shadow-[inset_-2px_0_0_0_#64748b,4px_0_10px_rgba(0,0,0,0.35)] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none">
                    ชื่อ - นามสกุล
                  </th>

                  {/* Dynamic Assignment Columns (Sleek 92px width) */}
                  {assignments.map((a, aIdx) => {
                    const cat = getCategoryStyle(a.category);

                    return (
                      <th
                        key={a.id}
                        onClick={() => setSelectedAssignment(a)}
                        className={`p-2.5 w-[92px] min-w-[92px] max-w-[98px] text-center border-r border-slate-700 ${
                          aIdx === 0 ? 'border-l-2 border-slate-600' : ''
                        } hover:bg-slate-700/80 transition-colors cursor-pointer group select-none`}
                        title="คลิกเพื่อดูรายละเอียดงานและสถิติคะแนน"
                      >
                        <div className="mb-1">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${cat.bg}`}>
                            {cat.label}
                          </span>
                        </div>

                        <div className="font-bold text-white group-hover:text-indigo-300 text-xs leading-tight line-clamp-2 transition-colors">
                          {a.title}
                        </div>

                        <div className="mt-1 text-[11px] text-amber-300 font-mono font-bold">
                          เต็ม {a.maxScore}
                        </div>
                      </th>
                    );
                  })}

                  {/* Quick Add Assignment Column Header */}
                  {onAddAssignment && (
                    <th
                      onClick={handleOpenAddModal}
                      className="p-2 w-16 min-w-[64px] text-center border-r border-slate-700 bg-slate-800/80 hover:bg-indigo-900/60 transition-colors cursor-pointer group select-none text-slate-400 hover:text-indigo-300"
                      title="คลิกเพื่อเพิ่มช่องคะแนนงานใหม่ (เพิ่มได้ไม่จำกัดจำนวนช่อง)"
                    >
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="w-6 h-6 rounded-lg bg-indigo-600/30 group-hover:bg-indigo-600 border border-indigo-400/40 flex items-center justify-center transition-all">
                          <Plus className="w-3.5 h-3.5 text-indigo-300 group-hover:text-white" />
                        </div>
                        <span className="text-[10px] font-bold">+ เพิ่มงาน</span>
                      </div>
                    </th>
                  )}

                  {/* Pinned Right: Total Assignment Points */}
                  <th className="p-3.5 w-24 min-w-[96px] text-center font-black text-amber-300 sticky right-0 bg-slate-800 z-30 border-l-2 border-slate-600 shadow-[inset_2px_0_0_0_#64748b,-4px_0_10px_rgba(0,0,0,0.35)] before:content-[''] before:absolute before:top-0 before:left-0 before:bottom-0 before:w-[2px] before:bg-slate-500 before:pointer-events-none">
                    <div>รวมคะแนน</div>
                    <div className="text-[10px] text-amber-400 font-mono font-normal">({totalMaxScore})</div>
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/60 font-sans">
                {filteredStudents.map((std) => {
                  let studentTotal = 0;

                  return (
                    <tr
                      key={std.id}
                      className="group bg-slate-800 hover:bg-slate-750 transition-colors"
                    >
                      {/* Pinned Left: Number (Large & Bold) */}
                      <td
                        className="p-3 text-center font-mono font-bold text-sm sm:text-base text-slate-200 sticky left-0 z-20 border-r border-slate-700 bg-slate-800 group-hover:bg-slate-750 transition-colors shadow-[2px_0_6px_rgba(0,0,0,0.3)]"
                      >
                        {std.studentNumber}
                      </td>

                      {/* Pinned Left: Student Name (Large Font 15-16px, crisp white) */}
                      <td
                        className="p-3 sticky left-14 z-20 border-r-2 border-slate-600 bg-slate-800 group-hover:bg-slate-750 transition-colors shadow-[inset_-2px_0_0_0_#64748b,4px_0_10px_rgba(0,0,0,0.35)] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none min-w-[190px] max-w-[210px]"
                      >
                        <div className="truncate text-white font-bold text-sm sm:text-base">
                          {std.title || ''}{std.name}
                        </div>
                        {std.studentCode && (
                          <div className="text-xs text-indigo-300 font-mono">
                            รหัส {std.studentCode}
                          </div>
                        )}
                      </td>

                      {/* Assignment Score Cells (Mouse-Wheel Scrollable, No Stepper Arrows, Clean & Professional) */}
                      {assignments.map((a, aIdx) => {
                        const rawScore = scores[std.id]?.[a.id];
                        const hasScore = rawScore !== undefined && rawScore !== '';
                        const currentVal = hasScore ? parseFloat(rawScore) : 0;
                        studentTotal += currentVal;

                        const isFull = hasScore && currentVal >= a.maxScore;

                        return (
                          <td
                            key={a.id}
                            className={`p-2 text-center border-r border-slate-700 ${
                              aIdx === 0 ? 'border-l-2 border-slate-600' : ''
                            } w-[92px] min-w-[92px] max-w-[98px]`}
                          >
                            <ScoreWheelInput
                              value={hasScore ? rawScore : ''}
                              maxScore={parseFloat(a.maxScore) || 10}
                              minScore={0}
                              step={parseFloat(a.maxScore) <= 5 ? 0.5 : 1}
                              onChange={(newVal) => onUpdateScore(std.id, a.id, newVal)}
                            />
                          </td>
                        );
                      })}

                      {/* Empty/Add Cell aligned with Quick Add Column */}
                      {onAddAssignment && (
                        <td
                          onClick={handleOpenAddModal}
                          className="p-2 text-center border-r border-slate-700/60 hover:bg-indigo-900/30 cursor-pointer text-slate-500 hover:text-indigo-300 transition-colors w-16 min-w-[64px]"
                          title="คลิกเพื่อเพิ่มช่องคะแนนงานใหม่"
                        >
                          <Plus className="w-3.5 h-3.5 mx-auto opacity-40 hover:opacity-100" />
                        </td>
                      )}

                      {/* Pinned Right: Total Assignment Score */}
                      <td
                        className="p-3 text-center font-mono font-black text-lg text-amber-300 sticky right-0 z-20 border-l-2 border-slate-600 bg-slate-800 group-hover:bg-slate-750 transition-colors shadow-[inset_2px_0_0_0_#64748b,-4px_0_10px_rgba(0,0,0,0.35)] before:content-[''] before:absolute before:top-0 before:left-0 before:bottom-0 before:w-[2px] before:bg-slate-500 before:pointer-events-none w-24 min-w-[96px]"
                      >
                        {studentTotal}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Assignment Detail & Stats Modal (When clicking assignment column header) */}
      {selectedAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop">
          <div className="bg-slate-850 border-2 border-slate-600 w-full max-w-lg rounded-3xl p-6 space-y-5 shadow-2xl relative text-white">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <span className={`inline-block px-2.5 py-1 rounded-lg text-xs font-bold border ${getCategoryStyle(selectedAssignment.category).bg}`}>
                  {selectedAssignment.category || 'ภารกิจ'}
                </span>
                <h3 className="text-xl font-black text-white leading-snug">
                  {selectedAssignment.title}
                </h3>
              </div>

              <button
                onClick={() => setSelectedAssignment(null)}
                className="p-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <div className="text-xs text-slate-400 mb-0.5">คะแนนเต็ม</div>
                <div className="text-2xl font-black font-mono text-amber-400">
                  {selectedAssignment.maxScore} <span className="text-xs font-normal text-slate-300">คะแนน</span>
                </div>
              </div>

              <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700">
                <div className="text-xs text-slate-400 mb-0.5">กำหนดส่ง / วันที่</div>
                <div className="text-sm font-semibold font-mono text-slate-200 mt-1 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-indigo-400" />
                  <span>{selectedAssignment.date || 'ไม่ระบุวันที่'}</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-1.5">
              <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-indigo-400" />
                <span>คำอธิบายงาน / เกณฑ์การประเมิน:</span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {selectedAssignment.description || 'ไม่มีคำอธิบายเพิ่มเติมสำหรับงานชิ้นนี้'}
              </p>
            </div>

            {activeStats && (
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <BarChart2 className="w-4 h-4 text-emerald-400" />
                  <span>สถิติผลคะแนนของห้องในงานนี้:</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400">ส่งแล้ว / ทั้งหมด</div>
                    <div className="font-mono font-bold text-emerald-400 text-sm mt-0.5">
                      {activeStats.submittedCount} / {activeStats.totalCount} ({activeStats.percentage}%)
                    </div>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400">คะแนนเฉลี่ย</div>
                    <div className="font-mono font-bold text-indigo-300 text-sm mt-0.5">
                      {activeStats.avg}
                    </div>
                  </div>

                  <div className="bg-slate-800 p-3 rounded-xl border border-slate-700">
                    <div className="text-[10px] text-slate-400">สูงสุด / ต่ำสุด</div>
                    <div className="font-mono font-bold text-amber-300 text-sm mt-0.5">
                      {activeStats.max} / {activeStats.min}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="pt-2 flex items-center justify-end gap-2">
              {onGoToAssignments && (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAssignment(null);
                    onGoToAssignments();
                  }}
                  className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow"
                >
                  <FileText className="w-4 h-4" />
                  <span>จัดการในหน้ารวมงาน</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedAssignment(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-750 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Quick Add Assignment Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-pop">
          <div className="bg-slate-800 border-2 border-slate-600 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl relative text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-700">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center shadow-lg">
                  <Plus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">เพิ่มช่องคะแนนงานใหม่</h3>
                  <p className="text-[11px] text-slate-400">สร้างคอลัมน์เก็บคะแนนลงในตารางนี้ทันที</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                title="ปิด"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่องาน / ภารกิจ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ใบงานที่ 6: การแก้ปัญหาด้วยผังงาน"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ประเภทงาน
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white outline-none focus:border-indigo-400"
                  >
                    <option value="ใบงาน">ใบงาน</option>
                    <option value="ชิ้นงาน/โครงงาน">ชิ้นงาน/โครงงาน</option>
                    <option value="กิจกรรมกลุ่ม">กิจกรรมกลุ่ม</option>
                    <option value="สอบย่อย">สอบย่อย</option>
                    <option value="สอบกลางภาค">สอบกลางภาค</option>
                    <option value="สอบปลายภาค">สอบปลายภาค</option>
                    <option value="การบ้าน">การบ้าน</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    คะแนนเต็ม <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    value={newMaxScore}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || /^\d*\.?\d*$/.test(v)) setNewMaxScore(v);
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      const isUp = e.deltaY < 0;
                      const curr = parseFloat(newMaxScore) || 10;
                      const next = isUp ? Math.min(1000, curr + 5) : Math.max(1, curr - 5);
                      setNewMaxScore(next);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white font-mono font-bold outline-none focus:border-indigo-400 no-spin"
                    title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับคะแนนเต็ม"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  คำอธิบายเพิ่มเติม (ถ้ามี)
                </label>
                <textarea
                  rows="2"
                  placeholder="รายละเอียดคำสั่ง หรือเกณฑ์การให้คะแนน..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white placeholder-slate-500 outline-none focus:border-indigo-400 resize-none"
                />
              </div>

              {/* Informational badge answering user question */}
              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-[11px] text-indigo-200 flex items-start gap-2">
                <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  💡 <strong>เพิ่มได้ไม่จำกัดจำนวนช่อง:</strong> คุณครูสามารถเพิ่มช่องคะแนนได้มากเท่าที่ต้องการ ตารางจะเลื่อนแนวนอนอัตโนมัติอย่างสวยงาม
                </span>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>สร้างช่องคะแนนทันที</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
