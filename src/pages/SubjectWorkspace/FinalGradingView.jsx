import React, { useState, useMemo } from 'react';
import {
  Award, Search, Download, Printer, CheckCircle2, AlertCircle,
  TrendingUp, Users, Sparkles, BarChart2, FileText, Settings,
  Plus, Trash2, Edit3, Sliders, Check, Calculator, Percent,
  Layers, X, HelpCircle, ArrowRight, RotateCcw, ShieldCheck,
  ChevronDown, BookOpen, CheckSquare, Square
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

  // Formative Section Modal State (สำหรับเพิ่ม/แจงหมวดคะแนนเก็บ เช่น 30, 20, 20)
  const [showAddFormativeModal, setShowAddFormativeModal] = useState(false);
  const [editingFormativeId, setEditingFormativeId] = useState(null);
  const [formativeFormTitle, setFormativeFormTitle] = useState('');
  const [formativeFormWeight, setFormativeFormWeight] = useState(20);
  const [formativeFormSelectedAsgs, setFormativeFormSelectedAsgs] = useState([]);

  // Add/Edit Exam Form State
  const [examFormTitle, setExamFormTitle] = useState('');
  const [examFormCategory, setExamFormCategory] = useState('สอบปลายภาค');
  const [examFormMaxScore, setExamFormMaxScore] = useState(30);

  const safeSubject = subject || {};
  const { students = [], assignments = [], scores = {} } = safeSubject;

  // Default grading configuration matching Thai school 100-point structure (70 Formative: 30 + 20 + 20, and 30 Final Exam = 100)
  const defaultGradingConfig = useMemo(() => {
    // If subject has assignments, distribute them intelligently
    const asgCount = assignments.length;
    let sec1Asgs = [];
    let sec2Asgs = [];
    let sec3Asgs = [];

    if (asgCount > 0) {
      const p1 = Math.ceil(asgCount / 3);
      const p2 = Math.ceil((asgCount * 2) / 3);
      sec1Asgs = assignments.slice(0, p1).map((a) => a.id);
      sec2Asgs = assignments.slice(p1, p2).map((a) => a.id);
      sec3Asgs = assignments.slice(p2).map((a) => a.id);
    }

    return {
      // แจงคะแนนเก็บเป็นช่องๆ เช่น 30, 20, 20 รวมเป็น 70 แต้ม
      formativeSections: [
        {
          id: 'sec_formative_1',
          title: 'คะแนนเก็บส่วนที่ 1 (ก่อนกลางภาค)',
          weight: 30,
          calculationMode: 'scale_to_weight',
          selectedAssignmentIds: sec1Asgs
        },
        {
          id: 'sec_formative_2',
          title: 'คะแนนเก็บส่วนที่ 2 (หลังกลางภาค)',
          weight: 20,
          calculationMode: 'scale_to_weight',
          selectedAssignmentIds: sec2Asgs
        },
        {
          id: 'sec_formative_3',
          title: 'คะแนนชิ้นงาน/โครงงาน',
          weight: 20,
          calculationMode: 'scale_to_weight',
          selectedAssignmentIds: sec3Asgs
        }
      ],
      // คะแนนสอบ เช่น สอบปลายภาค 30 แต้ม
      examColumns: [
        {
          id: 'exam_final',
          title: 'สอบปลายภาค',
          maxScore: 30,
          category: 'สอบปลายภาค'
        }
      ]
    };
  }, [assignments]);

  // Read config from subject or use default (with auto-migration from legacy single formative weight)
  const config = useMemo(() => {
    const raw = safeSubject.gradingConfig;
    if (!raw) return defaultGradingConfig;

    // If legacy single formativeWeight exists without formativeSections
    if (!raw.formativeSections && raw.formativeWeight !== undefined) {
      const fWeight = parseFloat(raw.formativeWeight) || 70;
      const w1 = Math.round(fWeight * 0.43); // approx 30
      const w2 = Math.round(fWeight * 0.285); // approx 20
      const w3 = fWeight - w1 - w2; // approx 20
      return {
        formativeSections: [
          {
            id: 'sec_formative_1',
            title: 'คะแนนเก็บส่วนที่ 1',
            weight: w1,
            calculationMode: raw.calculationMode || 'scale_to_weight',
            selectedAssignmentIds: raw.selectedAssignmentIds || []
          },
          {
            id: 'sec_formative_2',
            title: 'คะแนนเก็บส่วนที่ 2',
            weight: w2,
            calculationMode: 'scale_to_weight',
            selectedAssignmentIds: []
          },
          {
            id: 'sec_formative_3',
            title: 'คะแนนเก็บส่วนที่ 3',
            weight: w3,
            calculationMode: 'scale_to_weight',
            selectedAssignmentIds: []
          }
        ],
        examColumns: raw.examColumns || defaultGradingConfig.examColumns
      };
    }

    return {
      formativeSections: raw.formativeSections || defaultGradingConfig.formativeSections,
      examColumns: raw.examColumns || defaultGradingConfig.examColumns
    };
  }, [safeSubject.gradingConfig, defaultGradingConfig]);

  const { formativeSections = [], examColumns = [] } = config;

  // Total Formative Weight (e.g. 30 + 20 + 20 = 70)
  const totalFormativeWeight = useMemo(() => {
    return formativeSections.reduce((acc, sec) => acc + (parseFloat(sec.weight) || 0), 0);
  }, [formativeSections]);

  // Total Exam Max Score (e.g. 30)
  const totalExamMaxScore = useMemo(() => {
    return examColumns.reduce((acc, col) => acc + (parseFloat(col.maxScore) || 0), 0);
  }, [examColumns]);

  // Grand Total Score (Must be 100)
  const totalCalculatedMax = useMemo(() => {
    return Math.round((totalFormativeWeight + totalExamMaxScore) * 10) / 10;
  }, [totalFormativeWeight, totalExamMaxScore]);

  const isExact100 = Math.abs(totalCalculatedMax - 100) < 0.05;

  // Save updated config to subject
  const handleSaveConfig = (newConfig) => {
    if (onSaveSubject && safeSubject.id) {
      onSaveSubject({
        ...safeSubject,
        gradingConfig: newConfig
      });
    }
  };

  // Auto-balance formula to 100 points
  const handleAutoBalance100 = () => {
    const diff = 100 - totalCalculatedMax;
    if (formativeSections.length > 0) {
      // Adjust the last formative section
      const updated = [...formativeSections];
      const last = updated[updated.length - 1];
      const newWeight = Math.max(1, (parseFloat(last.weight) || 0) + diff);
      updated[updated.length - 1] = { ...last, weight: newWeight };
      handleSaveConfig({
        ...config,
        formativeSections: updated
      });
    }
  };

  // Open modal to add or edit a formative section
  const handleOpenFormativeModal = (sec = null) => {
    if (sec) {
      setEditingFormativeId(sec.id);
      setFormativeFormTitle(sec.title);
      setFormativeFormWeight(sec.weight);
      setFormativeFormSelectedAsgs(sec.selectedAssignmentIds || []);
    } else {
      setEditingFormativeId(null);
      setFormativeFormTitle(`คะแนนเก็บส่วนที่ ${formativeSections.length + 1}`);
      setFormativeFormWeight(20);
      setFormativeFormSelectedAsgs([]);
    }
    setShowAddFormativeModal(true);
  };

  // Submit add or edit formative section
  const handleSubmitFormativeSection = (e) => {
    e.preventDefault();
    if (!formativeFormTitle.trim()) return;

    let updatedSections = [...formativeSections];
    if (editingFormativeId) {
      updatedSections = updatedSections.map((sec) =>
        sec.id === editingFormativeId
          ? {
              ...sec,
              title: formativeFormTitle.trim(),
              weight: parseFloat(formativeFormWeight) || 10,
              selectedAssignmentIds: formativeFormSelectedAsgs
            }
          : sec
      );
    } else {
      const newSec = {
        id: `sec_formative_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        title: formativeFormTitle.trim(),
        weight: parseFloat(formativeFormWeight) || 10,
        calculationMode: 'scale_to_weight',
        selectedAssignmentIds: formativeFormSelectedAsgs
      };
      updatedSections.push(newSec);
    }

    handleSaveConfig({
      ...config,
      formativeSections: updatedSections
    });
    setShowAddFormativeModal(false);
  };

  // Delete a formative section
  const handleDeleteFormativeSection = (secId) => {
    if (!window.confirm('คุณครูต้องการลบหมวดคะแนนเก็บนี้ใช่หรือไม่?')) return;
    const updated = formativeSections.filter((s) => s.id !== secId);
    handleSaveConfig({
      ...config,
      formativeSections: updated
    });
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
      setExamFormCategory('สอบปลายภาค');
      setExamFormMaxScore(30);
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

    handleSaveConfig({
      ...config,
      examColumns: updatedExams
    });
    setShowAddExamModal(false);
  };

  // Delete an exam column
  const handleDeleteExamColumn = (colId) => {
    if (!window.confirm('คุณครูต้องการลบช่องคะแนนสอบนี้ใช่หรือไม่?')) return;
    const updatedExams = examColumns.filter((col) => col.id !== colId);
    handleSaveConfig({
      ...config,
      examColumns: updatedExams
    });
  };

  // Score update handler for an editable column (direct entry or exam)
  const handleDirectScoreChange = (studentId, colId, newScore) => {
    if (onUpdateScore) {
      onUpdateScore(studentId, colId, newScore);
    } else if (onSaveSubject) {
      const updatedScores = {
        ...scores,
        [studentId]: {
          ...(scores[studentId] || {}),
          [colId]: newScore
        }
      };
      onSaveSubject({
        ...safeSubject,
        scores: updatedScores
      });
    }
  };

  // Quick fill full score for an exam/column
  const handleQuickFill = (colId, maxScore, title) => {
    if (!window.confirm(`ต้องการกรอกคะแนนเต็ม (${maxScore} แต้ม) ในช่อง "${title}" ให้กับนักเรียนทุกคนใช่หรือไม่?`)) {
      return;
    }
    const updatedScores = { ...scores };
    students.forEach((std) => {
      updatedScores[std.id] = {
        ...(updatedScores[std.id] || {}),
        [colId]: maxScore
      };
    });
    if (onSaveSubject) {
      onSaveSubject({
        ...safeSubject,
        scores: updatedScores
      });
    }
  };

  // Calculate detailed student results
  const studentResults = useMemo(() => {
    return students.map((std) => {
      let netFinalScore = 0;
      const sectionScores = {};

      // 1. Compute each Formative Section score
      formativeSections.forEach((sec) => {
        const selectedIds = sec.selectedAssignmentIds || [];
        if (selectedIds.length > 0) {
          // Compute from selected Gradebook assignments
          const linkedAsgs = assignments.filter((a) => selectedIds.includes(a.id));
          const rawMax = linkedAsgs.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);
          let rawGot = 0;
          linkedAsgs.forEach((a) => {
            const v = scores[std.id]?.[a.id];
            if (v !== undefined && v !== '') rawGot += parseFloat(v) || 0;
          });

          // Scale to section weight
          const targetWeight = parseFloat(sec.weight) || 10;
          let calculated = rawMax > 0 ? (rawGot / rawMax) * targetWeight : 0;
          calculated = Math.round(calculated * 10) / 10;

          sectionScores[sec.id] = {
            calculated,
            rawGot,
            rawMax,
            isLinked: true
          };
          netFinalScore += calculated;
        } else {
          // Direct entry formative column
          const directVal = scores[std.id]?.[sec.id];
          const num = directVal !== undefined && directVal !== '' ? parseFloat(directVal) : 0;
          sectionScores[sec.id] = {
            calculated: num,
            rawGot: num,
            rawMax: sec.weight,
            isLinked: false
          };
          netFinalScore += num;
        }
      });

      // 2. Compute Exam Scores
      const examScoresMap = {};
      examColumns.forEach((col) => {
        const val = scores[std.id]?.[col.id];
        const num = val !== undefined && val !== '' ? parseFloat(val) : 0;
        examScoresMap[col.id] = val !== undefined && val !== '' ? num : '';
        netFinalScore += num;
      });

      netFinalScore = Math.round(netFinalScore * 10) / 10;

      // 3. Official Thai Grade (0 - 4.0) based on 100 points
      const grade = calculateGrade(netFinalScore, totalCalculatedMax > 0 ? totalCalculatedMax : 100);

      // Qualitative Evaluation
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
        sectionScores,
        examScoresMap,
        netFinalScore,
        grade,
        evaluation,
        evalColor
      };
    });
  }, [
    students,
    assignments,
    scores,
    formativeSections,
    examColumns,
    totalCalculatedMax
  ]);

  // Grade Counts & Stats
  const gradeCounts = { '4': 0, '3.5': 0, '3': 0, '2.5': 0, '2': 0, '1.5': 0, '1': 0, '0': 0 };
  let sumFinal = 0;
  let passedCount = 0;

  studentResults.forEach((r) => {
    if (gradeCounts[r.grade] !== undefined) gradeCounts[r.grade]++;
    sumFinal += r.netFinalScore;
    if (parseFloat(r.grade) >= 1) passedCount++;
  });

  const avgScore100 = studentResults.length > 0 ? (sumFinal / studentResults.length).toFixed(1) : '0.0';
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
            <span>ระบบสรุปผลการเรียนและตัดเกรด (เกณฑ์ฐาน 100 คะแนน สพฐ.)</span>
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
          {/* Configure Formula Button */}
          <button
            type="button"
            onClick={() => setShowConfigModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-transform active:scale-95"
            title="คลิกเพื่อตั้งค่าและแจงสัดส่วนคะแนนเก็บ เช่น 30, 20, 20 และคะแนนสอบ"
          >
            <Sliders className="w-4 h-4" />
            <span>ตั้งค่าสัดส่วน (100 คะแนน)</span>
          </button>

          {/* Add Exam Column Button */}
          <button
            type="button"
            onClick={() => handleOpenExamModal()}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-transform active:scale-95"
            title="เพิ่มช่องคะแนนสอบปลายภาค/กลางภาค"
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
      {/* ⚖️ 2. REAL-TIME 100-POINT FORMULA & BREAKDOWN BANNER       */}
      {/* ========================================================= */}
      <div className={`p-5 rounded-3xl border-2 shadow-xl transition-all ${
        isExact100
          ? 'bg-slate-800/95 border-indigo-500/50 shadow-indigo-950/20'
          : 'bg-amber-950/30 border-amber-500/60 shadow-amber-950/30'
      }`}>
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
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

            {/* Formula Breakdown Tags: Formative Sections (30, 20, 20) + Exams (30) = 100 */}
            <div className="flex items-center gap-2 flex-wrap text-xs font-semibold text-slate-300">
              {/* Formative Header Badge */}
              <span className="text-indigo-400 font-bold">📝 คะแนนเก็บ ({totalFormativeWeight} แต้ม):</span>

              {/* Each Formative Section */}
              {formativeSections.map((sec, idx) => (
                <React.Fragment key={sec.id}>
                  {idx > 0 && <span className="text-slate-500 font-bold">+</span>}
                  <div className="px-2.5 py-1 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center gap-1">
                    <span className="text-indigo-300">{sec.title}:</span>
                    <span className="font-mono text-amber-300 font-bold">{sec.weight}</span>
                  </div>
                </React.Fragment>
              ))}

              <span className="text-slate-500 font-bold text-sm">|</span>

              {/* Exam Header Badge */}
              <span className="text-amber-400 font-bold">🎯 คะแนนสอบ ({totalExamMaxScore} แต้ม):</span>
              {examColumns.map((col, idx) => (
                <React.Fragment key={col.id}>
                  {idx > 0 && <span className="text-slate-500 font-bold">+</span>}
                  <div className="px-2.5 py-1 rounded-xl bg-amber-950/60 border border-amber-700/50 flex items-center gap-1">
                    <span className="text-amber-300">{col.title}:</span>
                    <span className="font-mono text-white font-bold">{col.maxScore}</span>
                  </div>
                </React.Fragment>
              ))}

              <span className="text-slate-500 font-bold text-sm">=</span>

              {/* Grand Total */}
              <div className={`px-3 py-1 rounded-xl font-mono font-black text-sm border ${
                isExact100
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300'
                  : 'bg-rose-950/70 border-rose-500 text-rose-300'
              }`}>
                รวม {totalCalculatedMax} / 100
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {!isExact100 && (
              <button
                type="button"
                onClick={handleAutoBalance100}
                className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow flex items-center gap-1.5 transition-transform active:scale-95"
                title="ปรับคะแนนเก็บให้ครบ 100 คะแนนอัตโนมัติ"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>ปรับให้ครบ 100 ทันที</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className="px-3 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 text-xs font-bold flex items-center gap-1.5"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>แก้ไขการแจงคะแนน</span>
            </button>
          </div>
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
        {/* Search & Help Bar */}
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
              💡 <strong>ปรับคะแนนสอบ/คะแนนกรอกตรง:</strong> เลื่อนลูกกลิ้งเมาส์ (Scroll) หรือพิมพ์ตัวเลขได้ทันที
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
                {/* Pinned Left: Number */}
                <th className="p-3.5 w-16 text-center sticky left-0 z-20 bg-slate-900 border-r border-slate-800 shadow-[2px_0_6px_rgba(0,0,0,0.3)]">
                  เลขที่
                </th>
                {/* Student Code */}
                <th className="p-3.5 w-24 text-center">รหัส</th>
                {/* Pinned Left: Name */}
                <th className="p-3.5 min-w-[190px] sticky left-16 z-20 bg-slate-900 border-r-2 border-slate-700 shadow-[4px_0_10px_rgba(0,0,0,0.35)]">
                  ชื่อ - นามสกุล
                </th>

                {/* Formative Breakdown Columns (30, 20, 20 etc.) */}
                {formativeSections.map((sec, sIdx) => (
                  <th
                    key={sec.id}
                    className="p-3 text-center min-w-[130px] max-w-[170px] bg-indigo-950/70 text-indigo-200 border-r border-slate-800 relative group"
                  >
                    <div className="flex items-center justify-center gap-1 font-bold text-amber-300 truncate">
                      <span>{sec.title}</span>
                      <button
                        type="button"
                        onClick={() => handleOpenFormativeModal(sec)}
                        className="p-0.5 text-slate-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                        title="แก้ไขหมวดคะแนนเก็บนี้"
                      >
                        <Edit3 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                      เต็ม {sec.weight} แต้ม
                      {sec.selectedAssignmentIds?.length > 0 && (
                        <span className="text-indigo-400 ml-1">
                          (ดึง {sec.selectedAssignmentIds.length} ช่อง)
                        </span>
                      )}
                    </div>
                  </th>
                ))}

                {/* Exam Columns (e.g. สอบปลายภาค 30) */}
                {examColumns.map((col) => (
                  <th
                    key={col.id}
                    className="p-3 text-center min-w-[130px] max-w-[160px] bg-slate-900/90 border-r border-slate-800 relative group"
                  >
                    <div className="flex items-center justify-center gap-1 font-bold text-amber-300 truncate">
                      <span>{col.title}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => handleOpenExamModal(col)}
                          className="p-0.5 text-slate-400 hover:text-white"
                          title="แก้ไขชื่อ/คะแนนเต็ม"
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
                        onClick={() => handleQuickFill(col.id, col.maxScore, col.title)}
                        className="text-[9px] text-indigo-400 hover:underline font-sans ml-1"
                        title="กรอกเต็มทุกคน"
                      >
                        (เต็มทุกคน)
                      </button>
                    </div>
                  </th>
                ))}

                {/* Net Total (100 Points) */}
                <th className="p-3.5 text-center min-w-[120px] bg-slate-950 text-amber-300 font-black border-r border-slate-800">
                  <div>รวมคะแนน</div>
                  <div className="text-[10px] text-slate-400 font-mono font-normal mt-0.5">
                    (เต็ม {totalCalculatedMax})
                  </div>
                </th>

                {/* Grade */}
                <th className="p-3.5 text-center w-24">ระดับเกรด</th>

                {/* Evaluation */}
                <th className="p-3.5 text-center min-w-[130px]">ผลการประเมิน</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-700/60 font-sans">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={5 + formativeSections.length + examColumns.length} className="p-8 text-center text-slate-400">
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

                      {/* Formative Breakdown Columns */}
                      {formativeSections.map((sec) => {
                        const secData = std.sectionScores[sec.id] || { calculated: 0, isLinked: false };
                        if (secData.isLinked) {
                          // Calculated from linked assignments
                          return (
                            <td
                              key={sec.id}
                              className="p-3 text-center bg-indigo-950/20 border-r border-slate-700/80"
                            >
                              <div className="font-mono font-bold text-base text-indigo-200">
                                {secData.calculated}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono">
                                (ดิบ {secData.rawGot}/{secData.rawMax})
                              </div>
                            </td>
                          );
                        } else {
                          // Direct entry formative column using ScoreWheelInput
                          return (
                            <td
                              key={sec.id}
                              className="p-2.5 text-center border-r border-slate-700/80"
                            >
                              <div className="flex justify-center">
                                <ScoreWheelInput
                                  value={secData.calculated}
                                  maxScore={parseFloat(sec.weight) || 10}
                                  minScore={0}
                                  step={parseFloat(sec.weight) <= 10 ? 0.5 : 1}
                                  onChange={(val) => handleDirectScoreChange(std.id, sec.id, val)}
                                  placeholder="-"
                                  className="w-20"
                                  title={`หมุนลูกกลิ้งเมาส์ หรือพิมพ์คะแนน ${sec.title} (เต็ม ${sec.weight})`}
                                />
                              </div>
                            </td>
                          );
                        }
                      })}

                      {/* Exam Columns with ScoreWheelInput */}
                      {examColumns.map((col) => {
                        const currentScore = std.examScoresMap[col.id];
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
                                onChange={(val) => handleDirectScoreChange(std.id, col.id, val)}
                                placeholder="-"
                                className="w-20"
                                title={`หมุนลูกกลิ้งเมาส์ หรือพิมพ์คะแนน ${col.title} (เต็ม ${col.maxScore})`}
                              />
                            </div>
                          </td>
                        );
                      })}

                      {/* Net Total Score (Large Font, Crisp Gold) */}
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

        {/* Footnote */}
        <div className="pt-2 text-xs text-slate-400 border-t border-slate-700/80 flex items-center justify-between flex-wrap gap-2">
          <span>* เกณฑ์การตัดเกรด 8 ระดับตามมาตรฐาน สพฐ.: 80-100 (4), 75-79 (3.5), 70-74 (3), 65-69 (2.5), 60-64 (2), 55-59 (1.5), 50-54 (1), 0-49 (0)</span>
          <span className="text-indigo-300 font-semibold">โรงเรียนวัดบางปูน • ครูซอส EdTech</span>
        </div>
      </div>

      {/* ================================================================================= */}
      {/* ⚙️ MODAL 1: ตั้งค่าสัดส่วนคะแนนตัดเกรด (100 คะแนน) - FIXED RESPONSIVE DIALOG       */}
      {/* ================================================================================= */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center animate-fade-in">
          <div className="bg-slate-850 w-full max-w-3xl max-h-[90vh] rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            {/* 1. FIXED HEADER - ALWAYS VISIBLE AT TOP */}
            <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between shrink-0 bg-slate-850 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-indigo-600/30 text-indigo-400 border border-indigo-500/40 shrink-0">
                  <Sliders className="w-5 h-5 sm:w-6 sm:h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white">
                    ตั้งค่าโครงสร้างสัดส่วนคะแนนตัดเกรด (100 คะแนน)
                  </h3>
                  <p className="text-xs text-slate-400">
                    แจงคะแนนเก็บเป็นช่องๆ (เช่น 30, 20, 20) และกำหนดคะแนนสอบให้รวมได้ 100 พอดี
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="p-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors shrink-0 cursor-pointer"
                title="ปิดหน้าต่าง"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 2. SCROLLABLE BODY - SCROLLS SMOOTHLY WITHOUT OVERFLOW */}
            <div className="p-4 sm:p-6 space-y-6 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-700">
              {/* Balance Summary Banner inside modal */}
              <div className={`p-4 rounded-2xl border flex items-center justify-between gap-3 ${
                isExact100
                  ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/60 text-rose-300'
              }`}>
                <div>
                  <div className="text-xs font-semibold">
                    คะแนนรวมปัจจุบัน: <span className="font-mono font-black text-base">{totalCalculatedMax}</span> / 100 คะแนน
                  </div>
                  <div className="text-[11px] opacity-80 mt-0.5">
                    คะแนนเก็บ ({totalFormativeWeight}) + คะแนนสอบ ({totalExamMaxScore})
                  </div>
                </div>

                {isExact100 ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 shrink-0">
                    <CheckCircle2 className="w-4 h-4" /> ครบ 100 คะแนนเป๊ะ
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleAutoBalance100}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow shrink-0 transition-transform active:scale-95 cursor-pointer"
                  >
                    ⚡ ปรับให้ครบ 100 ทันที
                  </button>
                )}
              </div>

              {/* Section A: Formative Breakdown (แจงคะแนนเก็บ เช่น 30, 20, 20) */}
              <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span>1. ช่องคะแนนเก็บระหว่างเรียน (รวม {totalFormativeWeight} คะแนน)</span>
                    </h4>
                    <p className="text-xs text-slate-400 mt-0.5">
                      สามารถแจงเป็นหมวดๆ ได้ เช่น เก็บ 70 = (30 + 20 + 20) พร้อมเลือกงานที่ดึงมารวม
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleOpenFormativeModal()}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มหมวดคะแนนเก็บ</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formativeSections.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-700">
                      ยังไม่มีหมวดคะแนนเก็บ (กดปุ่ม "+ เพิ่มหมวดคะแนนเก็บ" เพื่อเริ่มต้น)
                    </div>
                  ) : (
                    formativeSections.map((sec, idx) => {
                      const selectedCount = sec.selectedAssignmentIds?.length || 0;
                      return (
                        <div
                          key={sec.id}
                          className="p-4 rounded-xl bg-slate-900 border border-slate-700 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex items-center gap-2">
                              <span className="w-2 h-2 rounded-full bg-indigo-400 shrink-0"></span>
                              <span className="font-bold text-white text-sm">{sec.title}</span>
                              <span className="text-[11px] text-slate-400">
                                ({selectedCount > 0 ? `ดึง ${selectedCount} ช่องจากคะแนนเก็บ` : 'กรอกคะแนนเองในตาราง'})
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="font-mono font-black text-amber-300 text-sm">
                                {sec.weight} คะแนน
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenFormativeModal(sec)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="แก้ไขหมวดคะแนนและเลือกงาน"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteFormativeSection(sec.id)}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                                title="ลบหมวดคะแนนนี้"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Preview of selected assignments in this section */}
                          {selectedCount > 0 && (
                            <div className="text-[11px] text-indigo-300/80 bg-indigo-950/40 px-3 py-1.5 rounded-lg border border-indigo-900/50 truncate">
                              งานที่รวม: {assignments
                                .filter((a) => sec.selectedAssignmentIds?.includes(a.id))
                                .map((a) => a.title)
                                .join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Section B: Exam Columns (เช่น สอบปลายภาค 30) */}
              <div className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-400" />
                      <span>2. ช่องคะแนนสอบ (รวม {totalExamMaxScore} คะแนน)</span>
                    </h4>
                    <p className="text-xs text-slate-400">
                      คะแนนสอบปลายภาค หรือกลางภาคที่ใช้ตัดเกรด
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
                      ยังไม่มีช่องคะแนนสอบ (กดปุ่ม "+ เพิ่มช่องสอบ" เช่น สอบปลายภาค 30 แต้ม)
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
            </div>

            {/* 3. FIXED FOOTER - ALWAYS VISIBLE AT BOTTOM */}
            <div className="p-4 border-t border-slate-700 flex items-center justify-between shrink-0 bg-slate-900/90 z-10">
              <div className="text-xs text-slate-400">
                รวมทั้งสิ้น: <strong className="text-white font-mono">{totalCalculatedMax}</strong> / 100 แต้ม
              </div>

              <button
                type="button"
                onClick={() => setShowConfigModal(false)}
                className="px-6 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-transform active:scale-95 cursor-pointer"
              >
                บันทึกและปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* 📝 MODAL 2: เพิ่ม / แก้ไขหมวดคะแนนเก็บย่อย (เช่น 30, 20, 20)                       */}
      {/* ================================================================================= */}
      {showAddFormativeModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center animate-fade-in">
          <div className="bg-slate-850 w-full max-w-lg max-h-[90vh] rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between shrink-0 bg-slate-850">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>{editingFormativeId ? 'แก้ไขหมวดคะแนนเก็บ' : 'เพิ่มหมวดคะแนนเก็บใหม่'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddFormativeModal(false)}
                className="p-1.5 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitFormativeSection} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อหมวดคะแนนเก็บ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น คะแนนเก็บส่วนที่ 1, หน่วยที่ 1, ชิ้นงาน..."
                  value={formativeFormTitle}
                  onChange={(e) => setFormativeFormTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-600 text-sm text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  คะแนนเต็มหมวดนี้ (สัดส่วน) <span className="text-rose-400">*</span>
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="1"
                    max="100"
                    step="0.5"
                    required
                    value={formativeFormWeight}
                    onChange={(e) => setFormativeFormWeight(e.target.value)}
                    className="w-32 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-600 text-sm font-mono font-bold text-amber-300 text-center outline-none focus:border-indigo-400"
                  />
                  <span className="text-xs text-slate-400 font-semibold">คะแนน (เช่น 30 หรือ 20)</span>
                </div>
              </div>

              {/* Assignment Selector for this formative section */}
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    เลือกงานในสมุดคะแนนเก็บที่ดึงมาคำนวณในหมวดนี้:
                  </span>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setFormativeFormSelectedAsgs(assignments.map((a) => a.id))}
                      className="text-indigo-400 hover:underline"
                    >
                      เลือกทั้งหมด
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setFormativeFormSelectedAsgs([])}
                      className="text-slate-400 hover:underline"
                    >
                      ยกเลิกทั้งหมด
                    </button>
                  </div>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-slate-700">
                  {assignments.length === 0 ? (
                    <div className="p-3 text-center text-xs text-slate-400">
                      ยังไม่มีงานในสมุดคะแนนเก็บ (สามารถกรอกคะแนนหมวดนี้เองในตารางได้)
                    </div>
                  ) : (
                    assignments.map((a) => {
                      const isChecked = formativeFormSelectedAsgs.includes(a.id);
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
                              onChange={() => {
                                if (isChecked) {
                                  setFormativeFormSelectedAsgs(formativeFormSelectedAsgs.filter((id) => id !== a.id));
                                } else {
                                  setFormativeFormSelectedAsgs([...formativeFormSelectedAsgs, a.id]);
                                }
                              }}
                              className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-600 focus:ring-indigo-500"
                            />
                            <span className="font-semibold truncate">{a.title}</span>
                          </div>
                          <span className="font-mono font-bold text-amber-400 shrink-0 ml-2">
                            เต็ม {a.maxScore} แต้ม
                          </span>
                        </label>
                      );
                    })
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  * หากไม่เลือกงานใดเลย จะสามารถกรอกคะแนนของหมวดนี้ในตารางตัดเกรดได้โดยตรง
                </p>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2.5 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddFormativeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:opacity-95 text-white text-xs font-bold shadow flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingFormativeId ? 'บันทึกหมวดคะแนน' : 'สร้างหมวดคะแนน'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================================================================================= */}
      {/* ➕ MODAL 3: เพิ่ม / แก้ไขช่องคะแนนสอบ (Exam Column Modal)                           */}
      {/* ================================================================================= */}
      {showAddExamModal && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/85 backdrop-blur-md p-3 sm:p-5 flex items-center justify-center animate-fade-in">
          <div className="bg-slate-850 w-full max-w-md max-h-[90vh] rounded-3xl border-2 border-slate-700 shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-slate-700 flex items-center justify-between shrink-0 bg-slate-850">
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

            <form onSubmit={handleSubmitExamColumn} className="p-4 sm:p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ชื่อช่องคะแนนสอบ <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น สอบปลายภาค, สอบกลางภาค, สอบปฏิบัติ..."
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
                    <option value="สอบปลายภาค">สอบปลายภาค</option>
                    <option value="สอบกลางภาค">สอบกลางภาค</option>
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
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-indigo-950/60 border border-indigo-700/50 text-[11px] text-indigo-200">
                💡 <strong>เคล็ดลับ:</strong> คุณครูสามารถกรอกหรือเลื่อนลูกกลิ้งเมาส์ปรับคะแนนสอบให้นักเรียนในตารางได้สะดวก
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5 border-t border-slate-700">
                <button
                  type="button"
                  onClick={() => setShowAddExamModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-750 hover:bg-slate-700 text-slate-300 text-xs font-bold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-95 text-slate-950 text-xs font-black shadow-lg shadow-amber-500/20 flex items-center gap-1.5"
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
