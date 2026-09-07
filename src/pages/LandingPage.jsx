import React, { useState } from 'react';
import {
  BookOpen, Plus, Search, Users, Award, FileText, Sparkles, CheckCircle2,
  Calendar, ChevronRight, School, Trash2, ArrowRight, Clock, Star, Volume2, VolumeX, Trophy
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import { calculateGrade } from '../components/ExcelHelper';

const SUBJECT_COLORS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Amber', value: '#f59e0b' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Violet', value: '#8b5cf6' },
];

const SUBJECT_ICONS = ['💻', '🔬', '📐', '📚', '🎨', '⚽', '🌐', '🤖', '🎵', '🌿'];

export const LandingPage = ({ subjects = {}, onSelectSubject, onCreateSubject, onDeleteSubject, onResetMock, onOpenLeaderboard }) => {
  const { soundMuted, toggleSound } = useSocket();

  // Create Subject Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [gradeLevel, setGradeLevel] = useState('ชั้นประถมศึกษาปีที่ 5');
  const [academicYear, setAcademicYear] = useState('2569');
  const [semester, setSemester] = useState('1');
  const [color, setColor] = useState('#6366f1');
  const [icon, setIcon] = useState('💻');

  // Student Quick Search State (Requirement 4: Unified in one modern page)
  const [searchSubjectId, setSearchSubjectId] = useState('');
  const [searchStudentInput, setSearchStudentInput] = useState('');
  const [studentResult, setStudentResult] = useState(null);
  const [searchError, setSearchError] = useState('');

  const subjectList = Object.values(subjects);

  // Compute aggregate statistics
  const totalSubjects = subjectList.length;
  const totalStudents = subjectList.reduce((acc, s) => acc + (s.students?.length || 0), 0);
  const totalAssignments = subjectList.reduce((acc, s) => acc + (s.assignments?.length || 0), 0);

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!code.trim() || !name.trim()) return;

    onCreateSubject({
      code: code.trim().toUpperCase(),
      name: name.trim(),
      gradeLevel,
      academicYear,
      semester,
      color,
      icon
    });

    setShowCreateModal(false);
    setCode('');
    setName('');
  };

  const handleStudentSearch = (e) => {
    e.preventDefault();
    setSearchError('');
    setStudentResult(null);

    if (!searchSubjectId) {
      setSearchError('กรุณาเลือกรายวิชาที่ต้องการตรวจสอบ');
      return;
    }

    const targetSubj = subjects[searchSubjectId];
    if (!targetSubj) {
      setSearchError('ไม่พบข้อมูลรายวิชา');
      return;
    }

    const q = searchStudentInput.trim().toLowerCase();
    if (!q) {
      setSearchError('กรุณากรอกเลขที่ หรือรหัสนักเรียน');
      return;
    }

    const found = (targetSubj.students || []).find((s) => {
      return (
        String(s.studentNumber) === q ||
        String(s.studentCode || '').toLowerCase() === q ||
        s.name.toLowerCase().includes(q)
      );
    });

    if (!found) {
      setSearchError(`ไม่พบข้อมูลนักเรียน "${searchStudentInput}" ในวิชานี้`);
      return;
    }

    // Compute Student Summary
    let totalScore = 0;
    const assignments = targetSubj.assignments || [];
    const totalMax = assignments.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);

    const taskBreakdown = assignments.map((a) => {
      const s = targetSubj.scores?.[found.id]?.[a.id];
      const val = s !== undefined && s !== '' ? parseFloat(s) : null;
      if (val !== null) totalScore += val;
      return {
        title: a.title,
        maxScore: a.maxScore,
        score: val
      };
    });

    // Attendance stats
    let totalSessions = (targetSubj.attendance || []).length;
    let presentCount = 0;
    let periodBonus = 0;
    (targetSubj.attendance || []).forEach((session) => {
      const rec = session.records?.[found.id];
      if (rec?.status === 'present') presentCount++;
      periodBonus += (parseFloat(rec?.periodBonusPoints) || 0);
    });

    const attendPct = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;
    const grade = calculateGrade(totalScore, totalMax);

    setStudentResult({
      student: found,
      subject: targetSubj,
      totalScore,
      totalMax,
      grade,
      attendPct,
      periodBonus,
      taskBreakdown
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-4 py-3 sm:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-pink-500 p-0.5 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-xl">
                🏫
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-base sm:text-lg tracking-tight text-white">
                  ระบบบันทึกคะแนนและวัดผลการเรียนรู้
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-300 border border-indigo-700 text-[10px] font-bold">
                  สพฐ. ปพ.5
                </span>
              </div>
              <div className="text-xs text-slate-400">
                คุณครูซอส • โรงเรียนวัดบางปูน • ปีการศึกษา 2569
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSound}
              className={`p-2.5 rounded-xl border transition-all ${
                soundMuted
                  ? 'bg-slate-900 border-slate-800 text-slate-500'
                  : 'bg-indigo-950/60 border-indigo-600/50 text-indigo-300'
              }`}
              title={soundMuted ? 'เปิดเสียง' : 'ปิดเสียง'}
            >
              {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              onClick={() => {
                if (window.confirm('คุณต้องการโหลดชุดข้อมูลจำลองสมบูรณ์แบบ (4 รายวิชา พร้อมนักเรียน 15 คน คะแนนเต็ม 100 เช็คชื่อ และประเมิน สพฐ. ครบถ้วน) หรือไม่?')) {
                  onResetMock?.();
                }
              }}
              className="px-3.5 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-slate-600 text-amber-300 font-bold text-xs shadow flex items-center gap-1.5 transition-all active:scale-95"
              title="โหลดข้อมูลตัวอย่าง 4 รายวิชาแบบครบชุด"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="hidden sm:inline">โหลดข้อมูลจำลอง</span>
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => onOpenLeaderboard()}
                className="px-3.5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/40 text-amber-300 font-bold text-xs shadow-lg shadow-amber-500/10 flex items-center gap-1.5 transition-all active:scale-95"
                title="ดูทำเนียบเกียรติยศและอันดับคะแนนรวมทุกวิชาในระดับชั้น"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>🏆 ทำเนียบเกียรติยศ & อันดับรวม</span>
              </button>
            )}

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ เพิ่มวิชาใหม่</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Hub */}
      <main className="max-w-7xl w-full mx-auto p-4 sm:p-8 space-y-8 flex-1">
        {/* Statistics Hero Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden shadow-lg">
            <div className="text-xs font-semibold text-slate-400 mb-1">รายวิชาที่รับผิดชอบ</div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400">
              {totalSubjects}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">วิชาที่กำลังสอน</div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden shadow-lg">
            <div className="text-xs font-semibold text-slate-400 mb-1">นักเรียนทั้งหมด</div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
              {totalStudents}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">คนในทุกห้อง</div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden shadow-lg">
            <div className="text-xs font-semibold text-slate-400 mb-1">ชิ้นงาน/ภารกิจทั้งหมด</div>
            <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
              {totalAssignments}
            </div>
            <div className="text-[11px] text-slate-500 mt-1">ช่องคะแนนเก็บ</div>
          </div>

          <div className="glass-card rounded-3xl p-5 border border-slate-800/80 relative overflow-hidden shadow-lg flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-400 mb-1">มาตรฐานการประเมิน</div>
              <div className="text-base font-bold text-white">ตามเกณฑ์ สพฐ.</div>
            </div>
            <div className="text-[11px] text-indigo-300 font-medium">
              คุณลักษณะ • สมรรถนะ • อ่านคิด
            </div>
          </div>
        </div>

        {/* Hall of Fame & Leaderboard Banner */}
        {onOpenLeaderboard && (
          <div
            onClick={() => onOpenLeaderboard()}
            className="glass-card rounded-3xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-950/40 via-purple-950/30 to-indigo-950/40 hover:border-amber-500/60 transition-all cursor-pointer shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4 group"
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-600 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform shrink-0">
                🏆
              </div>
              <div>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h3 className="text-base sm:text-lg font-black text-amber-200">
                    ทำเนียบเกียรติยศ & ลำดับคะแนนระดับชั้น (Top 3 Podium)
                  </h3>
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-bold border border-amber-500/30">
                    ใหม่
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  ดูแท่นรางวัลเหรียญทอง-เงิน-ทองแดง สรุปคะแนนรวมทุกวิชาในชั้นเดียวกัน หรือแยกดูรายวิชา พร้อมอันดับ 1 ถึงสุดท้ายและส่งออก Excel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shrink-0 shadow-md group-hover:bg-amber-400 transition-colors">
              <span>เปิดทำเนียบรางวัล</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        )}

        {/* Section 1: Subject Cards Grid */}
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div>
              <h2 className="text-xl font-black text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                <span>รายวิชาของคุณครู (คลิกเพื่อบันทึกคะแนน)</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                เลือกวิชาเพื่อเปิดสมุดคะแนน, รวมงาน, เช็คชื่อ, ประเมินคุณลักษณะ และสุ่มตอบคำถาม
              </p>
            </div>
          </div>

          {subjectList.length === 0 ? (
            <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-3">
              <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-lg font-bold text-white">ยังไม่มีรายวิชา</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                กดปุ่ม &quot;+ เพิ่มวิชาใหม่&quot; ด้านบนเพื่อเริ่มต้นสร้างรายวิชาแรกของคุณครู
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {subjectList.map((subj) => {
                const sStudents = subj.students || [];
                const sAssignments = subj.assignments || [];

                return (
                  <div
                    key={subj.id}
                    className="glass-panel rounded-3xl p-6 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-5 shadow-xl hover:-translate-y-1 relative group"
                  >
                    <div>
                      {/* Card Header: Icon, Code & Delete */}
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-lg border border-white/10"
                            style={{ backgroundColor: `${subj.color || '#6366f1'}33` }}
                          >
                            {subj.icon || '📘'}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-xs px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-indigo-300">
                              {subj.code}
                            </span>
                            <div className="text-[11px] text-slate-400 mt-1">
                              {subj.gradeLevel}
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (window.confirm(`คุณแน่ใจหรือไม่ว่าต้องการลบวิชา "${subj.name}"? ข้อมูลคะแนนและนักเรียนในวิชานี้จะถูกลบทั้งหมด`)) {
                              onDeleteSubject(subj.id);
                            }
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-500 hover:text-rose-400 transition-all"
                          title="ลบรายวิชานี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subject Name */}
                      <h3 className="font-bold text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                        {subj.name}
                      </h3>
                      <div className="text-xs text-slate-400 mt-1">
                        ภาคเรียนที่ {subj.semester}/{subj.academicYear}
                      </div>
                    </div>

                    {/* Stats Pill Row */}
                    <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-emerald-400" />
                        <span>นักเรียน <strong>{sStudents.length}</strong> คน</span>
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>ชิ้นงาน <strong>{sAssignments.length}</strong> ช่อง</span>
                      </span>
                    </div>

                    {/* Enter Subject Workstation Button */}
                    <button
                      onClick={() => onSelectSubject(subj)}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 hover:from-indigo-600 hover:to-pink-600 border border-slate-700 hover:border-transparent text-white font-bold text-xs flex items-center justify-center gap-2 shadow transition-all group/btn"
                    >
                      <span>เข้าจัดการคะแนนและชั้นเรียน</span>
                      <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* Section 2: Student Quick Grade Search Widget (Requirement 4: Unified in same modern page) */}
        <section className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/90 shadow-2xl relative overflow-hidden">
          <div className="max-w-3xl mx-auto space-y-5">
            <div className="text-center space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 text-xs font-semibold">
                <Search className="w-3.5 h-3.5" />
                <span>มุมนักเรียน: ค้นหาและตรวจสอบผลการเรียนของตนเอง</span>
              </div>
              <h3 className="text-xl font-extrabold text-white">
                เช็คคะแนนเก็บสะสมและสถิติเวลาเรียน
              </h3>
              <p className="text-xs text-slate-400">
                เลือกวิชาและกรอกเลขที่ หรือรหัสนักเรียน เพื่อดูผลการเรียนทันที
              </p>
            </div>

            <form onSubmit={handleStudentSearch} className="flex flex-col sm:flex-row gap-3">
              <select
                value={searchSubjectId}
                onChange={(e) => setSearchSubjectId(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500 font-semibold"
                required
              >
                <option value="">-- เลือกรายวิชา --</option>
                {subjectList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.code} {s.name} ({s.gradeLevel})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="กรอกเลขที่ หรือรหัสนักเรียน..."
                value={searchStudentInput}
                onChange={(e) => setSearchStudentInput(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-emerald-500 font-medium"
                required
              />

              <button
                type="submit"
                className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all active:scale-95 shrink-0"
              >
                <Search className="w-4 h-4" />
                <span>ค้นหาคะแนน</span>
              </button>
            </form>

            {searchError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs text-center">
                {searchError}
              </div>
            )}

            {/* Search Result Card */}
            {studentResult && (
              <div className="bg-slate-900 rounded-2xl p-6 border border-slate-700 space-y-5 animate-pop">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-slate-800 text-center sm:text-left">
                  <div>
                    <div className="text-xs text-indigo-400 font-mono font-bold">
                      เลขที่ {studentResult.student.studentNumber} {studentResult.student.studentCode ? `• รหัส ${studentResult.student.studentCode}` : ''}
                    </div>
                    <h4 className="text-xl font-bold text-white">
                      {studentResult.student.title || ''}{studentResult.student.name}
                    </h4>
                    <div className="text-xs text-slate-400">
                      วิชา: {studentResult.subject.code} {studentResult.subject.name}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Grade Badge */}
                    <div className="text-center bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">เกรดปัจจุบัน</div>
                      <div className="text-2xl font-black text-amber-400 font-mono">
                        {studentResult.grade}
                      </div>
                    </div>

                    {/* Total Score Badge */}
                    <div className="text-center bg-slate-950 px-4 py-2 rounded-xl border border-slate-800">
                      <div className="text-[10px] text-slate-400 uppercase">คะแนนรวม</div>
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {studentResult.totalScore} <span className="text-xs text-slate-500 font-normal">/ {studentResult.totalMax}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attendance & Period Bonus Stats */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">สถิติเวลาเรียน: </span>
                    <strong className="text-white">{studentResult.attendPct}%</strong>
                    <span className="text-[10px] text-slate-500 ml-1">
                      ({studentResult.attendPct >= 80 ? 'ผ่านเกณฑ์ 80%' : 'ต่ำกว่าเกณฑ์'})
                    </span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400">แต้มจิตพิสัยรายคาบ: </span>
                    <strong className="text-amber-400 font-mono">+{studentResult.periodBonus} แต้ม</strong>
                  </div>
                </div>

                {/* Tasks Score Breakdown */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    คะแนนแต่ละชิ้นงาน:
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {studentResult.taskBreakdown.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-300 truncate">{t.title}</span>
                        <span className="font-mono font-bold shrink-0">
                          {t.score !== null ? (
                            <span className="text-emerald-400">{t.score} / {t.maxScore}</span>
                          ) : (
                            <span className="text-slate-500">ยังไม่ตรวจ</span>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full px-4 sm:px-8 py-6 border-t border-slate-900 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4">
        <div>
          © 2569 โรงเรียนวัดบางปูน • ระบบบันทึกคะแนนและวัดผลการเรียนรู้รายวิชา (ครูซอส)
        </div>
        <div className="flex items-center gap-4">
          <span>รองรับ Excel ปพ.5</span>
          <span>•</span>
          <span>สพฐ. มาตรฐานการศึกษา</span>
        </div>
      </footer>

      {/* Modal: Create Subject */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>เพิ่มรายวิชาใหม่</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">รหัสวิชา</label>
                  <input
                    type="text"
                    placeholder="เช่น ว15101"
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-xs text-white uppercase outline-none focus:border-indigo-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อรายวิชา</label>
                  <input
                    type="text"
                    placeholder="เช่น วิทยาการคำนวณ ป.5"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ระดับชั้น</label>
                  <input
                    type="text"
                    value={gradeLevel}
                    onChange={(e) => setGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ภาคเรียน</label>
                  <input
                    type="text"
                    value={semester}
                    onChange={(e) => setSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 text-center"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={academicYear}
                    onChange={(e) => setAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500 text-center"
                  />
                </div>
              </div>

              {/* Icon selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">เลือกไอคอนวิชา</label>
                <div className="flex gap-1.5 bg-slate-950 p-2 rounded-xl border border-slate-800 overflow-x-auto">
                  {SUBJECT_ICONS.map((ic) => (
                    <button
                      key={ic}
                      type="button"
                      onClick={() => setIcon(ic)}
                      className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-transform ${
                        icon === ic ? 'bg-indigo-600 scale-110 shadow' : 'hover:bg-slate-800'
                      }`}
                    >
                      {ic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">เลือกธีมสี</label>
                <div className="flex gap-2 bg-slate-950 p-2 rounded-xl border border-slate-800">
                  {SUBJECT_COLORS.map((c) => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => setColor(c.value)}
                      className={`w-7 h-7 rounded-full transition-transform ${
                        color === c.value ? 'scale-125 ring-2 ring-white' : 'opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: c.value }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  สร้างรายวิชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
