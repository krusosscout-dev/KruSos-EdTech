import React, { useState } from 'react';
import {
  Award, Search, Download, Printer, CheckCircle2, AlertCircle,
  TrendingUp, Users, Sparkles, BarChart2, FileText
} from 'lucide-react';
import { calculateGrade, exportComprehensiveExcel } from '../../components/ExcelHelper';

export const FinalGradingView = ({ subject = {} }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');

  const safeSubject = subject || {};
  const { students = [], assignments = [], scores = {} } = safeSubject;

  // Compute total max score of assignments
  const totalMaxScore = assignments.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);

  // Compute grade data for each student normalized to 100
  const studentResults = students.map((std) => {
    let rawTotal = 0;
    assignments.forEach((a) => {
      const val = scores[std.id]?.[a.id];
      if (val !== undefined && val !== '') {
        rawTotal += parseFloat(val) || 0;
      }
    });

    // Scale to 100 base
    const scaledScore100 = totalMaxScore > 0 ? (rawTotal / totalMaxScore) * 100 : 0;
    const roundedScaled = parseFloat(scaledScore100.toFixed(1));
    const grade = calculateGrade(rawTotal, totalMaxScore);

    // Qualitative assessment
    let evaluation = 'ผ่าน (ดีเยี่ยม)';
    let evalColor = 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40';
    if (grade === '4' || grade === '3.5') {
      evaluation = 'ผ่าน (ดีเยี่ยม)';
      evalColor = 'text-emerald-300 bg-emerald-950/80 border-emerald-500/40';
    } else if (grade === '3' || grade === '2.5') {
      evaluation = 'ผ่าน (ดี)';
      evalColor = 'text-blue-300 bg-blue-950/80 border-blue-500/40';
    } else if (grade === '2' || grade === '1.5') {
      evaluation = 'ผ่าน (ปานกลาง)';
      evalColor = 'text-amber-300 bg-amber-950/80 border-amber-500/40';
    } else if (grade === '1') {
      evaluation = 'ผ่าน (เกณฑ์ขั้นต่ำ)';
      evalColor = 'text-yellow-300 bg-yellow-950/80 border-yellow-500/40';
    } else {
      evaluation = 'ไม่ผ่านเกณฑ์';
      evalColor = 'text-rose-300 bg-rose-950/80 border-rose-500/40';
    }

    return {
      ...std,
      rawTotal,
      scaledScore100: roundedScaled,
      grade,
      evaluation,
      evalColor
    };
  });

  // Grade breakdown distribution count
  const gradeCounts = { '4': 0, '3.5': 0, '3': 0, '2.5': 0, '2': 0, '1.5': 0, '1': 0, '0': 0 };
  let sumScaled = 0;
  let passedCount = 0;

  studentResults.forEach((r) => {
    if (gradeCounts[r.grade] !== undefined) gradeCounts[r.grade]++;
    sumScaled += r.scaledScore100;
    if (parseFloat(r.grade) >= 1) passedCount++;
  });

  const avgScore100 = studentResults.length > 0 ? (sumScaled / studentResults.length).toFixed(1) : '0.0';
  const passRate = studentResults.length > 0 ? ((passedCount / studentResults.length) * 100).toFixed(0) : 0;

  // Filtered by search and grade filter
  const filteredResults = studentResults.filter((r) => {
    const q = searchTerm.toLowerCase().trim();
    const matchesSearch =
      r.name.toLowerCase().includes(q) ||
      String(r.studentNumber).includes(q) ||
      String(r.studentCode || '').includes(q);

    const matchesGrade = filterGrade === 'ALL' || r.grade === filterGrade;
    return matchesSearch && matchesGrade;
  });

  return (
    <div className="space-y-6 animate-pop">
      {/* Top Banner & Title */}
      <div className="bg-slate-800 p-6 rounded-3xl border-2 border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>ระบบตัดเกรดอย่างเป็นทางการ (เกณฑ์ฐาน 100 คะแนน)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            สรุปผลการเรียนและตัดเกรด: {subject.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            {subject.gradeLevel} • ภาคเรียนที่ {subject.semester}/{subject.academicYear} • คำนวณจากคะแนนเก็บรวม {totalMaxScore} แต้ม เทียบฐาน 100 คะแนน
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
          <button
            onClick={() => exportComprehensiveExcel(subject)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            title="ดาวน์โหลดไฟล์ Excel ปพ.5 พร้อมรายงานตัดเกรด"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก ปพ.5 (Excel)</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-2xl bg-slate-700 hover:bg-slate-600 border border-slate-600 text-white font-bold text-xs shadow flex items-center gap-2 transition-transform active:scale-95"
            title="พิมพ์หน้ารายงานตัดเกรด"
          >
            <Printer className="w-4 h-4 text-slate-300" />
            <span>พิมพ์รายงาน</span>
          </button>
        </div>
      </div>

      {/* 4 Summary Stat Cards with High Contrast */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold mb-1">นักเรียนในวิชานี้</div>
          <div className="text-3xl font-black font-mono text-white">
            {students.length} <span className="text-sm font-normal text-slate-400">คน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">จำนวนผู้มีสิทธิ์ได้รับการตัดเกรด</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold mb-1">คะแนนเฉลี่ยทั้งห้อง (ฐาน 100)</div>
          <div className="text-3xl font-black font-mono text-amber-400">
            {avgScore100} <span className="text-sm font-normal text-slate-400">คะแนน</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">คะแนนเฉลี่ยจากการประเมินรวม</div>
        </div>

        <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold mb-1">อัตราการผ่านเกณฑ์</div>
          <div className="text-3xl font-black font-mono text-emerald-400">
            {passRate}%
          </div>
          <div className="text-[11px] text-emerald-300 mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>ผ่านเกณฑ์ {passedCount}/{students.length} คน</span>
          </div>
        </div>

        <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-lg">
          <div className="text-xs text-slate-400 font-semibold mb-1">ผลการเรียนยอดเยี่ยม (เกรด 4)</div>
          <div className="text-3xl font-black font-mono text-indigo-400">
            {gradeCounts['4']} <span className="text-sm font-normal text-slate-400">คน</span>
          </div>
          <div className="text-[11px] text-indigo-300 mt-1">
            {students.length > 0 ? ((gradeCounts['4'] / students.length) * 100).toFixed(0) : 0}% ของห้องเรียน
          </div>
        </div>
      </div>

      {/* Grade Distribution Breakdown Bar (การกระจายตัวของเกรด) */}
      <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>การกระจายตัวของเกรดผลการเรียน (คลิกเกรดเพื่อกรองรายชื่อ)</span>
          </h3>
          {filterGrade !== 'ALL' && (
            <button
              onClick={() => setFilterGrade('ALL')}
              className="text-xs text-indigo-400 hover:underline"
            >
              แสดงทั้งหมด ({students.length} คน)
            </button>
          )}
        </div>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {['4', '3.5', '3', '2.5', '2', '1.5', '1', '0'].map((g) => {
            const count = gradeCounts[g];
            const isSelected = filterGrade === g;

            let colorStyle = 'border-slate-700 bg-slate-900 text-slate-300';
            if (g === '4') colorStyle = isSelected ? 'border-emerald-500 bg-emerald-950 text-emerald-200 ring-2 ring-emerald-500' : 'border-emerald-700/60 bg-emerald-950/40 text-emerald-300';
            else if (g === '3.5' || g === '3') colorStyle = isSelected ? 'border-blue-500 bg-blue-950 text-blue-200 ring-2 ring-blue-500' : 'border-blue-700/60 bg-blue-950/40 text-blue-300';
            else if (g === '2.5' || g === '2') colorStyle = isSelected ? 'border-amber-500 bg-amber-950 text-amber-200 ring-2 ring-amber-500' : 'border-amber-700/60 bg-amber-950/40 text-amber-300';
            else colorStyle = isSelected ? 'border-rose-500 bg-rose-950 text-rose-200 ring-2 ring-rose-500' : 'border-rose-700/60 bg-rose-950/40 text-rose-300';

            return (
              <button
                key={g}
                type="button"
                onClick={() => setFilterGrade(isSelected ? 'ALL' : g)}
                className={`p-3 rounded-2xl border transition-all text-center ${colorStyle} hover:scale-105 active:scale-95`}
              >
                <div className="text-xs font-semibold">เกรด {g}</div>
                <div className="text-xl font-black font-mono mt-0.5">{count}</div>
                <div className="text-[10px] opacity-75">คน</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Search and Table Container */}
      <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden space-y-4 p-5">
        {/* Table Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาเลขที่ หรือชื่อนักเรียน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-600 text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="text-xs text-slate-300">
            แสดงข้อมูล <strong>{filteredResults.length}</strong> จากทั้งหมด {students.length} คน
          </div>
        </div>

        {/* Official Final Grade Table */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b-2 border-slate-700 font-bold uppercase text-xs">
                <th className="p-3.5 w-16 text-center">เลขที่</th>
                <th className="p-3.5 w-28 text-center">รหัสนักเรียน</th>
                <th className="p-3.5 min-w-[200px]">ชื่อ - นามสกุล</th>
                <th className="p-3.5 text-center">คะแนนรวม ({totalMaxScore})</th>
                <th className="p-3.5 text-center bg-indigo-950/40 text-indigo-300 font-black">
                  คะแนนฐาน 100
                </th>
                <th className="p-3.5 text-center">ระดับเกรด</th>
                <th className="p-3.5 text-center">ผลการประเมิน</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/60 font-sans">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredResults.map((std) => {
                  return (
                    <tr
                      key={std.id}
                      className="bg-slate-800 hover:bg-slate-750 transition-colors"
                    >
                      {/* Student Number (Large & Clear) */}
                      <td className="p-3.5 text-center font-mono font-bold text-base text-slate-200">
                        {std.studentNumber}
                      </td>

                      {/* Student Code */}
                      <td className="p-3.5 text-center font-mono text-xs text-slate-400">
                        {std.studentCode || '-'}
                      </td>

                      {/* Student Name (Large font 15-16px, crisp white) */}
                      <td className="p-3.5 font-bold text-base text-white">
                        {std.title || ''}{std.name}
                      </td>

                      {/* Raw Score */}
                      <td className="p-3.5 text-center font-mono font-semibold text-slate-300">
                        {std.rawTotal} <span className="text-xs text-slate-500">/ {totalMaxScore}</span>
                      </td>

                      {/* Normalized 100 Score */}
                      <td className="p-3.5 text-center font-mono font-black text-lg text-amber-400 bg-indigo-950/30">
                        {std.scaledScore100}
                      </td>

                      {/* Grade Badge */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-3.5 py-1 rounded-xl font-black text-sm border shadow-sm ${
                            parseFloat(std.grade) >= 3.5
                              ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                              : parseFloat(std.grade) >= 2.5
                              ? 'bg-blue-500/20 border-blue-500 text-blue-300'
                              : parseFloat(std.grade) >= 1.5
                              ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                              : 'bg-rose-500/20 border-rose-500 text-rose-300'
                          }`}
                        >
                          เกรด {std.grade}
                        </span>
                      </td>

                      {/* Evaluation Text */}
                      <td className="p-3.5 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl text-xs font-bold border ${std.evalColor}`}
                        >
                          {std.evaluation}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Grading Scale Footnote */}
        <div className="pt-2 text-xs text-slate-400 border-t border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
          <span>* เกณฑ์การตัดเกรด สพฐ.: 80-100 (4), 75-79 (3.5), 70-74 (3), 65-69 (2.5), 60-64 (2), 55-59 (1.5), 50-54 (1), 0-49 (0)</span>
          <span className="text-indigo-300 font-semibold">โรงเรียนวัดบางปูน • ปีการศึกษา 2569</span>
        </div>
      </div>
    </div>
  );
};
