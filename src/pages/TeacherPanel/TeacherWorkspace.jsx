import React, { useState, useRef } from 'react';
import {
  Menu, BookOpen, Plus, Sparkles, Camera, Download, Award, Users,
  BarChart2, FileText, CheckSquare, Layers, ArrowRight, Trash2, Printer,
  Database, Upload, ShieldCheck, RefreshCw, FileJson, CheckCircle2, AlertCircle
} from 'lucide-react';
import { TeacherSidebar } from '../../components/TeacherSidebar';
import { GradebookTable } from '../SubjectWorkspace/GradebookTable';
import { FinalGradingView } from '../SubjectWorkspace/FinalGradingView';
import { AssignmentHub } from '../SubjectWorkspace/AssignmentHub';
import { StandardAssessmentView } from '../SubjectWorkspace/StandardAssessmentView';
import { AttendanceTracker } from '../SubjectWorkspace/AttendanceTracker';
import { StudentRosterManager } from '../SubjectWorkspace/StudentRosterManager';
import { GradeLevelLeaderboard } from '../Leaderboard/GradeLevelLeaderboard';
import { exportComprehensiveExcel } from '../../components/ExcelHelper';
import { LuckyWheelModal } from '../../components/LuckyWheelModal';
import { CameraScanner } from '../AdminPanel/CameraScanner';
import { MasterRosterManager } from './MasterRosterManager';
import { MasterRosterStore } from '../../services/masterRosterStore';
import { BackupService } from '../../services/backupService';
import { confirmDialog, alertDialog } from '../../components/ModernDialog';

export const TeacherWorkspace = ({
  subjects = {},
  selectedSubjectId = '',
  onSelectSubject,
  onSaveSubject,
  onCreateSubject,
  onDeleteSubject,
  onResetMock,
  onLogout
}) => {
  const [activeMenu, setActiveMenu] = useState('overview'); // 'overview' | 'gradebook' | 'assignments' | 'grading' | 'leaderboard' | 'assessments' | 'attendance' | 'roster' | 'masterRoster' | 'tools' | 'reports'
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Classroom Tool Modals
  const [showWheel, setShowWheel] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Create Subject Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newGradeLevel, setNewGradeLevel] = useState('ชั้นประถมศึกษาปีที่ 6/1');
  const [newAcademicYear, setNewAcademicYear] = useState('2569');
  const [newSemester, setNewSemester] = useState('1');
  const [newColor, setNewColor] = useState('#6366f1');
  const [newIcon, setNewIcon] = useState('💻');
  const [autoImportRoster, setAutoImportRoster] = useState(true);

  const subjectList = Object.values(subjects);
  const activeSubject = subjects[selectedSubjectId] || subjectList[0] || null;

  // Summary Metrics across all subjects
  const totalSubjects = subjectList.length;
  const totalStudents = subjectList.reduce((acc, s) => acc + (s.students?.length || 0), 0);
  const totalAssignments = subjectList.reduce((acc, s) => acc + (s.assignments?.length || 0), 0);

  // Backup & Restore State
  const [backupSuccess, setBackupSuccess] = useState('');
  const [backupError, setBackupError] = useState('');
  const [restoring, setRestoring] = useState(false);
  const backupFileInputRef = useRef(null);

  const handleExportBackup = () => {
    setBackupSuccess('');
    setBackupError('');
    const res = BackupService.exportFullBackup();
    if (res.success) {
      setBackupSuccess(`ดาวน์โหลดไฟล์สำรองข้อมูล "${res.fileName}" เรียบร้อยแล้ว!`);
      setTimeout(() => setBackupSuccess(''), 4000);
    } else {
      setBackupError(`เกิดข้อผิดพลาดในการสำรองข้อมูล: ${res.error}`);
    }
  };

  const handleImportBackup = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const confirmRestore = await confirmDialog({
      title: 'ยืนยันการกู้คืนฐานข้อมูลทั้งระบบ',
      message: 'การกู้คืนข้อมูลจะนำเข้าข้อมูลรายวิชาและทะเบียนนักเรียนจากไฟล์สำรองมาใช้งาน',
      detail: '⚠️ ข้อมูลปัจจุบันจะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรอง กรุณาตรวจสอบให้แน่ใจว่าเป็นไฟล์สำรองที่ถูกต้อง',
      type: 'warning',
      confirmText: 'ยืนยันกู้คืนข้อมูล',
      cancelText: 'ยกเลิก'
    });
    if (!confirmRestore) {
      if (backupFileInputRef.current) backupFileInputRef.current.value = '';
      return;
    }

    setRestoring(true);
    setBackupSuccess('');
    setBackupError('');

    try {
      const res = await BackupService.importFullBackup(file);
      setBackupSuccess(
        `🎉 กู้คืนข้อมูลสำเร็จ! กู้คืนได้ ${res.subjectCount} วิชา และทะเบียนกลาง ${res.rosterCount} ระดับชั้น ระบบจะรีโหลดเพื่อแสดงข้อมูลล่าสุด...`
      );
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (err) {
      setBackupError(err.message || 'เกิดข้อผิดพลาดในการกู้คืนข้อมูล');
    } finally {
      setRestoring(false);
      if (backupFileInputRef.current) backupFileInputRef.current.value = '';
    }
  };

  // Subject Update Handlers
  const handleUpdateScore = (studentId, assignmentId, score) => {
    if (!activeSubject) return;
    const updated = {
      ...activeSubject,
      scores: {
        ...(activeSubject.scores || {}),
        [studentId]: {
          ...(activeSubject.scores?.[studentId] || {}),
          [assignmentId]: score
        }
      }
    };
    onSaveSubject(updated);
  };

  const handleAddAssignment = (newAsg) => {
    if (!activeSubject) return;
    const asgObj = {
      ...newAsg,
      id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...activeSubject,
      assignments: [...(activeSubject.assignments || []), asgObj]
    };
    onSaveSubject(updated);
  };

  const handleUpdateAssignment = (asgId, updates) => {
    if (!activeSubject) return;
    const updated = {
      ...activeSubject,
      assignments: (activeSubject.assignments || []).map((a) =>
        a.id === asgId ? { ...a, ...updates } : a
      )
    };
    onSaveSubject(updated);
  };

  const handleDeleteAssignment = (asgId) => {
    if (!activeSubject) return;
    const updated = {
      ...activeSubject,
      assignments: (activeSubject.assignments || []).filter((a) => a.id !== asgId)
    };
    onSaveSubject(updated);
  };

  const handleSaveAssessments = (type, data) => {
    if (!activeSubject) return;
    const updated = {
      ...activeSubject,
      assessments: {
        ...(activeSubject.assessments || {}),
        [type]: data
      }
    };
    onSaveSubject(updated);
  };

  const handleSaveAttendance = (sessionData) => {
    if (!activeSubject) return;
    const currentList = activeSubject.attendance ? [...activeSubject.attendance] : [];
    const idx = currentList.findIndex((s) => s.id === sessionData.id);
    if (idx >= 0) {
      currentList[idx] = sessionData;
    } else {
      currentList.push(sessionData);
    }
    const updated = {
      ...activeSubject,
      attendance: currentList
    };
    onSaveSubject(updated);
  };

  const handleUpdateStudents = (studentsList) => {
    if (!activeSubject) return;
    const updated = {
      ...activeSubject,
      students: studentsList
    };
    onSaveSubject(updated);
  };

  const handleAddStudent = (studentData) => {
    if (!activeSubject) return;
    const newStudent = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const current = activeSubject.students ? [...activeSubject.students] : [];
    const updated = {
      ...activeSubject,
      students: [...current, newStudent]
    };
    onSaveSubject(updated);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    if (!newCode.trim() || !newName.trim()) return;

    let initialStudents = [];
    if (autoImportRoster) {
      const fromMaster = MasterRosterStore.getStudentsByGrade(newGradeLevel);
      if (fromMaster && fromMaster.length > 0) {
        initialStudents = fromMaster.map((s) => ({ ...s }));
      }
    }

    onCreateSubject({
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      gradeLevel: newGradeLevel,
      academicYear: newAcademicYear,
      semester: newSemester,
      color: newColor,
      icon: newIcon,
      students: initialStudents
    });

    setShowCreateModal(false);
    setNewCode('');
    setNewName('');
  };

  // Lucky wheel items for active subject
  const wheelStudents = (activeSubject?.students || []).map((s) => ({
    id: s.id,
    name: `เลขที่ ${s.studentNumber} ${s.title || ''}${s.name}`,
    color: activeSubject.color || '#6366f1',
    mascot: s.gender === 'ญ' ? '👧' : '👦',
    score: 0
  }));

  const menuTitles = {
    overview: '🏠 แดชบอร์ดภาพรวมรายวิชา',
    gradebook: '📚 สมุดบันทึกคะแนนเก็บ',
    assignments: '📝 หน้ารวมงานและภารกิจ',
    grading: '🎯 สรุปผลและตัดเกรด (ฐาน 100 คะแนน)',
    leaderboard: '🏆 ทำเนียบเกียรติยศระดับชั้น (Top 3 Podium)',
    assessments: '📋 ประเมิน 3 ด้านตามเกณฑ์ สพฐ.',
    attendance: '📅 เช็คชื่อ & แต้มพฤติกรรมรายคาบ',
    roster: '👥 รายชื่อนักเรียนในวิชานี้',
    masterRoster: '🏫 ทะเบียนนักเรียนแยกตามระดับชั้น (คลังรายชื่อกลาง)',
    tools: '🎡 เครื่องมือเสริมในห้องเรียน',
    reports: '📊 ส่งออก ปพ.5 & รายงานทางการ',
    backup: '💾 สำรองและกู้คืนระบบ (1-Click JSON Backup)'
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex font-sans">
      {/* 1. Left Sidebar Navigation */}
      <TeacherSidebar
        activeMenu={activeMenu}
        onSelectMenu={(menuKey) => setActiveMenu(menuKey)}
        subjects={subjects}
        selectedSubjectId={activeSubject?.id || ''}
        onSelectSubject={(id) => onSelectSubject(id)}
        onLogout={onLogout}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      {/* 2. Main Workspace Layout */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ${
          collapsed ? 'lg:ml-20' : 'lg:ml-72'
        }`}
      >
        {/* Top App Header */}
        <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800 px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-3">
            {/* Left: Hamburger & Current View Title */}
            <div className="flex items-center gap-3 min-w-0">
              <button
                type="button"
                onClick={() => setMobileOpen(true)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 lg:hidden shrink-0"
              >
                <Menu className="w-5 h-5" />
              </button>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base text-white truncate">
                    {menuTitles[activeMenu] || 'ระบบของครูผู้สอน'}
                  </h1>
                  {activeSubject && activeMenu !== 'overview' && activeMenu !== 'leaderboard' && (
                    <span className="hidden sm:inline font-mono bg-indigo-950 border border-indigo-700/60 text-indigo-300 text-[11px] font-bold px-2 py-0.5 rounded-lg shrink-0">
                      {activeSubject.code} • {activeSubject.gradeLevel}
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-400 truncate">
                  {activeSubject
                    ? `${activeSubject.name} • ภาคเรียนที่ ${activeSubject.semester}/${activeSubject.academicYear}`
                    : 'ภาพรวมระบบบันทึกคะแนน'}
                </div>
              </div>
            </div>

            {/* Right: Quick Action Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setShowScanner(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="เปิดกล้องสแกนตรวจงาน QR"
              >
                <Camera className="w-4 h-4 text-indigo-400" />
                <span className="hidden md:inline">สแกน QR</span>
              </button>

              <button
                type="button"
                onClick={() => setShowWheel(true)}
                className="p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
                title="เปิดวงล้อสุ่มนักเรียนในวิชานี้"
              >
                <Sparkles className="w-4 h-4 fill-slate-950" />
                <span className="hidden md:inline">วงล้อสุ่ม</span>
              </button>

              {activeSubject && (
                <button
                  type="button"
                  onClick={() => exportComprehensiveExcel(activeSubject)}
                  className="p-2 sm:px-3 sm:py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                  title="ส่งออกรายงาน ปพ.5 ครบทุกชีตเป็น Excel"
                >
                  <Download className="w-4 h-4 text-emerald-400" />
                  <span className="hidden sm:inline">ส่งออก ปพ.5</span>
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Workspace Body: Dynamic Content by activeMenu */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {/* ========================================================
             MENU: OVERVIEW
             ======================================================== */}
          {activeMenu === 'overview' && (
            <div className="space-y-6">
              {/* Statistics Hero Banner */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
                  <div className="text-xs font-semibold text-slate-400 mb-1">รายวิชาที่รับผิดชอบ</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-indigo-400">
                    {totalSubjects}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">วิชาที่กำลังสอน</div>
                </div>

                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
                  <div className="text-xs font-semibold text-slate-400 mb-1">นักเรียนทั้งหมด</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">
                    {totalStudents}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">คนในทุกห้อง</div>
                </div>

                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-lg">
                  <div className="text-xs font-semibold text-slate-400 mb-1">ชิ้นงาน/ภารกิจทั้งหมด</div>
                  <div className="text-3xl sm:text-4xl font-black font-mono text-amber-400">
                    {totalAssignments}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">ช่องคะแนนเก็บ</div>
                </div>

                <div className="glass-card rounded-3xl p-5 border border-slate-800 relative overflow-hidden shadow-lg flex flex-col justify-between">
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1">มาตรฐาน สพฐ.</div>
                    <div className="text-base font-bold text-white">ตามเกณฑ์ สพฐ.</div>
                  </div>
                  <div className="text-[11px] text-indigo-300 font-medium">
                    คุณลักษณะ • สมรรถนะ • อ่านคิด
                  </div>
                </div>
              </div>

              {/* Hall of Fame Banner */}
              <div
                onClick={() => setActiveMenu('leaderboard')}
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
                      ดูแท่นรางวัลเหรียญทอง-เงิน-ทองแดง สรุปคะแนนรวมทุกวิชาในชั้นเดียวกัน หรือแยกดูรายวิชา พร้อมอันดับ 4 เป็นต้นไป
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 text-slate-950 text-xs font-black shrink-0 shadow-md group-hover:bg-amber-400 transition-colors">
                  <span>เปิดทำเนียบรางวัล</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>

              {/* Subject Cards Section */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                      <BookOpen className="w-5 h-5 text-indigo-400" />
                      <span>รายวิชาที่สอน (เลือกเพื่อบันทึกคะแนน)</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      คลิกที่วิชาเพื่อเปิดสมุดคะแนน บันทึกคะแนนเก็บ หรือตัดเกรด
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowCreateModal(true)}
                    className="px-4 py-2 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ เพิ่มวิชาใหม่</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {subjectList.map((subj) => (
                    <div
                      key={subj.id}
                      className="glass-panel rounded-3xl p-6 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-xl hover:-translate-y-1 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-md border border-white/20"
                              style={{ backgroundColor: subj.color || '#6366f1' }}
                            >
                              {subj.icon || '📚'}
                            </div>
                            <div>
                              <span className="font-mono text-xs font-bold text-indigo-300 bg-indigo-950 px-2 py-0.5 rounded-lg border border-indigo-800/60">
                                {subj.code}
                              </span>
                              <div className="text-[11px] text-slate-400 mt-1">
                                {subj.gradeLevel}
                              </div>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              const ok = await confirmDialog({
                                title: 'ยืนยันการลบรายวิชา',
                                message: `คุณครูต้องการลบวิชา "${subj.name}" ใช่หรือไม่?`,
                                detail: '⚠️ ข้อมูลคะแนน ชิ้นงาน และนักเรียนในวิชานี้จะถูกลบอย่างถาวร',
                                type: 'danger',
                                confirmText: 'ใช่, ลบวิชานี้',
                                cancelText: 'ยกเลิก'
                              });
                              if (ok) {
                                onDeleteSubject(subj.id);
                              }
                            }}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
                            title="ลบวิชา"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <h3 className="font-black text-lg text-white group-hover:text-indigo-300 transition-colors line-clamp-1">
                          {subj.name}
                        </h3>
                        <p className="text-xs text-slate-400 mt-1">
                          ภาคเรียนที่ {subj.semester}/{subj.academicYear} • นักเรียน {subj.students?.length || 0} คน • งาน {subj.assignments?.length || 0} ชิ้น
                        </p>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => {
                            onSelectSubject(subj.id);
                            setActiveMenu('gradebook');
                          }}
                          className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md transition-all"
                        >
                          <BarChart2 className="w-3.5 h-3.5" />
                          <span>เปิดสมุดคะแนน</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onSelectSubject(subj.id);
                            setActiveMenu('grading');
                          }}
                          className="py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1 transition-all"
                          title="ดูสรุปผลและตัดเกรด"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>ตัดเกรด</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {/* ========================================================
             MENU: GRADEBOOK TABLE
             ======================================================== */}
          {activeMenu === 'gradebook' && activeSubject && (
            <div className="space-y-4">
              <GradebookTable
                subject={activeSubject}
                onUpdateScore={handleUpdateScore}
                onAddAssignment={handleAddAssignment}
              />
            </div>
          )}

          {/* ========================================================
             MENU: ASSIGNMENT HUB
             ======================================================== */}
          {activeMenu === 'assignments' && activeSubject && (
            <div className="space-y-4">
              <AssignmentHub
                subject={activeSubject}
                assignments={activeSubject.assignments || []}
                onAddAssignment={handleAddAssignment}
                onUpdateAssignment={handleUpdateAssignment}
                onDeleteAssignment={handleDeleteAssignment}
              />
            </div>
          )}

          {/* ========================================================
             MENU: FINAL GRADING VIEW (100 คะแนน)
             ======================================================== */}
          {activeMenu === 'grading' && activeSubject && (
            <div className="space-y-4">
              <FinalGradingView
                subject={activeSubject}
                onSaveSubject={onSaveSubject}
                onUpdateScore={handleUpdateScore}
              />
            </div>
          )}

          {/* ========================================================
             MENU: GRADE-LEVEL LEADERBOARD (Top 3 Podium)
             ======================================================== */}
          {activeMenu === 'leaderboard' && (
            <div className="space-y-4">
              <GradeLevelLeaderboard
                subjects={subjects}
                initialGradeLevel={activeSubject?.gradeLevel || ''}
                onBack={() => setActiveMenu('overview')}
                onSelectSubject={(subjId) => {
                  onSelectSubject(subjId);
                  setActiveMenu('gradebook');
                }}
              />
            </div>
          )}

          {/* ========================================================
             MENU: ASSESSMENTS (สพฐ.)
             ======================================================== */}
          {activeMenu === 'assessments' && activeSubject && (
            <div className="space-y-4">
              <StandardAssessmentView
                subject={activeSubject}
                onSaveAssessments={handleSaveAssessments}
              />
            </div>
          )}

          {/* ========================================================
             MENU: ATTENDANCE & PERIOD BONUS
             ======================================================== */}
          {activeMenu === 'attendance' && activeSubject && (
            <div className="space-y-4">
              <AttendanceTracker
                subject={activeSubject}
                onSaveAttendance={handleSaveAttendance}
              />
            </div>
          )}

          {/* ========================================================
             MENU: STUDENT ROSTER MANAGER (รายวิชาปัจจุบัน)
             ======================================================== */}
          {activeMenu === 'roster' && activeSubject && (
            <div className="space-y-4">
              <StudentRosterManager
                subject={activeSubject}
                onUpdateStudents={handleUpdateStudents}
                onAddStudent={handleAddStudent}
                onSaveSubject={onSaveSubject}
              />
            </div>
          )}

          {/* ========================================================
             MENU: MASTER ROSTER MANAGER (ทะเบียนนักเรียนแยกตามระดับชั้น)
             ======================================================== */}
          {activeMenu === 'masterRoster' && (
            <div className="space-y-4">
              <MasterRosterManager />
            </div>
          )}

          {/* ========================================================
             MENU: CLASSROOM TOOLS (วงล้อ & กล้อง QR)
             ======================================================== */}
          {activeMenu === 'tools' && activeSubject && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {/* Lucky Wheel Card */}
                <div
                  onClick={() => setShowWheel(true)}
                  className="glass-card rounded-3xl p-6 border border-amber-500/40 bg-gradient-to-br from-amber-950/40 to-slate-900 hover:border-amber-400 transition-all cursor-pointer shadow-xl group space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 flex items-center justify-center text-3xl shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                    🎡
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                      วงล้อสุ่มนักเรียน (Lucky Wheel)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      สุ่มเลขที่และชื่อนักเรียนในวิชานี้ ({activeSubject.name}) พร้อมแอนิเมชันหมุนและเสียงเอฟเฟกต์ สำหรับตอบคำถามหรือมอบหมายงาน
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-amber-500 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md">
                    <span>เปิดวงล้อสุ่ม</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* QR Scanner Card */}
                <div
                  onClick={() => setShowScanner(true)}
                  className="glass-card rounded-3xl p-6 border border-indigo-500/40 bg-gradient-to-br from-indigo-950/40 to-slate-900 hover:border-indigo-400 transition-all cursor-pointer shadow-xl group space-y-4"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-3xl shadow-lg shadow-indigo-500/30 group-hover:scale-110 transition-transform">
                    📷
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white group-hover:text-indigo-300 transition-colors">
                      กล้องสแกนตรวจงาน QR (Camera Scanner)
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      ใช้กล้องบนอุปกรณ์ (โน้ตบุ๊ก / เว็บแคม) สแกนโค้ด QR บนใบงานของนักเรียนเพื่อเช็คชื่อหรือให้คะแนนได้ทันที
                    </p>
                  </div>
                  <button className="px-4 py-2 rounded-xl bg-indigo-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md">
                    <span>เปิดกล้องสแกน</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
             MENU: REPORTS & EXPORT
             ======================================================== */}
          {activeMenu === 'reports' && activeSubject && (
            <div className="space-y-6">
              <div className="glass-panel rounded-3xl p-6 border border-slate-800 space-y-4 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <Download className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-white">
                      ส่งออกเอกสาร ปพ.5 สมบูรณ์แบบ (Excel Comprehensive Export)
                    </h3>
                    <p className="text-xs text-slate-400">
                      ดาวน์โหลดไฟล์ Excel (.xlsx) ที่ประกอบด้วย 5 ชีตมาตรฐานตามระเบียบงานทะเบียนวัดผล
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-1">ชีตที่ 1: สมุดคะแนนเก็บ</div>
                    <div className="text-slate-400 text-[11px]">คะแนนทุกชิ้นงาน, คะแนนรวม, ร้อยละ, และเกรด</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-1">ชีตที่ 2: การเข้าเรียน</div>
                    <div className="text-slate-400 text-[11px]">สถิติ มา, ขาด, สาย, ลา และแต้มรายคาบ</div>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
                    <div className="font-bold text-white mb-1">ชีต 3-5: ประเมิน สพฐ.</div>
                    <div className="text-slate-400 text-[11px]">คุณลักษณะ 8 ข้อ, สมรรถนะ 5 ด้าน, อ่านคิดวิเคราะห์</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => exportComprehensiveExcel(activeSubject)}
                    className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลด ปพ.5 ({activeSubject.code} {activeSubject.name})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-4 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-xs flex items-center gap-2 transition-colors"
                  >
                    <Printer className="w-4 h-4" />
                    <span>พิมพ์รายงานหน้านี้</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
             MENU: FULL SYSTEM BACKUP & RESTORE (1-Click JSON Backup)
             ======================================================== */}
          {activeMenu === 'backup' && (
            <div className="space-y-6 animate-pop pb-12">
              {/* Header card */}
              <div className="glass-panel rounded-3xl p-6 sm:p-7 border border-slate-800 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-amber-400 p-0.5 shadow-xl shadow-indigo-600/30 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center text-amber-300">
                        <Database className="w-7 h-7" />
                      </div>
                    </div>
                    <div>
                      <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold mb-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                        <span>KruSos SafeData 2.0 • สำรองฐานข้อมูล 1 คลิก</span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-black text-white">
                        สำรองและย้ายข้อมูลทั้งระบบ (Backup & Restore)
                      </h2>
                      <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                        บันทึกข้อมูลทุกรายวิชา คะแนนสอบ คะแนนเก็บ ทะเบียนนักเรียนทุกชั้นเรียน (ป.1 - ป.6) และเหรียญเกียรติยศลงในไฟล์ .json ไฟล์เดียว เพื่อเก็บสำรองข้อมูลกันสูญหาย หรือย้ายไปใช้งานบนโน้ตบุ๊กเครื่องอื่นได้ทันที
                      </p>
                    </div>
                  </div>
                </div>

                {/* Status Messages */}
                {backupSuccess && (
                  <div className="mt-4 p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/60 text-emerald-200 text-xs font-bold flex items-center gap-3 animate-pop">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <span>{backupSuccess}</span>
                  </div>
                )}

                {backupError && (
                  <div className="mt-4 p-4 rounded-2xl bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-bold flex items-center gap-3 animate-pop">
                    <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    <span>{backupError}</span>
                  </div>
                )}
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 1. Export Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-7 border border-emerald-500/30 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-md">
                      <Download className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        ดาวน์โหลดไฟล์สำรองข้อมูล (.json)
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        ส่งออกข้อมูลทั้งหมดเป็นไฟล์ JSON กะทัดรัด ครอบคลุม:
                      </p>
                    </div>

                    <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>รายวิชาทั้งหมด ({totalSubjects} วิชา) และนักเรียนในแต่ละวิชา</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>คะแนนเก็บ คะแนนสอบกลางภาค/ปลายภาค และผลการประเมิน สพฐ.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>ทะเบียนนักเรียนกลางแยกตามระดับชั้น (ป.1 - ป.6)</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>เหรียญเกียรติยศและตราความดีของนักเรียนทุกคน</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>ดาวน์โหลดไฟล์สำรองทันที</span>
                  </button>
                </div>

                {/* 2. Import Card */}
                <div className="glass-card rounded-3xl p-6 sm:p-7 border border-indigo-500/30 bg-gradient-to-br from-indigo-950/20 via-slate-900 to-slate-900 shadow-xl flex flex-col justify-between space-y-6">
                  <div className="space-y-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shadow-md">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-black text-white">
                        กู้คืน / นำเข้าไฟล์สำรองข้อมูล
                      </h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                        เลือกไฟล์ <code>.json</code> ที่เคยสำรองไว้เพื่อนำข้อมูลกลับมาใช้ใหม่ หรือย้ายมาจากเครื่องคอมพิวเตอร์อื่น
                      </p>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs text-amber-200 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-300">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>ข้อควรทราบก่อนกู้คืนข้อมูล</span>
                      </div>
                      <p className="text-[11px] text-amber-300/80 leading-relaxed">
                        ข้อมูลรายวิชาและทะเบียนนักเรียนในเครื่องปัจจุบันจะถูกแทนที่ด้วยข้อมูลจากไฟล์สำรองที่ท่านเลือก กรุณาตรวจสอบให้แน่ใจว่าเป็นไฟล์สำรองที่ถูกต้อง
                      </p>
                    </div>
                  </div>

                  <div>
                    <input
                      type="file"
                      ref={backupFileInputRef}
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />

                    <button
                      type="button"
                      disabled={restoring}
                      onClick={() => backupFileInputRef.current?.click()}
                      className="w-full py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 active:scale-95 transition-all"
                    >
                      {restoring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>กำลังกู้คืนข้อมูล...</span>
                        </>
                      ) : (
                        <>
                          <Upload className="w-4 h-4" />
                          <span>เลือกไฟล์ .json เพื่อกู้คืน</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Classroom Modals */}
      {showWheel && (
        <LuckyWheelModal
          isOpen={showWheel}
          onClose={() => setShowWheel(false)}
          groups={wheelStudents}
        />
      )}

      {showScanner && (
        <CameraScanner
          isOpen={showScanner}
          onClose={() => setShowScanner(false)}
          onScanSuccess={async (code) => {
            setShowScanner(false);
            await alertDialog({
              title: 'สแกน QR Code สำเร็จ',
              message: `สแกนพบข้อมูล: ${code}`,
              detail: 'คุณครูสามารถนำข้อมูลนี้ไปบันทึกคะแนนหรือเช็คชื่อในระบบได้ทันที',
              type: 'success'
            });
          }}
        />
      )}

      {/* Create Subject Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 animate-pop">
            <h3 className="text-lg font-black text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>สร้างรายวิชาใหม่</span>
            </h3>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">รหัสวิชา</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น ว15101"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                    <span>ระดับชั้น</span>
                    <span className="text-[10px] text-indigo-400">ทะเบียนกลาง</span>
                  </label>
                  <input
                    type="text"
                    required
                    list="master-grades-datalist"
                    placeholder="เช่น ชั้นประถมศึกษาปีที่ 6/1"
                    value={newGradeLevel}
                    onChange={(e) => setNewGradeLevel(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400 font-medium"
                  />
                  <datalist id="master-grades-datalist">
                    {MasterRosterStore.getGradeLevels().map((g) => (
                      <option key={g} value={g} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Smart Auto-Import Checkbox from Master Roster */}
              {(() => {
                const count = MasterRosterStore.getStudentsByGrade(newGradeLevel).length;
                return count > 0 ? (
                  <div className="p-3 rounded-2xl bg-indigo-950/70 border border-indigo-500/50 flex items-center justify-between gap-3 animate-pop">
                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs text-slate-200 select-none">
                      <input
                        type="checkbox"
                        checked={autoImportRoster}
                        onChange={(e) => setAutoImportRoster(e.target.checked)}
                        className="w-4 h-4 rounded accent-indigo-500 cursor-pointer"
                      />
                      <span>
                        ดึงรายชื่อจากทะเบียนกลาง <strong>{newGradeLevel}</strong> มาใช้อัตโนมัติ
                      </span>
                    </label>
                    <span className="px-2.5 py-0.5 rounded-lg bg-indigo-900 border border-indigo-700 text-amber-300 font-mono font-black text-xs shrink-0">
                      {count} คน (พร้อมรหัส)
                    </span>
                  </div>
                ) : null;
              })()}

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ชื่อรายวิชา</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น วิทยาการคำนวณ หรือ วิทยาศาสตร์และเทคโนโลยี"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ปีการศึกษา</label>
                  <input
                    type="text"
                    value={newAcademicYear}
                    onChange={(e) => setNewAcademicYear(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">ภาคเรียนที่</label>
                  <input
                    type="text"
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400 font-mono"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 transition-colors"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md transition-colors"
                >
                  สร้างวิชา
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
