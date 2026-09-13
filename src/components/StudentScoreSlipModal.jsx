import React, { useState } from 'react';
import { Printer, X, Download, FileText, CheckCircle2 } from 'lucide-react';
import kruSauceLogo from '../assets/logo.js';

export const StudentScoreSlipModal = ({
  isOpen,
  onClose,
  subject = {},
  studentResults = []
}) => {
  const [selectedStudentId, setSelectedStudentId] = useState('ALL');

  if (!isOpen) return null;

  const safeSubject = subject || {};
  const { students = [], gradingConfig = {} } = safeSubject;

  const filteredResults = selectedStudentId === 'ALL'
    ? studentResults
    : studentResults.filter((r) => r.id === selectedStudentId);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="glass-panel w-full max-w-5xl max-h-[92vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-pop">
        {/* Top Modal Controls (Hidden when printing) */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-900 print:hidden">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-white">
                พิมพ์สลิปรายงานผลการเรียนรายบุคคล (Score Slips)
              </h3>
              <p className="text-xs text-slate-400">
                {safeSubject.name} • ชั้น {safeSubject.gradeLevel} (จัดหน้าพิมพ์ 2 คนต่อ 1 แผ่น A4)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Filter by specific student */}
            <select
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
              className="px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400 cursor-pointer"
            >
              <option value="ALL">พิมพ์ทั้งห้อง ({studentResults.length} คน)</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  เลขที่ {s.studentNumber} {s.title || ''}{s.name}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-black text-xs shadow-lg flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>สั่งพิมพ์ (Print)</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 bg-slate-950 text-slate-900 print:bg-white print:p-0 print:m-0">
          <div className="grid grid-cols-1 gap-6 print:gap-8">
            {filteredResults.map((r, index) => {
              const std = students.find((s) => s.id === r.id) || {};
              return (
                <div
                  key={r.id}
                  className="bg-white text-slate-900 p-6 rounded-2xl border-2 border-slate-300 shadow-md print:shadow-none print:border-slate-800 print:p-6 space-y-4 page-break-inside-avoid relative"
                  style={{ pageBreakInside: 'avoid', breakInside: 'avoid' }}
                >
                  {/* Slip Header */}
                  <div className="flex items-center justify-between border-b-2 border-slate-800 pb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={kruSauceLogo}
                        alt="Logo"
                        className="w-12 h-12 rounded-full object-cover border border-slate-300 shadow-sm"
                      />
                      <div>
                        <div className="font-black text-sm text-slate-900 tracking-tight">
                          โรงเรียนวัดบางปูน สำนักงานเขตพื้นที่การศึกษาประถมศึกษาสุพรรณบุรี เขต 1
                        </div>
                        <div className="font-extrabold text-base text-indigo-900">
                          ใบแจ้งผลการเรียนและการประเมินรายบุคคล
                        </div>
                        <div className="text-xs text-slate-600">
                          วิชา: <strong>{safeSubject.name}</strong> ({safeSubject.code || 'ว16101'}) • ภาคเรียนที่ {safeSubject.semester}/{safeSubject.academicYear}
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <div className="font-bold text-slate-700">ชั้น: {safeSubject.gradeLevel}</div>
                      <div className="font-mono font-black text-sm text-indigo-800">
                        เลขที่ {r.studentNumber}
                      </div>
                      <div className="font-mono text-[11px] text-slate-500">
                        รหัส: {std.studentCode || '-'}
                      </div>
                    </div>
                  </div>

                  {/* Student Name Banner */}
                  <div className="bg-slate-100 p-2.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      ชื่อ - สกุล นักเรียน: <strong className="text-sm font-black text-slate-900">{r.title || ''}{r.name}</strong>
                    </div>
                    <div>
                      เพศ: <strong>{r.gender === 'ญ' ? 'หญิง' : 'ชาย'}</strong>
                    </div>
                  </div>

                  {/* Score Breakdown Table */}
                  <table className="w-full text-left text-xs border-collapse border border-slate-300">
                    <thead>
                      <tr className="bg-slate-100 text-slate-800 font-bold border-b border-slate-300">
                        <th className="p-2 border-r border-slate-300">หมวดการประเมิน</th>
                        <th className="p-2 text-center w-24 border-r border-slate-300">คะแนนเต็ม</th>
                        <th className="p-2 text-center w-24 border-r border-slate-300">คะแนนที่ได้</th>
                        <th className="p-2 text-center w-36">ผลการประเมิน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {/* Formative rows */}
                      {Object.entries(r.sectionScores || {}).map(([secId, sData]) => {
                        const secConfig = (safeSubject.gradingConfig?.formativeSections || []).find((s) => s.id === secId);
                        const secTitle = secConfig?.title || 'คะแนนเก็บ';
                        const secWeight = secConfig?.weight || sData.rawMax || 0;
                        return (
                          <tr key={secId}>
                            <td className="p-2 border-r border-slate-300 text-slate-700">
                              📝 {secTitle}
                            </td>
                            <td className="p-2 text-center font-mono border-r border-slate-300">{secWeight}</td>
                            <td className="p-2 text-center font-mono font-bold text-indigo-900 border-r border-slate-300">
                              {sData.calculated}
                            </td>
                            <td className="p-2 text-center text-[11px] text-slate-600">
                              {sData.calculated >= secWeight * 0.5 ? '✓ ผ่านเกณฑ์' : '⚠️ ต้องปรับปรุง'}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Exam rows */}
                      {Object.entries(r.examScores || {}).map(([colId, num]) => {
                        const colConfig = (safeSubject.gradingConfig?.examColumns || []).find((c) => c.id === colId);
                        const colTitle = colConfig?.title || 'คะแนนสอบ';
                        const colMax = colConfig?.maxScore || 30;
                        return (
                          <tr key={colId}>
                            <td className="p-2 border-r border-slate-300 text-slate-700">
                              🎯 {colTitle}
                            </td>
                            <td className="p-2 text-center font-mono border-r border-slate-300">{colMax}</td>
                            <td className="p-2 text-center font-mono font-bold text-amber-900 border-r border-slate-300">
                              {num}
                            </td>
                            <td className="p-2 text-center text-[11px] text-slate-600">
                              {num >= colMax * 0.5 ? '✓ ผ่านเกณฑ์' : '⚠️ ต้องปรับปรุง'}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Grand Total & Grade */}
                      <tr className="bg-slate-50 font-black border-t-2 border-slate-300">
                        <td className="p-2.5 border-r border-slate-300 text-slate-900">
                          รวมคะแนนสุทธิ (ฐาน 100 คะแนนเต็ม)
                        </td>
                        <td className="p-2.5 text-center font-mono border-r border-slate-300">100</td>
                        <td className="p-2.5 text-center font-mono text-base text-indigo-900 border-r border-slate-300">
                          {r.finalScore}
                        </td>
                        <td className="p-2.5 text-center font-mono text-base text-emerald-800">
                          เกรด {r.grade}
                        </td>
                      </tr>
                    </tbody>
                  </table>

                  {/* MoE 3 Standard Assessments Summary */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                    <div className="text-center">
                      <div className="text-slate-500">คุณลักษณะอันพึงประสงค์</div>
                      <div className="font-bold text-emerald-700">ดีเยี่ยม (3)</div>
                    </div>
                    <div className="text-center border-x border-slate-300">
                      <div className="text-slate-500">สมรรถนะสำคัญผู้เรียน</div>
                      <div className="font-bold text-emerald-700">ผ่านดี (3)</div>
                    </div>
                    <div className="text-center">
                      <div className="text-slate-500">อ่าน คิดวิเคราะห์ เขียน</div>
                      <div className="font-bold text-emerald-700">ดีเยี่ยม (3)</div>
                    </div>
                  </div>

                  {/* Signature Section */}
                  <div className="pt-4 flex items-end justify-between text-xs text-slate-800">
                    <div className="text-center space-y-1">
                      <div>ลงชื่อ........................................................ ครูผู้สอน</div>
                      <div className="font-bold">(นายนรากรณ์ จูงาม)</div>
                      <div className="text-[10px] text-slate-500">ครูโรงเรียนวัดบางปูน</div>
                    </div>

                    <div className="text-center space-y-1">
                      <div>ลงชื่อ........................................................ ผู้ปกครอง</div>
                      <div className="text-slate-500">(........................................................)</div>
                      <div className="text-[10px] text-slate-500">วันที่ ......./......./....... (รับทราบผลการเรียน)</div>
                    </div>
                  </div>

                  {/* Cut Line / Dotted divider between 2 slips per A4 */}
                  {index % 2 === 0 && index !== filteredResults.length - 1 && (
                    <div className="hidden print:block border-b-2 border-dashed border-slate-400 my-6 pt-4 text-center text-[10px] text-slate-400">
                      ✂️ ฉีกตามรอยประ (แบ่ง 2 สลิปต่อแผ่น A4)
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
