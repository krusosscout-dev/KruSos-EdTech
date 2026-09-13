import React, { useState, useMemo } from 'react';
import {
  Award, Search, Download, Printer, CheckCircle2, AlertCircle,
  TrendingUp, Users, Sparkles, BarChart2, FileText, Settings,
  Plus, Trash2, Edit3, Sliders, Check, Calculator, Percent,
  Layers, X, HelpCircle, ArrowRight, RotateCcw, ShieldCheck,
  ChevronDown, BookOpen
} from 'lucide-react';
import { calculateGrade, exportComprehensiveExcel } from '../../components/ExcelHelper';
import { ScoreWheelInput } from '../../components/ScoreWheelInput';

export const FinalGradingView = ({
  subject = {},
  onSaveSubject,
  onUpdateScore
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGrade, setFilterGrade] = useState('ALL');

  // Modals state
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showAddExamModal, setShowAddExamModal] = useState(false);
  const [editingExamId, setEditingExamId] = useState(null);

  // Add/Edit Exam Form State
  const [examFormTitle, setExamFormTitle] = useState('');
  const [examFormCategory, setExamFormCategory] = useState('สอบกลางภาค');
  const [examFormMaxScore, setExamFormMaxScore] = useState(10);

  const safeSubject = subject || {};
  const { students = [], assignments = [], scores = {} } = safeSubject;

  // Default grading configuration (Standard 100-point Thai Education System: 70 Formative + 10 Midterm + 20 Final = 100)
  const defaultGradingConfig = useMemo(() => {
    return {
      formativeWeight: 70, // น้ำหนักคะแนนเก็บเต็ม 70
      calculationMode: 'scale_to_weight', // 'scale_to_weight' | 'divide_by' | 'direct_sum'
      divisor: 1, // ตัวหาร (ใช้เมื่อเลือก divide_by)
      selectedAssignmentIds: assignments.map((a) => a.id), // ดึงทุกช่องคะแนนเก็บเป็นค่าเริ่มต้น
      examColumns: [
        { id: 'exam_midterm', title: 'สอบกลางภาค', maxScore: 10, category: 'สอบกลางภาค' },
        { id: 'exam_final', title: 'สอบปลายภาค', maxScore: 20, category: 'สอบปลายภาค' }
      ]
    };
  }, [assignments]);

  // Active grading configuration from subject or default
  const config = safeSubject.gradingConfig || defaultGradingConfig;
  const {
    formativeWeight = 70,
    calculationMode = 'scale_to_weight',
    divisor = 1,
    selectedAssignmentIds = assignments.map((a) => a.id),
    examColumns = [
      { id: 'exam_midterm', title: 'สอบกลางภาค', maxScore: 10, category: 'สอบกลางภาค' },
      { id: 'exam_final', title: 'สอบปลายภาค', maxScore: 20, category: 'สอบปลายภาค' }
    ]
  } = config;

  // Selected assignments for formative coursework calculation
  const selectedAssignments = useMemo(() => {
    return assignments.filter((a) => selectedAssignmentIds.includes(a.id));
  }, [assignments, selectedAssignmentIds]);

  // Total raw max score of selected assignments
  const selectedRawMaxScore = useMemo(() => {
    return selectedAssignments.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);
  }, [selectedAssignments]);

  // Effective formative max score based on selected mode
  const effectiveFormativeMax = useMemo(() => {
    if (calculationMode === 'scale_to_weight') {
      return parseFloat(formativeWeight) || 70;
    }
    if (calculationMode === 'divide_by') {
      const d = parseFloat(divisor) || 1;
      return d > 0 ? selectedRawMaxScore / d : selectedRawMaxScore;
    }
    return selectedRawMaxScore; // direct_sum
  }, [calculationMode, formativeWeight, divisor, selectedRawMaxScore]);

  // Total max score of all exam columns
  const totalExamMaxScore = useMemo(() => {
    return examColumns.reduce((acc, col) => acc + (parseFloat(col.maxScore) || 0), 0);
  }, [examColumns]);

  // Total overall scale (Must be 100)
  const totalCalculatedMax = useMemo(() => {
    return Math.round((effectiveFormativeMax + totalExamMaxScore) * 10) / 10;
  }, [effectiveFormativeMax, totalExamMaxScore]);

  const isExact100 = Math.abs(totalCalculatedMax - 100) < 0.05;

  // Save updated grading configuration to subject
  const handleSaveConfig = (newConfig) => {
    if (onSaveSubject && safeSubject.id) {
      onSaveSubject({
        ...safeSubject,
        gradingConfig: newConfig
      });
    }
  };

  // Quick auto-balance to 100 points
  const handleAutoBalance100 = () => {
    const remainingForFormative = Math.max(0, 100 - totalExamMaxScore);
    const newConfig = {
      ...config,
      calculationMode: 'scale_to_weight',
      formativeWeight: remainingForFormative
    };
    handleSaveConfig(newConfig);
  };

  // Open modal to add or edit exam column
  const handleOpenExamModal = (col = null) => {
    if (col) {
      setEditingExamId(col.id);
      setExamFormTitle(col.title);
      setExamFormCategory(col.category || 'สอบ');
      setExamFormMaxScore(col.maxScore);
    } else {
      setEditingExamId(null);
      setExamFormTitle(`คะแนนสอบ ${examColumns.length + 1}`);
      setExamFormCategory('สอบย่อย/ปลายภาค');
      setExamFormMaxScore(20);
    }
    setShowAddExamModal(true);
  };

  // Submit add or edit exam column
  const handleSubmitExamColumn = (e) => {
    e.preventDefault();
    if (!examFormTitle.trim()) return;

    let updatedExams = [...examColumns];
    if (editingExamId) {
      updatedExams = updatedExams.map((col) =>
        col.id === editingExamId
          ? {
              ...col,
              title: examFormTitle.trim(),
              category: examFormCategory,
              maxScore: parseFloat(examFormMaxScore) || 10
            }
          : col
      );
    } else {
      const newExam = {
        id: `exam_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: examFormTitle.trim(),
        category: examFormCategory,
        maxScore: parseFloat(examFormMaxScore) || 10
      };
      updatedExams.push(newExam);
    }

    const newConfig = {
      ...config,
      examColumns: updatedExams
    };
    handleSaveConfig(newConfig);
    setShowAddExamModal(false);
  };

  // Delete an exam column
  const handleDeleteExamColumn = (colId) => {
    if (!window.confirm('คุณครูต้องการลบช่องคะแนนสอบนี้ใช่หรือไม่? (คะแนนที่กรอกไว้ในช่องนี้จะถูกนำออกจากการคำนวณตัดเกรด)')) {
      return;
    }
    const updatedExams = examColumns.filter((col) => col.id !== colId);
    const newConfig = {
      ...config,
      examColumns: updatedExams
    };
    handleSaveConfig(newConfig);
  };

  // Toggle selection of an assignment for formative score calculation
  const handleToggleAssignment = (asgId) => {
    let currentSelected = [...selectedAssignmentIds];
    if (currentSelected.includes(asgId)) {
      currentSelected = currentSelected.filter((id) => id !== asgId);
    } else {
      currentSelected.push(asgId);
    }
    const newConfig = {
      ...config,
      selectedAssignmentIds: currentSelected
    };
    handleSaveConfig(newConfig);
  };

  // Select all or deselect all assignments
  const handleSelectAllAssignments = (select) => {
    const newConfig = {
      ...config,
      selectedAssignmentIds: select ? assignments.map((a) => a.id) : []
    };
    handleSaveConfig(newConfig);
  };

  // Handle score change for an exam column using ScoreWheelInput or typing
  const handleExamScoreChange = (studentId, examColId, newScore) => {
    if (onUpdateScore) {
      onUpdateScore(studentId, examColId, newScore);
    } else if (onSaveSubject) {
      const updatedScores = {
        ...scores,
        [studentId]: {
          ...(scores[studentId] || {}),
          [examColId]: newScore
        }
      };
      onSaveSubject({
        ...safeSubject,
        scores: updatedScores
      });
    }
  };

  // Quick fill full score for an exam column
  const handleQuickFillExam = (examCol) => {
    if (!window.confirm(`ต้องการกรอกคะแนนเต็ม (${examCol.maxScore} แต้ม) ในช่อง "${examCol.title}" ให้กับนักเรียนทุกคนใช่หรือไม่?`)) {
      return;
    }
    const updatedScores = { ...scores };
    students.forEach((std) => {
      updatedScores[std.id] = {
        ...(updatedScores[std.id] || {}),
        [examCol.id]: examCol.maxScore
      };
    });
    if (onSaveSubject) {
      onSaveSubject({
        ...safeSubject,
        scores: updatedScores
      });
    }
  };

  // Compute student final grading results
  const studentResults = useMemo(() => {
    return students.map((std) => {
      // 1. Compute Formative Raw Score from selected assignments
      let rawFormative = 0;
      selectedAssignments.forEach((a) => {
        const val = scores[std.id]?.[a.id];
        if (val !== undefined && val !== '') {
          rawFormative += parseFloat(val) || 0;
        }
      });

      // 2. Calculate Formative Score based on mode
      let calcFormative = 0;
      if (calculationMode === 'scale_to_weight') {
        calcFormative = selectedRawMaxScore > 0 ? (rawFormative / selectedRawMaxScore) * (parseFloat(formativeWeight) || 70) : 0;
      } else if (calculationMode === 'divide_by') {
        const d = parseFloat(divisor) || 1;
        calcFormative = d > 0 ? rawFormative / d : rawFormative;
      } else {
        calcFormative = rawFormative; // direct sum
      }
      calcFormative = Math.round(calcFormative * 10) / 10;

      // 3. Compute Exam Scores from exam columns
      let totalExamScore = 0;
      const studentExamScores = {};
      examColumns.forEach((col) => {
        const val = scores[std.id]?.[col.id];
        const num = val !== undefined && val !== '' ? parseFloat(val) : 0;
        studentExamScores[col.id] = val !== undefined && val !== '' ? num : '';
        totalExamScore += num;
      });

      // 4. Net Final Score (Sum of Formative + Exams)
      const rawFinalScore = calcFormative + totalExamScore;
      
      // Standardize strictly to 100-base scale for official grading
      const finalScore100 = totalCalculatedMax > 0 ? (rawFinalScore / totalCalculatedMax) * 100 : 0;
      const rounded100 = Math.round(finalScore100 * 10) / 10;
      const netFinalScore = Math.round(rawFinalScore * 10) / 10;

      // 5. Official Thai Grade (0 - 4)
      const grade = calculateGrade(netFinalScore, totalCalculatedMax > 0 ? totalCalculatedMax : 100);

      // Qualitative Evaluation Label
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
        rawFormative,
        calcFormative,
        studentExamScores,
        totalExamScore,
        netFinalScore,
        rounded100,
        grade,
        evaluation,
        evalColor
      };
    });
  }, [
    students,
    selectedAssignments,
    selectedRawMaxScore,
    scores,
    calculationMode,
    formativeWeight,
    divisor,
    examColumns,
    totalCalculatedMax
  ]);

  // Grade Breakdown Distribution Count
  const gradeCounts = { '4': 0, '3.5': 0, '3': 0, '2.5': 0, '2': 0, '1.5': 0, '1': 0, '0': 0 };
  let sumFinal100 = 0;
  let passedCount = 0;

  studentResults.forEach((r) => {
    if (gradeCounts[r.grade] !== undefined) gradeCounts[r.grade]++;
    sumFinal100 += r.rounded100;
    if (parseFloat(r.grade) >= 1) passedCount++;
  });

  const avgScore100 = studentResults.length > 0 ? (sumFinal100 / studentResults.length).toFixed(1) : '0.0';
  const passRate = studentResults.length > 0 ? ((passedCount / studentResults.length) * 100).toFixed(0) : 0;

  // Filtered student results by search query and grade
  const filteredResults = useMemo(() => {
    return studentResults.filter((r) => {
      const q = searchTerm.toLowerCase().trim();
      const matchesSearch =
        r.name.toLowerCase().includes(q) ||
        String(r.studentNumber).includes(q) ||
        String(r.studentCode || '').includes(q);

      const matchesGrade = filterGrade === 'ALL' || r.grade === filterGrade;
      return matchesSearch && matchesGrade;
    });
  }, [studentResults, searchTerm, filterGrade]);

  return (
    <div className="space-y-6 animate-pop pb-12">
      {/* ========================================================= */}
      {/* 🏆 1. TOP HEADER & ACTION CONTROLS                       */}
      {/* ========================================================= */}
      <div className="bg-slate-800 p-5 sm:p-6 rounded-3xl border-2 border-slate-700 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-900/60 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-2">
            <Award className="w-3.5 h-3.5" />
            <span>ระบบคำนวณและตัดเกรดทางการ (ฐานคะแนนเต็ม 100 แต้ม)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            สรุปผลการเรียนและตัดเกรด: {safeSubject.name}
          </h2>
          <p className="text-xs text-slate-300 mt-1 flex items-center gap-2 flex-wrap">
            <span>{safeSubject.gradeLevel}</span>
            <span>•</span>
            <span>ภาคเรียนที่ {safeSubject.semester}/{safeSubject.academicYear}</span>
            <span>•</span>
            <span>นักเรียน {students.length} คน</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Settings Button: Configure weights & select formative assignments */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            title="ตั้งค่าสัดส่วนคะแนนเก็บ ตัวหาร และดึงช่องคะแนน"
          >
            <Sliders className="w-4 h-4" />
            <span>ตั้งค่าสัดส่วน (100 คะแนน)</span>
          </button>

          {/* Add Exam Column Button */}
          <button
            type="button"
            onClick={() => handleOpenExamModal()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            title="เพิ่มช่องคะแนนสอบกลางภาค/ปลายภาค"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มช่องคะแนนสอบ</span>
          </button>

          {/* Export Excel Button */}
          <button
            type="button"
            onClick={() => exportComprehensiveExcel(safeSubject)}
            className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 transition-transform active:scale-95"
            title="ดาวน์โหลดไฟล์ Excel ปพ.5 พร้อมรายงานตัดเกรด"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก ปพ.5</span>
          </button>

          {/* Print Button */}
          <button
            type="button"
            onClick={() => window.print()}
            className="p-2.5 rounded-2xl bg-slate-750 hover:bg-slate-700 border border-slate-600 text-slate-200 font-bold text-xs shadow transition-transform active:scale-95"
            title="พิมพ์หน้ารายงานตัดเกรด"
          >
            <Printer className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚖️ 2. REAL-TIME 100-POINT FORMULA & WEIGHT STATUS BANNER   */}
      {/* ========================================================= */}
      <div className={`p-5 rounded-3xl border-2 shadow-xl transition-all ${
        isExact100
          ? 'bg-slate-800/95 border-indigo-500/50 shadow-indigo-950/20'
          : 'bg-amber-950/30 border-amber-500/60 shadow-amber-950/30'
      }`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">
                โครงสร้างสัดส่วนการตัดเกรด: 100 คะแนน
              </h3>
              {isExact100 ? (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/60 text-emerald-300 font-bold text-[11px] flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>ครบ 100 คะแนนเป๊ะ (พร้อมตัดเกรด)</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-rose-500/20 border border-rose-500/60 text-rose-300 font-bold text-[11px] flex items-center gap-1 animate-pulse">
                  <AlertCircle className="w-3 h-3" />
                  <span>รวมได้ {totalCalculatedMax} / 100 คะแนน (ขาด/เกิน {Math.abs(Math.round((100 - totalCalculatedMax) * 10) / 10)} แต้ม)</span>
                </span>
              )}
            </div>

            {/* Formula Breakdown Tags */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-300">
              {/* Formative Coursework Part */}
              <div className="px-3 py-1 rounded-xl bg-indigo-950/70 border border-indigo-700/50 flex items-center gap-1.5">
                <span className="text-indigo-400">📝 คะแนนเก็บสะสม:</span>
                <span className="font-mono text-amber-300 font-bold">{effectiveFormativeMax} แต้ม</span>
                <span className="text-[10px] text-slate-400">
                  (ดึง {selectedAssignments.length}/{assignments.length} ช่อง, ดิบ {selectedRawMaxScore} แต้ม
                  {calculationMode === 'scale_to_weight' ? ` -> ทอนเต็ม ${formativeWeight}` : calculationMode === 'divide_by' ? ` ÷ ${divisor}` : ''})
                </span>
              </div>

              <span className="text-slate-500 font-bold">+</span>

              {/* Exam Columns Parts */}
              {examColumns.map((col, idx) => (
                <React.Fragment key={col.id}>
                  {idx > 0 && <span className="text-slate-500 font-bold">+</span>}
                  <div className="px-3 py-1 rounded-xl bg-amber-950/50 border border-amber-700/50 flex items-center gap-1.5">
                    <span className="text-amber-300 font-bold">{col.title}:</span>
                    <span className="font-mono text-white font-bold">{col.maxScore} แต้ม</span>
                  </div>
                </React.Fragment>
              ))}

              <span className="text-slate-500 font-bold">=</span>

              {/* Total Balance */}
              <div className={`px-3 py-1 rounded-xl font-mono font-black text-sm border ${
                isExact100
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-500 text-rose-300'
              }`}>
                {totalCalculatedMax} / 100
              </div>
            </div>
          </div>

          {/* Quick Adjustment Button if not 100 */}
          {!isExact100 && (
            <button
              type="button"
              onClick={handleAutoBalance100}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 shrink-0 transition-transform active:scale-95"
              title="ปรับคะแนนเก็บให้ครบ 100 คะแนนอัตโนมัติ"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>ปรับคะแนนให้ครบ 100 ทันที</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📊 3. SUMMARY STAT CARDS (สถิติภาพรวม)                    */}
      {/* ========================================================= */}
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

      {/* ========================================================= */}
      {/* 📈 4. GRADE DISTRIBUTION BAR (การกระจายตัวของเกรด)         */}
      {/* ========================================================= */}
      <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-indigo-400" />
            <span>การกระจายตัวของระดับเกรด (คลิกเกรดเพื่อกรองรายชื่อ)</span>
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
                className={`p-3 rounded-2xl border transition-all text-center ${colorStyle} hover:scale-105 active:scale-95 cursor-pointer`}
              >
                <div className="text-xs font-semibold">เกรด {g}</div>
                <div className="text-xl font-black font-mono mt-0.5">{count}</div>
                <div className="text-[10px] opacity-75">คน</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ========================================================= */}
      {/* 📋 5. INTERACTIVE 100-POINT FINAL GRADING TABLE            */}
      {/* ========================================================= */}
      <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden space-y-4 p-5">
        {/* Table Search & Helper Bar */}
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

          <div className="flex items-center gap-3 text-xs text-slate-300">
            <span className="hidden sm:inline text-slate-400">
              💡 <strong>ปรับคะแนนสอบ:</strong> เลื่อนลูกกลิ้งเมาส์ (Scroll) หรือพิมพ์ตัวเลขได้ทันที
            </span>
            <span>
              แสดงข้อมูล <strong>{filteredResults.length}</strong> จากทั้งหมด {students.length} คน
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="overflow-x-auto rounded-2xl border border-slate-700 shadow-inner">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-900 text-slate-200 border-b-2 border-slate-700 font-bold uppercase text-xs">
                {/* Pinned Number */}
                <th className="p-3.5 w-16 text-center sticky left-0 z-20 bg-slate-900 border-r border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                  เลขที่
                </th>
                {/* Student Code */}
                <th className="p-3.5 w-24 text-center">รหัส</th>
                {/* Pinned Name */}
                <th className="p-3.5 min-w-[190px] sticky left-16 z-20 bg-slate-900 border-r-2 border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.35)]">
                  ชื่อ - นามสกุล
                </th>

                {/* Formative Coursework Column */}
                <th className="p-3.5 text-center min-w-[130px] bg-indigo-950/60 text-indigo-200 border-r border-slate-800">
                  <div className="font-bold flex items-center justify-center gap-1">
                    <span>คะแนนเก็บ</span>
                  </div>
                  <div className="text-[10px] text-amber-300 font-mono font-normal mt-0.5">
                    เต็ม {effectiveFormativeMax} แต้ม
                  </div>
                </th>

                {/* Dynamic Exam Columns */}
                {examColumns.map((col) => (
                  <th
                    key={col.id}
                    className="p-3 text-center min-w-[130px] max-w-[160px] bg-slate-900/90 border-r border-slate-800 relative group"
                  >
                    <div className="flex items-center justify-center gap-1 font-bold text-amber-300 truncate">
                      <span>{col.title}</span>
                      {/* Action buttons on header hover */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenExamModal(col)}
                          className="p-0.5 text-slate-400 hover:text-white"
                          title="แก้ไขชื่อ/คะแนนเต็มช่องนี้"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExamColumn(col.id)}
                          className="p-0.5 text-slate-400 hover:text-rose-400"
                          title="ลบช่องสอบนี้"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5 flex items-center justify-center gap-1">
                      <span>เต็ม {col.maxScore} แต้ม</span>
                      <button
                        type="button"
                        onClick={() => handleQuickFillExam(col)}
                        className="text-[9px] text-indigo-400 hover:underline font-sans ml-1"
                        title="กรอกเต็มทุกคน"
                      >
                        (เต็มทุกคน)
                      </button>
                    </div>
                  </th>
                ))}

                {/* Net Total Score (100 Points Base) */}
                <th className="p-3.5 text-center min-w-[120px] bg-slate-950 text-amber-300 font-black border-r border-slate-800">
                  <div>รวมคะแนน</div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                    (เต็ม {totalCalculatedMax})
                  </div>
                </th>

                {/* Official Grade */}
                <th className="p-3.5 text-center w-24">ระดับเกรด</th>

                {/* Qualitative Evaluation */}
                <th className="p-3.5 text-center min-w-[130px]">ผลการประเมิน</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/60 font-sans">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={6 + examColumns.length} className="p-8 text-center text-slate-400">
                    ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredResults.map((std) => {
                  return (
                    <tr
                      key={std.id}
                      className="group bg-slate-800 hover:bg-slate-750 transition-colors"
                    >
                      {/* Pinned Left: Number */}
                      <td className="p-3.5 text-center font-mono font-bold text-base text-slate-200 sticky left-0 z-10 bg-slate-800 group-hover:bg-slate-750 border-r border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                        {std.studentNumber}
                      </td>

                      {/* Student Code */}
                      <td className="p-3.5 text-center font-mono text-xs text-slate-400">
                        {std.studentCode || '-'}
                      </td>

                      {/* Pinned Left: Student Name */}
                      <td className="p-3.5 font-bold text-base text-white sticky left-16 z-10 bg-slate-800 group-hover:bg-slate-750 border-r-2 border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.35)]">
                        <div className="truncate">
                          {std.title || ''}{std.name}
                        </div>
                      </td>

                      {/* Formative Coursework Score (Calculated) */}
                      <td className="p-3 text-center bg-indigo-950/20 border-r border-slate-700/80">
                        <div className="font-mono font-bold text-base text-indigo-200">
                          {std.calcFormative}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          (ดิบ {std.rawFormative}/{selectedRawMaxScore})
                        </div>
                      </td>

                      {/* Dynamic Exam Columns with Mouse-Wheel Score Adjustment */}
                      {examColumns.map((col) => {
                        const currentScore = std.studentExamScores[col.id];
                        return (
                          <td
                            key={col.id}
                            className="p-2.5 text-center border-r border-slate-700/80"
                          >
                            <div className="flex justify-center">
                              <ScoreWheelInput
                                value={currentScore !== undefined && currentScore !== '' ? currentScore : ''}
                                maxScore={parseFloat(col.maxScore) || 10}
                                minScore={0}
                                step={parseFloat(col.maxScore) <= 10 ? 0.5 : 1}
                                onChange={(val) => handleExamScoreChange(std.id, col.id, val)}
                                placeholder="-"
                                className="w-20"
                                title={`หมุนลูกกลิ้งเมาส์ หรือพิมพ์คะแนน ${col.title} (เต็ม ${col.maxScore})`}
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Net Final Score (Large Font, Crisp Gold) */}
                      <td className="p-3 text-center font-mono font-black text-xl text-amber-400 bg-slate-950/60 border-r border-slate-800">
                        {std.netFinalScore}
                      </td>

                      {/* Grade Badge */}
                      <td className="p-3 text-center">
                        <span
                          className={`inline-block px-3 py-1 rounded-xl font-black text-sm border shadow-sm ${
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
                      <td className="p-3 text-center">
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
          <span>* เกณฑ์การตัดเกรด 8 ระดับตามมาตรฐาน สพฐ.: 80-100 (4), 75-79 (3.5), 70-74 (3), 65-69 (2.5), 60-64 (2), 55-59 (1.5), 50-54 (1), 0-49 (0)</span>
          <span className="text-indigo-300 font-semibold">โรงเรียนวัดบางปูน • ครูซอส EdTech</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ⚙️ MODAL 1: ตั้งค่าสัดส่วนคะแนนตัดเกรด (100 คะแนน)          */}
      {/* ========================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
          <div className="bg-slate-850 w-full max-w-2xl rounded-3xl border-2 border-slate-700 shadow-2xl p-6 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-slate-700 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40">
                  <Sliders className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">
                    ตั้งค่าโครงสร้างสัดส่วนคะแนน (100 คะแนน)
                  </h3>
                  <p className="text-xs text-slate-400">
                    กำหนดการดึงคะแนนเก็บ ตัวหาร และสัดส่วนคะแนนสอบปลายภาค
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Balance Bar inside modal */}
            <div className={`p-4 rounded-2xl border flex items-center justify-between ${
              isExact100
                ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
            }`}>
              <div className="text-xs font-semibold">
                คะแนนรวมปัจจุบัน: <span className="font-mono font-black text-base">{totalCalculatedMax}</span> / 100 คะแนน
              </div>
              {isExact100 ? (
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> ครบ 100 คะแนนเป๊ะ
                </span>
              ) : (
                <button
                  type="button"
                  onClick={handleAutoBalance100}
                  className="px-3 py-1 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-transform active:scale-95"
                >
                  ⚡ ปรับให้ครบ 100
                </button>
              )}
            </div>

            {/* Section A: Formative Coursework Formula */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  <span>1. วิธีคำนวณคะแนนเก็บระหว่างเรียน (Formative)</span>
                </h4>
                <span className="text-xs text-amber-300 font-bold font-mono">
                  รวมได้ {effectiveFormativeMax} แต้ม
                </span>
              </div>

              {/* Mode Radio Buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    handleSaveConfig({
                      ...config,
                      calculationMode: 'scale_to_weight'
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    calculationMode === 'scale_to_weight'
                      ? 'bg-indigo-950 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">เทียบสัดส่วน (แนะนำ)</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    ทอนคะแนนเก็บที่เลือกให้เต็มตามน้ำหนักที่ระบุ
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveConfig({
                      ...config,
                      calculationMode: 'divide_by'
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    calculationMode === 'divide_by'
                      ? 'bg-indigo-950 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">หารตัวเลขคงที่</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    รวมคะแนนเก็บแล้วหารด้วยตัวเลข เช่น หาร 2
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    handleSaveConfig({
                      ...config,
                      calculationMode: 'direct_sum'
                    });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    calculationMode === 'direct_sum'
                      ? 'bg-indigo-950 border-indigo-500 ring-2 ring-indigo-500/30 text-white'
                      : 'bg-slate-900 border-slate-700 text-slate-300 hover:border-slate-600'
                  }`}
                >
                  <div className="font-bold text-xs">รวมคะแนนจริง</div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    รวมคะแนนเก็บตรงๆ ตามคะแนนเต็มดิบ
                  </div>
                </button>
              </div>

              {/* Mode Parameters */}
              {calculationMode === 'scale_to_weight' && (
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-300">
                    กำหนดคะแนนเก็บสุทธิ (น้ำหนักเต็ม):
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={formativeWeight}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        handleSaveConfig({
                          ...config,
                          formativeWeight: val
                        });
                      }}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-600 text-sm font-mono font-bold text-amber-300 text-center outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs text-slate-400 font-semibold">คะแนน</span>
                  </div>
                </div>
              )}

              {calculationMode === 'divide_by' && (
                <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-700/80 flex items-center justify-between gap-3">
                  <label className="text-xs font-semibold text-slate-300">
                    หารคะแนนเก็บรวมด้วย:
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-slate-400">÷</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0.1"
                      value={divisor}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 1;
                        handleSaveConfig({
                          ...config,
                          divisor: val
                        });
                      }}
                      className="w-24 px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-600 text-sm font-mono font-bold text-amber-300 text-center outline-none focus:border-indigo-400"
                    />
                    <span className="text-xs text-slate-400 font-semibold">เท่า</span>
                  </div>
                </div>
              )}

              {/* Assignment Checklist: Select which assignments to include */}
              <div className="space-y-2 pt-2 border-t border-slate-700/80">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    เลือกช่องคะแนนเก็บที่จะดึงมารวม ({selectedAssignments.length}/{assignments.length} ช่อง):
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => handleSelectAllAssignments(true)}
                      className="text-indigo-400 hover:underline"
                    >
                      เลือกทั้งหมด
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => handleSelectAllAssignments(false)}
                      className="text-slate-400 hover:underline"
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {assignments.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      ยังไม่มีช่องคะแนนเก็บในวิชานี้ (ไปเพิ่มที่หน้า "สมุดบันทึกคะแนนเก็บ")
                    </div>
                  ) : (
                    assignments.map((a) => {
                      const isChecked = selectedAssignmentIds.includes(a.id);
                      return (
                        <label
                          key={a.id}
                          className={`flex items-center justify-between p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                            isChecked
                              ? 'bg-indigo-950/40 border-indigo-700/50 text-white'
                              : 'bg-slate-900/60 border-slate-700/50 text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <div className="flex items-center gap-2.5 truncate">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAssignment(a.id)}
                              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-600 focus:ring-indigo-500"
                            />
                            <span className="font-semibold truncate">{a.title}</span>
                            <span className="text-[10px] text-slate-500">({a.category || 'งาน'})</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                            เต็ม {a.maxScore} แต้ม
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Section B: Exam Columns Management */}
            <div className="bg-slate-800/80 p-5 rounded-2xl border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-400" />
                    <span>2. ช่องคะแนนสอบ (Summative Exam Columns)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    รวมคะแนนสอบทั้งหมด: <strong className="text-amber-300 font-mono">{totalExamMaxScore}</strong> แต้ม
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenExamModal()}
                  className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มช่องสอบ</span>
                </button>
              </div>

              <div className="space-y-2">
                {examColumns.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-700">
                    ยังไม่มีช่องคะแนนสอบ (กดปุ่ม "+ เพิ่มช่องสอบ" เพื่อเพิ่มสอบกลางภาค หรือปลายภาค)
                  </div>
                ) : (
                  examColumns.map((col) => (
                    <div
                      key={col.id}
                      className="p-3 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                        <span className="font-bold text-white">{col.title}</span>
                        <span className="text-[10px] text-slate-400">({col.category || 'สอบ'})</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="font-mono font-black text-amber-300">
                          {col.maxScore} คะแนน
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenExamModal(col)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="แก้ไขช่องสอบ"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteExamColumn(col.id)}
                          className="p-1 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                          title="ลบช่องสอบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-3 border-t border-slate-700 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-transform active:scale-95"
              >
                บันทึกและปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ➕ MODAL 2: เพิ่ม / แก้ไขช่องคะแนนสอบ (Exam Column Modal)  */}
      {/* ========================================================= */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-850 w-full max-w-md rounded-3xl border-2 border-slate-700 shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>{editingExamId ? 'แก้ไขช่องคะแนนสอบ' : 'เพิ่มช่องคะแนนสอบใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddExamModal(false)}
                className="p-1.5 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitExamColumn} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อช่องคะแนนสอบ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สอบกลางภาค, สอบปลายภาค, สอบปฏิบัติ..."
                  value={examFormTitle}
                  onChange={(e) => setExamFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ประเภทการสอบ
                  </label>
                  <select
                    value={examFormCategory}
                    onChange={(e) => setExamFormCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    <option value="สอบกลางภาค">สอบกลางภาค</option>
                    <option value="สอบปลายภาค">สอบปลายภาค</option>
                    <option value="สอบย่อย">สอบย่อย</option>
                    <option value="สอบปฏิบัติ">สอบปฏิบัติ</option>
                    <option value="วัดผลสัมฤทธิ์">วัดผลสัมฤทธิ์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    คะแนนเต็ม <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    value={examFormMaxScore}
                    onChange={(e) => setExamFormMaxScore(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm font-mono font-bold text-amber-300 text-center outline-none focus:border-indigo-400"
                    title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับคะแนนเต็ม"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-[11px] text-indigo-200">
                💡 <strong>เคล็ดลับ:</strong> คุณครูสามารถปรับคะแนนสอบให้นักเรียนแต่ละคนในตารางได้สะดวก โดยใช้ลูกกลิ้งเมาส์ (Scroll) หรือพิมพ์ตัวเลข
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5 transition-all active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingExamId ? 'บันทึกการแก้ไข' : 'สร้างช่องสอบ'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
