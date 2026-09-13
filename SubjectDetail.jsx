import React, { useState } from 'react';
import { ArrowLeft, BookOpen, FileText, ClipboardList, CheckSquare, Users, Download, Sparkles, Camera, BarChart2, Award, Trophy } from 'lucide-react';
import { GradebookTable } from './GradebookTable';
import { FinalGradingView } from './FinalGradingView';
import { AssignmentHub } from './AssignmentHub';
import { StandardAssessmentView } from './StandardAssessmentView';
import { AttendanceTracker } from './AttendanceTracker';
import { StudentRosterManager } from './StudentRosterManager';
import { exportComprehensiveExcel } from '../../components/ExcelHelper';
import { LuckyWheelModal } from '../../components/LuckyWheelModal';
import { CameraScanner } from '../AdminPanel/CameraScanner';

export const SubjectDetail = ({ subject, onBack, onSaveSubject, onOpenLeaderboard }) => {
  const [activeTab, setActiveTab] = useState('gradebook'); // 'gradebook' | 'assignments' | 'attendance' | 'assessments' | 'roster'
  const [showWheel, setShowWheel] = useState(false);
  const [showScanner, setShowScanner] = useState(false);

  // Handlers for data updates
  const handleUpdateScore = (studentId, assignmentId, score) => {
    const updated = {
      ...subject,
      scores: {
        ...(subject.scores || {}),
        [studentId]: {
          ...(subject.scores?.[studentId] || {}),
          [assignmentId]: score
        }
      }
    };
    onSaveSubject(updated);
  };

  const handleAddAssignment = (newAsg) => {
    const asgObj = {
      ...newAsg,
      id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const updated = {
      ...subject,
      assignments: [...(subject.assignments || []), asgObj]
    };
    onSaveSubject(updated);
  };

  const handleUpdateAssignment = (asgId, updates) => {
    const updated = {
      ...subject,
      assignments: (subject.assignments || []).map(a => a.id === asgId ? { ...a, ...updates } : a)
    };
    onSaveSubject(updated);
  };

  const handleDeleteAssignment = (asgId) => {
    const updated = {
      ...subject,
      assignments: (subject.assignments || []).filter(a => a.id !== asgId)
    };
    onSaveSubject(updated);
  };

  const handleSaveAssessments = (type, data) => {
    const updated = {
      ...subject,
      assessments: {
        ...(subject.assessments || {}),
        [type]: data
      }
    };
    onSaveSubject(updated);
  };

  const handleSaveAttendance = (sessionData) => {
    const currentList = subject.attendance ? [...subject.attendance] : [];
    const idx = currentList.findIndex(s => s.id === sessionData.id);
    if (idx >= 0) {
      currentList[idx] = sessionData;
    } else {
      currentList.push(sessionData);
    }
    const updated = {
      ...subject,
      attendance: currentList
    };
    onSaveSubject(updated);
  };

  const handleUpdateStudents = (studentsList) => {
    const updated = {
      ...subject,
      students: studentsList
    };
    onSaveSubject(updated);
  };

  const handleAddStudent = (studentData) => {
    const newStudent = {
      ...studentData,
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
    };
    const current = subject.students ? [...subject.students] : [];
    current.push(newStudent);
    current.sort((a, b) => a.studentNumber - b.studentNumber);
    onSaveSubject({
      ...subject,
      students: current
    });
  };

  const handleDeleteStudent = (studentId) => {
    const updated = {
      ...subject,
      students: (subject.students || []).filter(s => s.id !== studentId)
    };
    onSaveSubject(updated);
  };

  // Convert subject students into LuckyWheel format
  const wheelGroups = (subject.students || []).map(s => ({
    id: s.id,
    name: `เลขที่ ${s.studentNumber} ${s.title || ''}${s.name}`,
    color: subject.color || '#6366f1',
    mascot: s.gender === 'ญ' ? '👧' : '👦',
    score: 0
  }));

  const handleScanSuccess = (decodedText) => {
    setShowScanner(false);
    alert(`📷 สแกนพบข้อมูล: ${decodedText}\nคุณครูสามารถให้คะแนนในสมุดคะแนนได้ทันที`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col pb-16">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-800 px-4 py-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Left: Back & Subject Info */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors shrink-0"
              title="กลับหน้ารวมวิชา"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 min-w-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0 border border-white/20 shadow-md"
                style={{ backgroundColor: subject.color || '#6366f1' }}
              >
                {subject.icon || '📘'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-base sm:text-lg text-white truncate">
                    {subject.name}
                  </h1>
                  <span className="font-mono bg-indigo-950 border border-indigo-700 text-indigo-300 text-[11px] font-bold px-2 py-0.5 rounded-lg">
                    {subject.code}
                  </span>
                </div>
                <div className="text-xs text-slate-400">
                  {subject.gradeLevel} • ภาคเรียนที่ {subject.semester}/{subject.academicYear}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Tools Bar */}
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap">
            <button
              onClick={() => setShowScanner(true)}
              className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              title="เปิดกล้องสแกนตรวจงาน QR"
            >
              <Camera className="w-4 h-4 text-indigo-400" />
              <span className="hidden sm:inline">สแกนตรวจงาน</span>
            </button>

            <button
              onClick={() => setShowWheel(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:opacity-90 text-slate-950 text-xs font-black flex items-center gap-1.5 shadow-md shadow-amber-500/20 active:scale-95 transition-transform"
              title="เปิดวงล้อสุ่มนักเรียนในวิชานี้"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>🎡 วงล้อสุ่ม</span>
            </button>

            <button
              onClick={() => exportComprehensiveExcel(subject)}
              className="px-3.5 py-2 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
              title="ส่งออกรายงาน ปพ.5 ครบทุกชีตเป็น Excel"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>ส่งออก ปพ.5 (Excel)</span>
            </button>

            {onOpenLeaderboard && (
              <button
                onClick={() => onOpenLeaderboard(subject.gradeLevel)}
                className="px-3.5 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors"
                title={`ดูทำเนียบเกียรติยศและอันดับคะแนนชั้น ${subject.gradeLevel}`}
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span className="hidden lg:inline">🏆 ทำเนียบเกียรติยศ ({subject.gradeLevel})</span>
                <span className="lg:hidden">🏆 อันดับ</span>
              </button>
            )}
          </div>
        </div>

        {/* Workstation Navigation Tabs */}
        <div className="max-w-7xl mx-auto mt-3 pt-2 border-t border-slate-800/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs font-bold">
          <button
            onClick={() => setActiveTab('gradebook')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'gradebook'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            <span>สมุดบันทึกคะแนนเก็บ</span>
          </button>

          <button
            onClick={() => setActiveTab('finalGrades')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'finalGrades'
                ? 'bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/20'
                : 'text-amber-300 hover:text-amber-200 hover:bg-slate-900'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>สรุปผลและตัดเกรด (100 คะแนน)</span>
          </button>

          <button
            onClick={() => setActiveTab('assignments')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'assignments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>หน้ารวมงาน ({subject.assignments?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'attendance'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <CheckSquare className="w-4 h-4" />
            <span>เช็คชื่อ & แต้มรายคาบ</span>
          </button>

          <button
            onClick={() => setActiveTab('assessments')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'assessments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ClipboardList className="w-4 h-4" />
            <span>ประเมินคุณลักษณะ & สมรรถนะ</span>
          </button>

          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3.5 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'roster'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>รายชื่อนักเรียน ({subject.students?.length || 0})</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'gradebook' && (
          <GradebookTable
            subject={subject}
            onUpdateScore={handleUpdateScore}
            onAddAssignment={handleAddAssignment}
            onGoToGrading={() => setActiveTab('finalGrades')}
            onGoToAssignments={() => setActiveTab('assignments')}
          />
        )}

        {activeTab === 'finalGrades' && (
          <FinalGradingView
            subject={subject}
          />
        )}


        {activeTab === 'assignments' && (
          <AssignmentHub
            subject={subject}
            onAddAssignment={handleAddAssignment}
            onUpdateAssignment={handleUpdateAssignment}
            onDeleteAssignment={handleDeleteAssignment}
          />
        )}

        {activeTab === 'attendance' && (
          <AttendanceTracker
            subject={subject}
            onSaveAttendance={handleSaveAttendance}
          />
        )}

        {activeTab === 'assessments' && (
          <StandardAssessmentView
            subject={subject}
            onSaveAssessments={handleSaveAssessments}
          />
        )}

        {activeTab === 'roster' && (
          <StudentRosterManager
            subject={subject}
            onUpdateStudents={handleUpdateStudents}
            onAddStudent={handleAddStudent}
            onDeleteStudent={handleDeleteStudent}
          />
        )}
      </main>

      {/* Lucky Wheel Modal */}
      {showWheel && (
        <LuckyWheelModal
          roomId={subject.code}
          groups={wheelGroups}
          onClose={() => setShowWheel(false)}
        />
      )}

      {/* Camera QR Scanner Modal */}
      {showScanner && (
        <CameraScanner
          onScanSuccess={handleScanSuccess}
          onClose={() => setShowScanner(false)}
        />
      )}
    </div>
  );
};
