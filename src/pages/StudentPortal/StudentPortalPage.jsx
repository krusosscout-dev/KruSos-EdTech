import React, { useState, useMemo } from 'react';
import {
  School, LogOut, BookOpen, Award, CheckSquare, Calendar, Trophy,
  Gamepad2, Star, CheckCircle2, AlertCircle, Sparkles, ChevronRight,
  TrendingUp, Users, ArrowRight
} from 'lucide-react';
import { StudentCartoonAvatar } from '../../components/StudentCartoonAvatar';
import { GradeLevelLeaderboard } from '../Leaderboard/GradeLevelLeaderboard';
import { calculateGrade } from '../../components/ExcelHelper';

export const StudentPortalPage = ({
  student,
  subjects = {},
  onLogout,
  onJoinRoom
}) => {
  const [activeTab, setActiveTab] = useState('scores'); // 'scores' | 'assessments' | 'attendance' | 'leaderboard' | 'liveRoom'
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [pinCode, setPinCode] = useState('');

  // Find all subjects this student is enrolled in
  const enrolledSubjects = useMemo(() => {
    return Object.values(subjects).filter((subj) => {
      return (subj.students || []).some((s) => s.id === student.id);
    });
  }, [subjects, student.id]);

  // Set default selected subject if not set
  const currentSubject = useMemo(() => {
    if (selectedSubjectId && subjects[selectedSubjectId]) {
      return subjects[selectedSubjectId];
    }
    return enrolledSubjects[0] || null;
  }, [selectedSubjectId, enrolledSubjects, subjects]);

  // Aggregate student metrics across enrolled subjects
  const studentMetrics = useMemo(() => {
    let totalScore = 0;
    let totalMax = 0;
    let totalSessions = 0;
    let attendedSessions = 0;
    let totalPeriodBonus = 0;

    enrolledSubjects.forEach((subj) => {
      const assignments = subj.assignments || [];
      assignments.forEach((a) => {
        const raw = subj.scores?.[student.id]?.[a.id];
        if (raw !== undefined && raw !== '') {
          totalScore += parseFloat(raw);
        }
        totalMax += parseFloat(a.maxScore) || 0;
      });

      const attendanceList = subj.attendance || [];
      attendanceList.forEach((session) => {
        const rec = session.records?.[student.id];
        if (rec) {
          totalSessions++;
          if (rec.status === 'present') attendedSessions++;
          if (rec.periodScore) totalPeriodBonus += parseFloat(rec.periodScore) || 0;
        }
      });
    });

    const percentage = totalMax > 0 ? parseFloat(((totalScore / totalMax) * 100).toFixed(1)) : 0;
    const overallGrade = calculateGrade(totalScore, totalMax);
    const attendancePct = totalSessions > 0 ? parseFloat(((attendedSessions / totalSessions) * 100).toFixed(1)) : 100;

    return {
      totalScore: parseFloat(totalScore.toFixed(1)),
      totalMax,
      percentage,
      overallGrade,
      totalSessions,
      attendedSessions,
      attendancePct,
      totalPeriodBonus
    };
  }, [enrolledSubjects, student.id]);

  // Assignments breakdown for current subject
  const currentSubjectAssignments = useMemo(() => {
    if (!currentSubject) return [];
    const assignments = currentSubject.assignments || [];
    return assignments.map((a) => {
      const raw = currentSubject.scores?.[student.id]?.[a.id];
      const hasScore = raw !== undefined && raw !== '';
      const scoreNum = hasScore ? parseFloat(raw) : null;
      const maxNum = parseFloat(a.maxScore) || 0;
      const pct = maxNum > 0 && scoreNum !== null ? ((scoreNum / maxNum) * 100).toFixed(0) : 0;

      return {
        id: a.id,
        title: a.title,
        category: a.category || 'ใบงาน',
        maxScore: maxNum,
        score: scoreNum,
        percentage: pct,
        isCompleted: hasScore
      };
    });
  }, [currentSubject, student.id]);

  // Attendance history for current subject
  const currentSubjectAttendance = useMemo(() => {
    if (!currentSubject) return [];
    const list = currentSubject.attendance || [];
    return list.map((session) => {
      const rec = session.records?.[student.id] || { status: 'absent', periodScore: 0 };
      return {
        id: session.id,
        date: session.date,
        period: session.period,
        topic: session.topic || 'บทเรียนประจำคาบ',
        status: rec.status || 'absent',
        periodScore: rec.periodScore || 0
      };
    });
  }, [currentSubject, student.id]);

  // Assessments for current subject
  const currentAssessments = useMemo(() => {
    if (!currentSubject) return null;
    return {
      characteristics: currentSubject.assessments?.characteristics?.[student.id] || {},
      competencies: currentSubject.assessments?.competencies?.[student.id] || {},
      readingAnalysis: currentSubject.assessments?.readingAnalysis?.[student.id] || 3
    };
  }, [currentSubject, student.id]);

  const handleJoinLive = (e) => {
    e.preventDefault();
    if (!pinCode.trim()) return;
    if (onJoinRoom) {
      onJoinRoom(pinCode.trim().toUpperCase());
    } else {
      alert(`🎉 เข้าร่วมห้องกิจกรรม PIN: ${pinCode.trim().toUpperCase()}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col font-sans">
      {/* Top Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-2xl p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 shadow-md shadow-indigo-600/30 shrink-0 flex items-center justify-center overflow-hidden">
              <img
                src="/kru-sauce-logo.jpg"
                alt="โลโก้ ครูซอส"
                className="w-full h-full object-cover rounded-[14px]"
              />
            </div>
            <div className="min-w-0">
              <div className="font-black text-sm sm:text-base text-white truncate flex items-center gap-2">
                <span>ระบบนักเรียนและผู้ปกครอง</span>
                <span className="px-2 py-0.5 rounded-full bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[10px] font-bold">
                  Student Portal
                </span>
              </div>
              <div className="text-xs text-slate-400 truncate">
                โรงเรียนวัดบางปูน • ปีการศึกษา 2569
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-rose-300 hover:text-rose-200 border border-rose-900/40 text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
            title="ออกจากระบบ / กลับสู่หน้าแรก"
          >
            <LogOut className="w-4 h-4" />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6 flex-1">
        {/* 1. Student Hero Profile Card */}
        <section className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/40">
          <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
            {/* Student Avatar & Basic Info */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="relative">
                <StudentCartoonAvatar
                  gender={student.gender}
                  title={student.title}
                  size="xl"
                  className="w-24 h-24 sm:w-28 sm:h-28 aspect-square rounded-full shadow-2xl"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-black text-white">
                    {student.title || ''}{student.name}
                  </h2>
                  <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white font-mono font-bold text-xs shadow-sm">
                    เลขที่ {student.studentNumber}
                  </span>
                </div>

                <div className="text-xs text-slate-300 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
                  <span>{student.gradeLevel}</span>
                  <span>•</span>
                  <span className="text-amber-300 font-mono font-bold">
                    รหัสประจำตัว: {student.studentCode || '-'}
                  </span>
                </div>

                <div className="pt-2 flex items-center justify-center sm:justify-start gap-2 text-xs">
                  <span className="px-2 py-1 rounded-lg bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>สถานะ: กำลังศึกษา</span>
                  </span>
                  <span className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold">
                    วิชาที่เรียน: {enrolledSubjects.length} วิชา
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Metrics Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full md:w-auto">
              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <div className="text-[11px] font-semibold text-slate-400">คะแนนเก็บรวม</div>
                <div className="text-xl font-black font-mono text-amber-300 mt-0.5">
                  {studentMetrics.totalScore}
                  <span className="text-[11px] font-normal text-slate-500"> / {studentMetrics.totalMax}</span>
                </div>
                <div className="text-[10px] text-amber-400 font-bold mt-0.5">
                  ({studentMetrics.percentage}%)
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center">
                <div className="text-[11px] font-semibold text-slate-400">ผลการเรียนเฉลี่ย</div>
                <div className="text-2xl font-black font-mono text-emerald-400 mt-0.5">
                  เกรด {studentMetrics.overallGrade}
                </div>
                <div className="text-[10px] text-emerald-400 font-bold mt-0.5">
                  เกณฑ์มาตรฐาน สพฐ.
                </div>
              </div>

              <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-center col-span-2 sm:col-span-1">
                <div className="text-[11px] font-semibold text-slate-400">การเข้าเรียน</div>
                <div className="text-xl font-black font-mono text-indigo-400 mt-0.5">
                  {studentMetrics.attendancePct}%
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">
                  แต้มพิเศษ: +{studentMetrics.totalPeriodBonus}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Navigation Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 text-xs font-bold border-b border-slate-800">
          <button
            onClick={() => setActiveTab('scores')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'scores'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>คะแนนรายวิชา & งาน</span>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'assessments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>ผลการประเมิน สพฐ.</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>การเข้าเรียน & แต้มคาบ</span>
          </button>

          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'leaderboard'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-amber-400 hover:text-amber-300 hover:bg-slate-900'
            }`}
          >
            <Trophy className="w-4 h-4" />
            <span>ทำเนียบเกียรติยศชั้นเรียน</span>
          </button>

          <button
            onClick={() => setActiveTab('liveRoom')}
            className={`px-4 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'liveRoom'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Gamepad2 className="w-4 h-4" />
            <span>ห้องกิจกรรมสด (PIN)</span>
          </button>
        </div>

        {/* 3. Subject Switcher Pills (for tabs that depend on subject) */}
        {(activeTab === 'scores' || activeTab === 'assessments' || activeTab === 'attendance') && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <span className="text-xs font-semibold text-slate-400 whitespace-nowrap">
              เลือกวิชา:
            </span>
            {enrolledSubjects.map((subj) => (
              <button
                key={subj.id}
                onClick={() => setSelectedSubjectId(subj.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all whitespace-nowrap ${
                  currentSubject?.id === subj.id
                    ? 'bg-indigo-600 text-white border-2 border-indigo-400 shadow-md'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span>{subj.icon || '📚'}</span>
                <span>{subj.name}</span>
                <span className="font-mono text-[11px] opacity-75">({subj.code})</span>
              </button>
            ))}
          </div>
        )}

        {/* ========================================================
           TAB 1: SCORES & ASSIGNMENTS
           ======================================================== */}
        {activeTab === 'scores' && currentSubject && (
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-indigo-400" />
                    <span>คะแนนเก็บรายชิ้นงาน: {currentSubject.name} ({currentSubject.code})</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    รายการงานที่ได้รับมอบหมาย สถานะการส่ง และคะแนนที่ได้รับ
                  </p>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-400">เกรดวิชานี้</div>
                  <div className="text-xl font-black font-mono text-emerald-400">
                    เกรด {calculateGrade(
                      (currentSubject.assignments || []).reduce((acc, a) => {
                        const s = currentSubject.scores?.[student.id]?.[a.id];
                        return acc + (s !== undefined && s !== '' ? parseFloat(s) : 0);
                      }, 0),
                      (currentSubject.assignments || []).reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0)
                    )}
                  </div>
                </div>
              </div>

              {/* Assignments List Cards */}
              {currentSubjectAssignments.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <BookOpen className="w-10 h-10 mx-auto text-slate-600 mb-2" />
                  <p>ยังไม่มีรายการงานในวิชานี้</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {currentSubjectAssignments.map((asg, idx) => (
                    <div
                      key={asg.id}
                      className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 font-semibold">
                            ชิ้นที่ {idx + 1} • {asg.category}
                          </span>
                          <h4 className="font-bold text-sm text-white mt-1 truncate">
                            {asg.title}
                          </h4>
                        </div>

                        {asg.isCompleted ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-700/60 text-emerald-300 font-bold text-[10px] shrink-0">
                            ตรวจแล้ว
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-950 border border-amber-700/60 text-amber-300 font-bold text-[10px] shrink-0">
                            รอส่ง / รอตรวจ
                          </span>
                        )}
                      </div>

                      {/* Score Display & Progress */}
                      <div className="flex items-baseline justify-between pt-1">
                        <span className="text-xs text-slate-400">คะแนนที่ได้:</span>
                        <div className="text-base font-black font-mono text-white">
                          {asg.score !== null ? (
                            <span className="text-amber-300">{asg.score}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                          <span className="text-xs font-normal text-slate-400"> / {asg.maxScore}</span>
                        </div>
                      </div>

                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, Math.max(0, asg.percentage))}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 2: STANDARD ASSESSMENTS (สพฐ.)
           ======================================================== */}
        {activeTab === 'assessments' && currentSubject && (
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-6">
              <div>
                <h3 className="font-bold text-base text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-emerald-400" />
                  <span>ผลการประเมิน 3 ด้านตามเกณฑ์ สพฐ.: {currentSubject.name}</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  คุณลักษณะอันพึงประสงค์ 8 ข้อ, สมรรถนะสำคัญ 5 ด้าน และการอ่าน คิดวิเคราะห์ เขียน
                </p>
              </div>

              {/* 1. คุณลักษณะอันพึงประสงค์ 8 ข้อ */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Star className="w-4 h-4 text-amber-400" />
                  <span>คุณลักษณะอันพึงประสงค์ (8 ข้อ)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    '1. รักชาติ ศาสน์ กษัตริย์',
                    '2. ซื่อสัตย์สุจริต',
                    '3. มีวินัย',
                    '4. ใฝ่เรียนรู้',
                    '5. อยู่อย่างพอเพียง',
                    '6. มุ่งมั่นในการทำงาน',
                    '7. รักความเป็นไทย',
                    '8. มีจิตสาธารณะ'
                  ].map((label, idx) => {
                    const score = currentAssessments?.characteristics?.[idx + 1] ?? 3;
                    return (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                        <div className="text-[11px] text-slate-300 font-medium truncate" title={label}>
                          {label}
                        </div>
                        <div className="text-base font-black font-mono text-emerald-400">
                          ระดับ {score}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {score === 3 ? 'ดีเยี่ยม' : score === 2 ? 'ดี' : 'ผ่าน'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. สมรรถนะสำคัญของผู้เรียน 5 ด้าน */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-400" />
                  <span>สมรรถนะสำคัญของผู้เรียน (5 ด้าน)</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
                  {[
                    '1. การสื่อสาร',
                    '2. การคิด',
                    '3. การแก้ปัญหา',
                    '4. ทักษะชีวิต',
                    '5. การใช้เทคโนโลยี'
                  ].map((label, idx) => {
                    const score = currentAssessments?.competencies?.[idx + 1] ?? 3;
                    return (
                      <div key={idx} className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-1">
                        <div className="text-[11px] text-slate-300 font-medium truncate" title={label}>
                          {label}
                        </div>
                        <div className="text-base font-black font-mono text-indigo-400">
                          ระดับ {score}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {score === 3 ? 'ดีเยี่ยม' : score === 2 ? 'ดี' : 'ผ่าน'}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 3. การอ่าน คิดวิเคราะห์ และเขียน */}
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
                <div>
                  <div className="font-bold text-sm text-white">การอ่าน คิดวิเคราะห์ และเขียน</div>
                  <div className="text-xs text-slate-400">ประเมินความสามารถด้านการจับใจความและสรุปความรู้</div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black font-mono text-emerald-400">
                    ระดับ {currentAssessments?.readingAnalysis ?? 3} (ดีเยี่ยม)
                  </div>
                  <div className="text-[11px] text-emerald-300 font-bold">ผ่านเกณฑ์การประเมิน</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 3: ATTENDANCE & PERIOD BONUS
           ======================================================== */}
        {activeTab === 'attendance' && currentSubject && (
          <div className="space-y-4">
            <div className="glass-panel rounded-3xl p-5 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-indigo-400" />
                    <span>ประวัติการเข้าเรียน & แต้มพฤติกรรม: {currentSubject.name}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    บันทึกการมาเรียนในแต่ละคาบ และคะแนนเสริมพิเศษ
                  </p>
                </div>
              </div>

              {/* Attendance Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900 text-slate-300 border-b border-slate-800 font-bold uppercase">
                      <th className="p-3 text-center w-16">ครั้งที่</th>
                      <th className="p-3">วันที่</th>
                      <th className="p-3">หัวข้อคาบเรียน</th>
                      <th className="p-3 text-center w-28">สถานะเข้าเรียน</th>
                      <th className="p-3 text-center w-24">แต้มพิเศษ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {currentSubjectAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400">
                          ยังไม่มีบันทึกการเข้าเรียนในวิชานี้
                        </td>
                      </tr>
                    ) : (
                      currentSubjectAttendance.map((item, idx) => {
                        const statusColors = {
                          present: 'bg-emerald-950 text-emerald-300 border-emerald-700/60',
                          late: 'bg-amber-950 text-amber-300 border-amber-700/60',
                          leave: 'bg-blue-950 text-blue-300 border-blue-700/60',
                          absent: 'bg-rose-950 text-rose-300 border-rose-700/60'
                        }[item.status] || 'bg-slate-800 text-slate-400';

                        const statusLabels = {
                          present: 'มาเรียน',
                          late: 'สาย',
                          leave: 'ลา',
                          absent: 'ขาด'
                        }[item.status] || item.status;

                        return (
                          <tr key={item.id} className="hover:bg-slate-900/50 transition-colors">
                            <td className="p-3 text-center font-mono text-slate-400 font-bold">
                              {idx + 1}
                            </td>
                            <td className="p-3 font-mono text-slate-300">
                              {item.date}
                            </td>
                            <td className="p-3 font-medium text-white">
                              {item.topic}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full border text-[11px] font-bold ${statusColors}`}>
                                {statusLabels}
                              </span>
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-amber-300">
                              {item.periodScore > 0 ? `+${item.periodScore}` : '-'}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================
           TAB 4: LEADERBOARD & HALL OF FAME
           ======================================================== */}
        {activeTab === 'leaderboard' && (
          <div className="space-y-4">
            <GradeLevelLeaderboard
              subjects={subjects}
              initialGradeLevel={student.gradeLevel || ''}
              onBack={() => setActiveTab('scores')}
              onSelectSubject={(subjId) => {
                setSelectedSubjectId(subjId);
                setActiveTab('scores');
              }}
            />
          </div>
        )}

        {/* ========================================================
           TAB 5: LIVE QUIZ ROOM (PIN JOIN)
           ======================================================== */}
        {activeTab === 'liveRoom' && (
          <div className="max-w-md mx-auto py-6 space-y-4">
            <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl text-center space-y-4">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-purple-600 to-pink-600 flex items-center justify-center text-3xl mx-auto shadow-xl shadow-purple-600/30">
                🎮
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  เข้าร่วมห้องกิจกรรมสด
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  กรอกรหัส PIN 4-6 หลักที่คุณครูซอสแสดงบนหน้าจอเพื่อเข้าร่วมตอบคำถาม
                </p>
              </div>

              <form onSubmit={handleJoinLive} className="space-y-3">
                <input
                  type="text"
                  maxLength={6}
                  placeholder="เช่น 123456"
                  value={pinCode}
                  onChange={(e) => setPinCode(e.target.value.toUpperCase())}
                  className="w-full text-center py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-700 text-xl font-mono font-black text-amber-300 tracking-widest outline-none focus:border-purple-400 uppercase"
                />

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-90 text-white font-black text-sm shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all"
                >
                  <span>เข้าสู่ห้องกิจกรรม</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
