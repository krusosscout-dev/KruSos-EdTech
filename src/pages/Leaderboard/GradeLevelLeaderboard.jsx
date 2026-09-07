import React, { useState, useMemo } from 'react';
import {
  Trophy, Crown, Medal, Award, ArrowLeft, Search, Download, Printer,
  Sparkles, CheckCircle2, ChevronDown, BookOpen, Users, Star, BarChart2,
  TrendingUp, School, Layers, Filter
} from 'lucide-react';
import confetti from 'canvas-confetti';
import * as XLSX from 'xlsx';
import { calculateGrade } from '../../components/ExcelHelper';
import { StudentCartoonAvatar } from '../../components/StudentCartoonAvatar';

export const GradeLevelLeaderboard = ({ subjects = {}, onBack, onSelectSubject, initialGradeLevel = '' }) => {
  const subjectList = useMemo(() => Object.values(subjects), [subjects]);

  // Extract unique grade levels from all subjects
  const availableGradeLevels = useMemo(() => {
    const levels = new Set();
    subjectList.forEach(s => {
      if (s.gradeLevel) levels.add(s.gradeLevel);
    });
    const arr = Array.from(levels);
    // Sort logically
    return arr.length > 0 ? arr : ['ชั้นประถมศึกษาปีที่ 5/1'];
  }, [subjectList]);

  // Selected Grade Level
  const [selectedGrade, setSelectedGrade] = useState(() => {
    if (initialGradeLevel && availableGradeLevels.includes(initialGradeLevel)) {
      return initialGradeLevel;
    }
    return availableGradeLevels[0] || 'ชั้นประถมศึกษาปีที่ 5/1';
  });

  // Scope Mode: 'all' (รวมทุกวิชาในสายชั้น) | 'single' (แยกตามรายวิชา)
  const [scopeMode, setScopeMode] = useState('all');

  // If scopeMode is 'single', which subject is chosen
  const subjectsInGrade = useMemo(() => {
    return subjectList.filter(s => s.gradeLevel === selectedGrade);
  }, [subjectList, selectedGrade]);

  const [selectedSubjectId, setSelectedSubjectId] = useState(() => {
    return subjectsInGrade[0]?.id || '';
  });

  // Search in ranking table
  const [searchTerm, setSearchTerm] = useState('');
  // Table view: start from rank 4 (default) as requested by Kru Sauce (since top 3 are already on the podium)
  const [includeTop3InTable, setIncludeTop3InTable] = useState(false);

  // Trigger celebration confetti
  const handleFireConfetti = () => {
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  };

  // Compute rankings data
  const rankingData = useMemo(() => {
    if (subjectsInGrade.length === 0) return { list: [], top3: [], subjectsUsed: [], totalPossibleMax: 0 };

    // 1. Single Subject Mode
    if (scopeMode === 'single') {
      const targetSubj = subjectsInGrade.find(s => s.id === selectedSubjectId) || subjectsInGrade[0];
      if (!targetSubj) return { list: [], top3: [], subjectsUsed: [], totalPossibleMax: 0 };

      const totalMax = (targetSubj.assignments || []).reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);
      const studentMap = (targetSubj.students || []).map(std => {
        let total = 0;
        (targetSubj.assignments || []).forEach(a => {
          const raw = targetSubj.scores?.[std.id]?.[a.id];
          if (raw !== undefined && raw !== '') {
            total += parseFloat(raw);
          }
        });

        const pct = totalMax > 0 ? (total / totalMax) * 100 : 0;
        const grade = calculateGrade(total, totalMax);

        return {
          id: std.id,
          studentNumber: std.studentNumber,
          studentCode: std.studentCode || '',
          title: std.title || '',
          name: std.name,
          totalScore: parseFloat(total.toFixed(1)),
          maxScore: totalMax,
          percentage: parseFloat(pct.toFixed(1)),
          grade,
          breakdown: {
            [targetSubj.id]: {
              code: targetSubj.code,
              name: targetSubj.name,
              score: parseFloat(total.toFixed(1)),
              max: totalMax,
              percentage: parseFloat(pct.toFixed(1))
            }
          }
        };
      });

      // Sort descending by score
      studentMap.sort((a, b) => b.totalScore - a.totalScore || a.studentNumber - b.studentNumber);

      // Assign ranks (with ties handled)
      let currentRank = 1;
      const rankedList = studentMap.map((item, idx, arr) => {
        if (idx > 0 && item.totalScore < arr[idx - 1].totalScore) {
          currentRank = idx + 1;
        }
        return {
          ...item,
          rank: currentRank
        };
      });

      return {
        list: rankedList,
        top3: rankedList.slice(0, 3),
        subjectsUsed: [targetSubj],
        totalPossibleMax: totalMax
      };
    }

    // 2. All Subjects Combined Mode
    // Gather all students across subjects in this grade
    const studentMasterMap = new Map();
    let combinedMaxScore = 0;

    subjectsInGrade.forEach(subj => {
      const subjMax = (subj.assignments || []).reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);
      combinedMaxScore += subjMax;

      (subj.students || []).forEach(std => {
        if (!studentMasterMap.has(std.id)) {
          studentMasterMap.set(std.id, {
            id: std.id,
            studentNumber: std.studentNumber,
            studentCode: std.studentCode || '',
            title: std.title || '',
            name: std.name,
            totalScore: 0,
            breakdown: {}
          });
        }

        const entry = studentMasterMap.get(std.id);

        let subjScore = 0;
        (subj.assignments || []).forEach(a => {
          const raw = subj.scores?.[std.id]?.[a.id];
          if (raw !== undefined && raw !== '') {
            subjScore += parseFloat(raw);
          }
        });

        entry.totalScore += subjScore;
        entry.breakdown[subj.id] = {
          code: subj.code,
          name: subj.name,
          color: subj.color,
          icon: subj.icon,
          score: parseFloat(subjScore.toFixed(1)),
          max: subjMax,
          percentage: subjMax > 0 ? parseFloat(((subjScore / subjMax) * 100).toFixed(1)) : 0
        };
      });
    });

    const studentsArray = Array.from(studentMasterMap.values()).map(item => {
      const pct = combinedMaxScore > 0 ? (item.totalScore / combinedMaxScore) * 100 : 0;
      const grade = calculateGrade(item.totalScore, combinedMaxScore);

      return {
        ...item,
        totalScore: parseFloat(item.totalScore.toFixed(1)),
        maxScore: combinedMaxScore,
        percentage: parseFloat(pct.toFixed(1)),
        grade
      };
    });

    // Sort descending by totalScore
    studentsArray.sort((a, b) => b.totalScore - a.totalScore || a.studentNumber - b.studentNumber);

    let currentRank = 1;
    const rankedList = studentsArray.map((item, idx, arr) => {
      if (idx > 0 && item.totalScore < arr[idx - 1].totalScore) {
        currentRank = idx + 1;
      }
      return {
        ...item,
        rank: currentRank
      };
    });

    return {
      list: rankedList,
      top3: rankedList.slice(0, 3),
      subjectsUsed: subjectsInGrade,
      totalPossibleMax: combinedMaxScore
    };
  }, [subjectsInGrade, scopeMode, selectedSubjectId]);

  // Filtered by Search & Rank 4+ Start condition
  const filteredRankings = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();

    // When searching, search all students so teacher can find any student
    if (q) {
      return rankingData.list.filter(s => {
        return (
          s.name.toLowerCase().includes(q) ||
          String(s.studentNumber).includes(q) ||
          String(s.studentCode || '').includes(q)
        );
      });
    }

    // Default: start from rank 4 onwards (as requested: top 3 are already on the podium!)
    if (!includeTop3InTable) {
      return rankingData.list.filter(s => s.rank >= 4);
    }

    return rankingData.list;
  }, [rankingData.list, searchTerm, includeTop3InTable]);

  // Overall Statistics
  const stats = useMemo(() => {
    const list = rankingData.list;
    if (list.length === 0) return { avgPct: 0, grade4Count: 0, passCount: 0 };
    const totalPct = list.reduce((acc, s) => acc + s.percentage, 0);
    const avgPct = (totalPct / list.length).toFixed(1);
    const grade4Count = list.filter(s => s.grade === '4').length;
    const passCount = list.filter(s => parseFloat(s.grade) >= 1).length;
    return { avgPct, grade4Count, passCount };
  }, [rankingData.list]);

  // Top 3 for Podium
  const rank1 = rankingData.top3[0] || null;
  const rank2 = rankingData.top3[1] || null;
  const rank3 = rankingData.top3[2] || null;

  // Export to Excel
  const handleExportExcel = () => {
    if (rankingData.list.length === 0) return;

    const exportRows = rankingData.list.map(s => {
      const row = {
        'อันดับ': s.rank,
        'เลขที่': s.studentNumber,
        'รหัสนักเรียน': s.studentCode || '-',
        'ชื่อ-นามสกุล': `${s.title || ''}${s.name}`
      };

      if (scopeMode === 'all') {
        rankingData.subjectsUsed.forEach(subj => {
          const b = s.breakdown[subj.id];
          row[`วิชา ${subj.name} (${b?.max || 0})`] = b ? b.score : '-';
        });
      }

      row['คะแนนรวม'] = s.totalScore;
      row['คะแนนเต็ม'] = s.maxScore;
      row['ร้อยละ (%)'] = s.percentage;
      row['เกรดที่ได้'] = s.grade;
      row['ผลการประเมิน'] = s.percentage >= 80 ? 'ดีเยี่ยม' : s.percentage >= 65 ? 'ดี' : s.percentage >= 50 ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์';

      return row;
    });

    const ws = XLSX.utils.json_to_sheet(exportRows);
    const wb = XLSX.utils.book_new();
    const sheetTitle = scopeMode === 'all' ? 'อันดับคะแนนรวมสายชั้น' : 'อันดับคะแนนรายวิชา';
    XLSX.utils.book_append_sheet(wb, ws, sheetTitle);

    const filename = `ทำเนียบอันดับคะแนน_${selectedGrade}_${scopeMode === 'all' ? 'รวมทุกวิชา' : 'รายวิชา'}.xlsx`;
    XLSX.writeFile(wb, filename);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-850/95 backdrop-blur-md border-b border-slate-700/80 px-4 sm:px-6 py-3.5 shadow-xl">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white transition-all active:scale-95 flex items-center gap-1.5 shadow"
              title="กลับสู่หน้าก่อนหน้า"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-xs font-bold hidden sm:inline">ย้อนกลับ</span>
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-bold">
                  🏆 HALL OF FAME
                </span>
                <span className="text-xs text-slate-400 font-semibold hidden md:inline">
                  โรงเรียนวัดบางปูน • ปีการศึกษา 2569
                </span>
              </div>
              <h1 className="text-base sm:text-lg font-black text-white leading-tight mt-0.5">
                ทำเนียบเกียรติยศ & อันดับคะแนนรวมระดับชั้น
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleFireConfetti}
              className="px-3.5 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 shadow"
              title="เฉลิมฉลองนักเรียนอันดับ 1-3"
            >
              <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
              <span className="hidden sm:inline">เฉลิมฉลอง</span>
            </button>

            <button
              onClick={handleExportExcel}
              className="px-3.5 py-2 rounded-xl bg-emerald-900/60 hover:bg-emerald-800/80 border border-emerald-500/50 text-emerald-200 text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              title="ดาวน์โหลดตารางอันดับเป็นไฟล์ Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ส่งออก Excel</span>
            </button>

            <button
              onClick={() => window.print()}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
              title="สั่งพิมพ์รายงานประกาศผลอันดับ"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">พิมพ์</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Controls Card: Grade Level & Scope Toggle */}
        <div className="bg-slate-800 p-5 rounded-3xl border-2 border-slate-700 shadow-xl space-y-4">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            {/* Grade Level Selector */}
            <div className="space-y-1.5 w-full lg:w-auto">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-400" />
                <span>เลือกระดับชั้น / ห้องเรียน:</span>
              </label>
              <div className="flex items-center gap-2 flex-wrap">
                {availableGradeLevels.map(grade => (
                  <button
                    key={grade}
                    onClick={() => {
                      setSelectedGrade(grade);
                      // Auto-select first subject of new grade if in single mode
                      const firstSubj = subjectList.find(s => s.gradeLevel === grade);
                      if (firstSubj) setSelectedSubjectId(firstSubj.id);
                    }}
                    className={`px-4 py-2 rounded-2xl font-bold text-xs transition-all ${
                      selectedGrade === grade
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105 ring-2 ring-indigo-400'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {grade}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Mode Switcher (รวมทุกวิชา vs แยกรายวิชา) */}
            <div className="space-y-1.5 w-full lg:w-auto">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Filter className="w-4 h-4 text-amber-400" />
                <span>โหมดการประมวลผลคะแนน:</span>
              </label>
              <div className="inline-flex p-1 rounded-2xl bg-slate-900 border border-slate-700 w-full sm:w-auto">
                <button
                  onClick={() => setScopeMode('all')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    scopeMode === 'all'
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>รวมทุกวิชาในระดับชั้น ({subjectsInGrade.length} วิชา)</span>
                </button>

                <button
                  onClick={() => setScopeMode('single')}
                  className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                    scopeMode === 'single'
                      ? 'bg-indigo-600 text-white font-bold shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>แยกตามรายวิชา</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sub-Subject Selector when in 'single' mode */}
          {scopeMode === 'single' && (
            <div className="pt-3 border-t border-slate-700/80 flex items-center gap-2 flex-wrap animate-pop">
              <span className="text-xs font-semibold text-slate-400 mr-1">เลือกวิชา:</span>
              {subjectsInGrade.map(subj => (
                <button
                  key={subj.id}
                  onClick={() => setSelectedSubjectId(subj.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
                    selectedSubjectId === subj.id
                      ? 'bg-slate-700 text-white border-2 border-indigo-400 shadow'
                      : 'bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-700'
                  }`}
                >
                  <span>{subj.icon || '📚'}</span>
                  <span>{subj.name}</span>
                  <span className="font-mono text-[11px] text-amber-300 font-normal">({subj.code})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Overview KPI Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>นักเรียนในสายชั้น</span>
            </div>
            <div className="text-2xl font-black font-mono text-white mt-1">
              {rankingData.list.length} <span className="text-xs font-normal text-slate-400">คน</span>
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <BookOpen className="w-3.5 h-3.5 text-emerald-400" />
              <span>วิชาที่นำมาประมวลผล</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
              {rankingData.subjectsUsed.length} <span className="text-xs font-normal text-slate-400">วิชา</span>
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {rankingData.subjectsUsed.map(s => s.name).join(', ')}
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>คะแนนเฉลี่ยร้อยละ</span>
            </div>
            <div className="text-2xl font-black font-mono text-blue-300 mt-1">
              {stats.avgPct}%
            </div>
          </div>

          <div className="bg-slate-800 p-4 rounded-2xl border border-slate-700 shadow-md">
            <div className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-400" />
              <span>ผลการเรียนยอดเยี่ยม (เกรด 4)</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-300 mt-1">
              {stats.grade4Count} <span className="text-xs font-normal text-slate-400">คน</span>
            </div>
          </div>
        </div>

        {/* 🏆 TOP 3 3D PODIUM SECTION */}
        <section className="bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 p-6 rounded-3xl border-2 border-slate-700 shadow-2xl overflow-hidden relative">
          <div className="text-center mb-6 space-y-1">
            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black tracking-wider uppercase">
              👑 เกียรติประวัติสูงสุด • แท่นรางวัลอันดับ 1 - 3
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white">
              {scopeMode === 'all'
                ? `แชมป์คะแนนรวมทุกวิชา ${selectedGrade}`
                : `แชมป์ประจำวิชา ${rankingData.subjectsUsed[0]?.name || ''}`}
            </h2>
            <p className="text-xs text-slate-400">
              {scopeMode === 'all'
                ? `รวมคะแนนเต็ม ${rankingData.totalPossibleMax} แต้ม จากทั้งหมด ${rankingData.subjectsUsed.length} รายวิชา`
                : `คะแนนเต็ม ${rankingData.totalPossibleMax} แต้ม`}
            </p>
          </div>

          {/* 3D Podium Container */}
          <div className="w-full flex items-end justify-center gap-2.5 sm:gap-6 pt-10 pb-4 px-2 sm:px-6 max-w-4xl mx-auto min-h-[380px]">
            {/* 🥈 2nd Place (Left) */}
            <div className="flex-1 flex flex-col items-center order-1 transition-all duration-500">
              {rank2 ? (
                <div className="w-full flex flex-col items-center animate-pop">
                  {/* Cute Student Cartoon Avatar (Rank 2) */}
                  <div className="mb-3">
                    <StudentCartoonAvatar
                      gender={rank2.gender}
                      title={rank2.title}
                      rank={2}
                      size="lg"
                    />
                  </div>

                  {/* Name & Points */}
                  <div className="text-center mb-3">
                    <div className="font-bold text-sm sm:text-base text-white truncate max-w-[130px] sm:max-w-[180px]">
                      {rank2.title || ''}{rank2.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      เลขที่ {rank2.studentNumber}
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-slate-200 font-mono tracking-tight mt-1">
                      {rank2.totalScore} <span className="text-[11px] font-normal text-slate-400">({rank2.percentage}%)</span>
                    </div>
                    <div className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-slate-700 text-slate-200 font-mono text-[11px] font-bold">
                      เกรด {rank2.grade}
                    </div>
                  </div>

                  {/* Podium Pillar */}
                  <div className="w-full bg-gradient-to-t from-slate-900 via-slate-800 to-slate-700 rounded-t-3xl border-t-2 border-x-2 border-slate-400 p-4 flex flex-col items-center justify-center shadow-xl h-44 sm:h-52 relative overflow-hidden">
                    <Medal className="w-10 h-10 text-slate-300 mb-1 drop-shadow" />
                    <div className="text-3xl sm:text-4xl font-black text-slate-200 font-mono">2</div>
                    <div className="text-[11px] font-bold text-slate-300 uppercase">รองชนะเลิศอันดับ 1</div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600 text-xs">ว่าง</div>
                  <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-36"></div>
                </div>
              )}
            </div>

            {/* 🥇 1st Place (Center - Elevated Champion) */}
            <div className="flex-1 flex flex-col items-center order-2 z-10 transition-all duration-500">
              {rank1 ? (
                <div className="w-full flex flex-col items-center animate-pop">
                  {/* Cute Student Cartoon Avatar (Rank 1 Champion) */}
                  <div className="mb-3">
                    <StudentCartoonAvatar
                      gender={rank1.gender}
                      title={rank1.title}
                      rank={1}
                      size="xl"
                    />
                  </div>

                  {/* Name & Points */}
                  <div className="text-center mb-3">
                    <div className="font-black text-base sm:text-lg text-amber-300 truncate max-w-[150px] sm:max-w-[210px]">
                      {rank1.title || ''}{rank1.name}
                    </div>
                    <div className="text-xs text-amber-200/80">
                      เลขที่ {rank1.studentNumber} • รหัส {rank1.studentCode || '-'}
                    </div>
                    <div className="text-xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight mt-1 drop-shadow">
                      {rank1.totalScore} <span className="text-xs font-bold text-amber-200">({rank1.percentage}%)</span>
                    </div>
                    <div className="inline-block px-2.5 py-0.5 mt-0.5 rounded-lg bg-amber-500 text-slate-950 font-mono text-xs font-black shadow">
                      เกรด {rank1.grade}
                    </div>
                  </div>

                  {/* 1st Podium Pillar */}
                  <div className="w-full bg-gradient-to-t from-amber-950 via-amber-900 to-amber-600 rounded-t-3xl border-t-4 border-x-2 border-amber-300 p-4 flex flex-col items-center justify-center shadow-2xl h-56 sm:h-68 relative overflow-hidden ring-1 ring-amber-400/40">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-300/30 via-transparent to-transparent animate-pulse"></div>
                    <Trophy className="w-12 h-12 sm:w-16 sm:h-16 text-amber-200 mb-1 drop-shadow-[0_4px_12px_rgba(245,158,11,0.8)]" />
                    <div className="text-4xl sm:text-6xl font-black text-white font-mono drop-shadow">1</div>
                    <div className="text-xs sm:text-sm font-black text-amber-200 uppercase tracking-wider">
                      อันดับ 1 ชนะเลิศ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600 text-xs">ว่าง</div>
                  <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-44"></div>
                </div>
              )}
            </div>

            {/* 🥉 3rd Place (Right) */}
            <div className="flex-1 flex flex-col items-center order-3 transition-all duration-500">
              {rank3 ? (
                <div className="w-full flex flex-col items-center animate-pop">
                  {/* Cute Student Cartoon Avatar (Rank 3) */}
                  <div className="mb-3">
                    <StudentCartoonAvatar
                      gender={rank3.gender}
                      title={rank3.title}
                      rank={3}
                      size="lg"
                    />
                  </div>

                  {/* Name & Points */}
                  <div className="text-center mb-3">
                    <div className="font-bold text-sm sm:text-base text-white truncate max-w-[130px] sm:max-w-[180px]">
                      {rank3.title || ''}{rank3.name}
                    </div>
                    <div className="text-xs text-slate-400">
                      เลขที่ {rank3.studentNumber}
                    </div>
                    <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono tracking-tight mt-1">
                      {rank3.totalScore} <span className="text-[11px] font-normal text-amber-200/80">({rank3.percentage}%)</span>
                    </div>
                    <div className="inline-block px-2 py-0.5 mt-0.5 rounded-md bg-amber-950 text-amber-200 border border-amber-700 font-mono text-[11px] font-bold">
                      เกรด {rank3.grade}
                    </div>
                  </div>

                  {/* Podium Pillar */}
                  <div className="w-full bg-gradient-to-t from-slate-950 via-amber-950/80 to-amber-900/90 rounded-t-3xl border-t-2 border-x-2 border-amber-600 p-4 flex flex-col items-center justify-center shadow-xl h-36 sm:h-44 relative overflow-hidden">
                    <Medal className="w-9 h-9 text-amber-400 mb-1 drop-shadow" />
                    <div className="text-3xl sm:text-4xl font-black text-amber-200 font-mono">3</div>
                    <div className="text-[11px] font-bold text-amber-300 uppercase">รองชนะเลิศอันดับ 2</div>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col items-center opacity-40">
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-700 mb-3 flex items-center justify-center text-slate-600 text-xs">ว่าง</div>
                  <div className="w-full bg-slate-900/60 rounded-t-2xl border-t border-x border-slate-800 h-28"></div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* 📋 COMPLETE RANKINGS TABLE (#1 ถึงคนสุดท้าย) */}
        <section className="bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-2xl p-5 space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span>
                  {includeTop3InTable || searchTerm
                    ? `ตารางจัดอันดับผลสัมฤทธิ์ทางการเรียน (${rankingData.list.length} คน)`
                    : `ตารางคะแนนและจัดอันดับ (เริ่มอันดับที่ 4 ถึง ${rankingData.list.length})`}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {!includeTop3InTable && !searchTerm
                  ? '👑 3 อันดับแรกแสดงบนแท่นรางวัลเกียรติยศด้านบนแล้ว'
                  : 'เรียงลำดับจากคะแนนสูงสุดไปต่ำสุดตามเกณฑ์มาตรฐาน สพฐ.'}
              </p>
            </div>

            {/* Controls: Start at Rank 4 toggle & Search */}
            <div className="flex items-center gap-3 w-full md:w-auto flex-wrap justify-end">
              {/* Toggle: เริ่มอันดับ 4 vs แสดงทุกคน */}
              <div className="flex items-center p-1 bg-slate-900 rounded-xl border border-slate-700 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setIncludeTop3InTable(false)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    !includeTop3InTable
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="เริ่มแสดงจากอันดับ 4 เป็นต้นไป (เนื่องจาก 3 อันดับแรกอยู่บนแท่นรางวัลแล้ว)"
                >
                  เริ่มอันดับ 4 ({Math.max(0, rankingData.list.length - 3)} คน)
                </button>
                <button
                  type="button"
                  onClick={() => setIncludeTop3InTable(true)}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    includeTop3InTable
                      ? 'bg-indigo-600 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="แสดงทุกคนรวมอันดับ 1-3"
                >
                  แสดงทุกคน ({rankingData.list.length} คน)
                </button>
              </div>

              {/* Search Input */}
              <div className="relative w-full sm:w-60">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="ค้นหาเลขที่ หรือชื่อนักเรียน..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-600 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-400"
                />
              </div>
            </div>
          </div>

          {/* Table Container with Crisp Separation */}
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-200 border-b-2 border-slate-600 font-bold uppercase text-xs">
                  <th className="p-3.5 w-16 text-center">อันดับ</th>
                  <th className="p-3.5 w-14 text-center">เลขที่</th>
                  <th className="p-3.5 w-24 text-center">รหัส</th>
                  <th className="p-3.5 min-w-[190px]">ชื่อ - นามสกุล</th>

                  {/* If scopeMode is 'all', display column for each subject */}
                  {scopeMode === 'all' && rankingData.subjectsUsed.map(subj => (
                    <th key={subj.id} className="p-3 text-center min-w-[110px] text-slate-300 font-medium">
                      <div className="text-xs font-bold text-white truncate max-w-[130px] mx-auto">
                        {subj.name}
                      </div>
                      <div className="text-[10px] text-amber-300 font-mono">
                        (เต็ม {(subj.assignments || []).reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0)})
                      </div>
                    </th>
                  ))}

                  <th className="p-3.5 text-center font-bold text-amber-300 min-w-[100px]">
                    <div>คะแนนรวม</div>
                    <div className="text-[10px] text-amber-400 font-mono font-normal">
                      (เต็ม {rankingData.totalPossibleMax})
                    </div>
                  </th>

                  <th className="p-3.5 text-center font-bold text-indigo-300 w-24">
                    ร้อยละ (%)
                  </th>

                  <th className="p-3.5 text-center font-bold text-emerald-300 w-20">
                    เกรด
                  </th>

                  <th className="p-3.5 text-center font-bold text-slate-300 w-28">
                    ผลการประเมิน
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-700/60 font-sans">
                {filteredRankings.length === 0 ? (
                  <tr>
                    <td colSpan={6 + (scopeMode === 'all' ? rankingData.subjectsUsed.length : 0)} className="p-8 text-center text-slate-400">
                      ไม่พบข้อมูลนักเรียนที่ตรงกับเงื่อนไขการค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredRankings.map((std) => {
                    const isTop1 = std.rank === 1;
                    const isTop2 = std.rank === 2;
                    const isTop3 = std.rank === 3;

                    let rankBadge = (
                      <span className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-700 font-mono font-bold text-slate-300 text-sm flex items-center justify-center mx-auto shadow-sm">
                        {std.rank}
                      </span>
                    );

                    if (isTop1) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs shadow-md">
                          🥇 อันดับ 1
                        </span>
                      );
                    } else if (isTop2) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-300 text-slate-900 font-black text-xs shadow">
                          🥈 อันดับ 2
                        </span>
                      );
                    } else if (isTop3) {
                      rankBadge = (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-800 text-amber-200 border border-amber-600 font-bold text-xs shadow">
                          🥉 อันดับ 3
                        </span>
                      );
                    }

                    return (
                      <tr
                        key={std.id}
                        className={`transition-colors ${
                          isTop1
                            ? 'bg-amber-950/20 hover:bg-amber-950/30 font-semibold'
                            : 'bg-slate-800 hover:bg-slate-750'
                        }`}
                      >
                        {/* Rank Badge */}
                        <td className="p-3.5 text-center">
                          {rankBadge}
                        </td>

                        {/* Student Number */}
                        <td className="p-3.5 text-center font-mono font-bold text-base text-slate-200">
                          {std.studentNumber}
                        </td>

                        {/* Student Code */}
                        <td className="p-3.5 text-center font-mono text-xs text-slate-400">
                          {std.studentCode || '-'}
                        </td>

                        {/* Student Name with Cute Cartoon Avatar */}
                        <td className="p-3.5 font-bold text-base text-white">
                          <div className="flex items-center gap-2.5">
                            <StudentCartoonAvatar
                              gender={std.gender}
                              title={std.title}
                              rank={std.rank}
                              size="xs"
                              className="w-7 h-7 shrink-0 aspect-square"
                            />
                            <span className={isTop1 ? 'text-amber-300 font-black' : ''}>
                              {std.title || ''}{std.name}
                            </span>
                          </div>
                        </td>

                        {/* Subject Breakdown Columns (when 'all' mode) */}
                        {scopeMode === 'all' && rankingData.subjectsUsed.map(subj => {
                          const b = std.breakdown[subj.id];
                          return (
                            <td key={subj.id} className="p-3 text-center font-mono text-sm text-slate-300">
                              {b ? (
                                <div>
                                  <span className="font-bold text-white">{b.score}</span>
                                  <span className="text-[10px] text-slate-400"> / {b.max}</span>
                                </div>
                              ) : (
                                <span className="text-slate-600">-</span>
                              )}
                            </td>
                          );
                        })}

                        {/* Total Score */}
                        <td className="p-3.5 text-center font-mono font-black text-base text-amber-300">
                          {std.totalScore}
                        </td>

                        {/* Percentage */}
                        <td className="p-3.5 text-center font-mono font-bold text-sm text-indigo-300">
                          {std.percentage}%
                        </td>

                        {/* Grade */}
                        <td className="p-3.5 text-center">
                          <span className={`inline-block px-2.5 py-1 rounded-lg font-mono font-black text-xs ${
                            std.grade === '4'
                              ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-300'
                              : parseFloat(std.grade) >= 3
                              ? 'bg-blue-500/20 border border-blue-500 text-blue-300'
                              : parseFloat(std.grade) >= 2
                              ? 'bg-amber-500/20 border border-amber-500 text-amber-300'
                              : 'bg-rose-500/20 border border-rose-500 text-rose-300'
                          }`}>
                            เกรด {std.grade}
                          </span>
                        </td>

                        {/* Evaluation Status */}
                        <td className="p-3.5 text-center text-xs font-bold">
                          {std.percentage >= 80 ? (
                            <span className="text-emerald-400 flex items-center justify-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>ดีเยี่ยม</span>
                            </span>
                          ) : std.percentage >= 65 ? (
                            <span className="text-blue-400">ดี</span>
                          ) : std.percentage >= 50 ? (
                            <span className="text-amber-400">ผ่านเกณฑ์</span>
                          ) : (
                            <span className="text-rose-400">ไม่ผ่านเกณฑ์</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
};
