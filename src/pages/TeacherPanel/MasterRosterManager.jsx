import React, { useState, useEffect, useRef } from 'react';
import {
  School, Users, Plus, Download, Upload, Trash2, Edit3, CheckCircle2,
  AlertCircle, KeyRound, Copy, Check, Printer, RefreshCw, X, Search, Sparkles
} from 'lucide-react';
import { MasterRosterStore, generateAutoStudentCode } from '../../services/masterRosterStore';
import { parseStudentExcel, downloadStudentTemplate } from '../../components/ExcelHelper';
import { confirmDialog, alertDialog } from '../../components/ModernDialog';

export const MasterRosterManager = ({ onSelectGradeForSubject }) => {
  const [rosters, setRosters] = useState(() => MasterRosterStore.getMasterRosters());
  const [selectedGrade, setSelectedGrade] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [title, setTitle] = useState('ด.ช.');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('ช');

  const [showAddGradeModal, setShowAddGradeModal] = useState(false);
  const [newGradeName, setNewGradeName] = useState('');

  const [showPrintCardsModal, setShowPrintCardsModal] = useState(false);

  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const gradeList = Object.keys(rosters);

  // Set default selected grade
  useEffect(() => {
    if (!selectedGrade && gradeList.length > 0) {
      // Prefer P.6 or P.5 if available
      const preferred = gradeList.find((g) => g.includes('6') || g.includes('5')) || gradeList[0];
      setSelectedGrade(preferred);
    }
  }, [gradeList, selectedGrade]);

  const studentsInGrade = rosters[selectedGrade] || [];

  // Filtered students by search query
  const filteredStudents = studentsInGrade.filter((s) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      (s.name || '').toLowerCase().includes(q) ||
      String(s.studentCode || '').toLowerCase().includes(q) ||
      String(s.studentNumber || '').includes(q)
    );
  });

  const boyCount = studentsInGrade.filter((s) => s.gender === 'ช').length;
  const girlCount = studentsInGrade.filter((s) => s.gender === 'ญ').length;

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3000);
  };

  // Reload data from store
  const refreshRosters = () => {
    setRosters(MasterRosterStore.getMasterRosters());
  };

  // Add Grade Level
  const handleAddGradeSubmit = (e) => {
    e.preventDefault();
    if (!newGradeName.trim()) return;
    MasterRosterStore.addGradeLevel(newGradeName.trim());
    refreshRosters();
    setSelectedGrade(newGradeName.trim());
    setNewGradeName('');
    setShowAddGradeModal(false);
    showToast(`เพิ่มระดับชั้น "${newGradeName.trim()}" เรียบร้อยแล้ว`);
  };

  // Delete Grade Level
  const handleDeleteGrade = async (grade) => {
    const ok = await confirmDialog({
      title: 'ยืนยันการลบระดับชั้น',
      message: `คุณครูต้องการลบระดับชั้น "${grade}" พร้อมรายชื่อทั้งหมดใช่หรือไม่?`,
      detail: '⚠️ ข้อมูลนักเรียนทั้งหมดในระดับชั้นนี้จะถูกลบออกจากทะเบียนกลางอย่างถาวร',
      type: 'danger',
      confirmText: 'ใช่, ลบระดับชั้น',
      cancelText: 'ยกเลิก'
    });
    if (!ok) return;
    MasterRosterStore.deleteGradeLevel(grade);
    refreshRosters();
    const remaining = MasterRosterStore.getGradeLevels();
    setSelectedGrade(remaining[0] || '');
    showToast(`ลบระดับชั้น "${grade}" เรียบร้อยแล้ว`);
  };

  // Open modal to add or edit student
  const handleOpenAddStudent = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentNumber(student.studentNumber || '');
      setStudentCode(student.studentCode || '');
      setTitle(student.title || 'ด.ช.');
      setName(student.name || '');
      setGender(student.gender || 'ช');
    } else {
      setEditingStudent(null);
      const nextNo = studentsInGrade.length + 1;
      setStudentNumber(nextNo);
      // Auto-assign code right from the start!
      setStudentCode(generateAutoStudentCode(selectedGrade, nextNo));
      setTitle('ด.ช.');
      setName('');
      setGender('ช');
    }
    setShowAddStudentModal(true);
  };

  // Submit Add or Edit student
  const handleStudentSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingStudent) {
      MasterRosterStore.updateStudentInGrade(selectedGrade, editingStudent.id, {
        studentNumber: parseInt(studentNumber, 10) || 1,
        studentCode: studentCode.trim() || generateAutoStudentCode(selectedGrade, studentNumber),
        title,
        name: name.trim(),
        gender
      });
      showToast(`อัปเดตข้อมูลนักเรียนเรียบร้อยแล้ว`);
    } else {
      MasterRosterStore.addStudentToGrade(selectedGrade, {
        studentNumber: parseInt(studentNumber, 10) || (studentsInGrade.length + 1),
        studentCode: studentCode.trim() || generateAutoStudentCode(selectedGrade, studentNumber),
        title,
        name: name.trim(),
        gender
      });
      showToast(`เพิ่มนักเรียนใหม่พร้อมรหัสประจำตัวเรียบร้อยแล้ว`);
    }

    refreshRosters();
    setShowAddStudentModal(false);
  };

  // Delete student
  const handleDeleteStudent = async (id, sName) => {
    const ok = await confirmDialog({
      title: 'ยืนยันการลบนักเรียน',
      message: `ต้องการลบ "${sName}" ออกจากทะเบียนชั้นนี้ใช่หรือไม่?`,
      type: 'danger',
      confirmText: 'ใช่, ลบนักเรียน',
      cancelText: 'ยกเลิก'
    });
    if (!ok) return;
    MasterRosterStore.deleteStudentFromGrade(selectedGrade, id);
    refreshRosters();
    showToast(`ลบนักเรียนเรียบร้อยแล้ว`);
  };

  // Excel Import
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const parsed = await parseStudentExcel(file);
      if (parsed && parsed.length > 0) {
        const willReplace = await confirmDialog({
          title: 'รูปแบบการนำเข้าไฟล์ Excel',
          message: `พบข้อมูลนักเรียน ${parsed.length} คนในไฟล์`,
          detail: 'กด "แทนที่เดิมทั้งหมด" เพื่อล้างรายชื่อเดิมในชั้นนี้ หรือกด "เพิ่มต่อท้าย" เพื่อเก็บรายชื่อเดิมไว้',
          type: 'info',
          confirmText: 'แทนที่เดิมทั้งหมด',
          cancelText: 'เพิ่มต่อท้ายรายชื่อเดิม'
        });

        MasterRosterStore.importStudentsToGrade(selectedGrade, parsed, willReplace);
        refreshRosters();
        showToast(`นำเข้านักเรียน ${parsed.length} คน พร้อมสร้างรหัสประจำตัวอัตโนมัติครบถ้วน!`);
      }
    } catch (err) {
      await alertDialog({
        title: 'เกิดข้อผิดพลาดในการอ่านไฟล์',
        message: err.message || 'ไม่สามารถอ่านไฟล์ Excel ได้',
        type: 'danger'
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Regenerate codes for all students in grade
  const handleRegenerateCodes = async () => {
    const ok = await confirmDialog({
      title: 'สร้างรหัสประจำตัวใหม่อัตโนมัติ',
      message: `ต้องการสร้างรหัสประจำตัว 5 หลักอัตโนมัติให้กับนักเรียนทุกคนในชั้น "${selectedGrade}" ใช่หรือไม่?`,
      detail: '💡 รหัสประจำตัวใหม่จะถูกสร้างขึ้นอัตโนมัติโดยอิงตามระดับชั้นและเลขที่',
      type: 'warning',
      confirmText: 'สร้างรหัสใหม่ทั้งห้อง',
      cancelText: 'ยกเลิก'
    });
    if (!ok) return;
    MasterRosterStore.regenerateCodesForGrade(selectedGrade);
    refreshRosters();
    showToast(`สร้างรหัสประจำตัวอัตโนมัติใหม่ทั้งห้องเรียบร้อยแล้ว`);
  };

  // Copy all student codes
  const handleCopyAllCodes = () => {
    if (studentsInGrade.length === 0) return;
    const text = studentsInGrade
      .map((s) => `เลขที่ ${s.studentNumber} ${s.title || ''}${s.name} [รหัสเข้าดูคะแนน: ${s.studentCode}]`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast(`คัดลอกรายชื่อและรหัสเข้าดูคะแนนทั้งห้องแล้ว (${studentsInGrade.length} คน)`);
  };

  const handleCopySingleCode = (code, id) => {
    navigator.clipboard.writeText(String(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-pop pb-12">
      {/* Toast notification */}
      {toastMsg && (
        <div className="fixed top-20 right-6 z-50 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs shadow-2xl flex items-center gap-2 animate-pop">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Banner Header */}
      <div className="bg-slate-800 p-5 sm:p-6 rounded-3xl border-2 border-slate-700 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/80 border border-indigo-500/50 text-indigo-300 text-xs font-semibold mb-2">
            <School className="w-3.5 h-3.5 text-amber-400" />
            <span>ทะเบียนนักเรียนกลางแยกตามระดับชั้น (Master Roster Bank)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            คลังรายชื่อนักเรียนแยกชั้น & รหัสเข้าดูคะแนน
          </h2>
          <p className="text-xs text-slate-300 mt-1">
            บันทึก/นำเข้ารายชื่อครั้งเดียว ระบบกำหนดรหัสประจำตัวให้อัตโนมัติ พร้อมดึงไปใช้สร้างรายวิชาได้ทันที
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={() => setShowAddGradeModal(true)}
            className="px-4 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มระดับชั้นใหม่</span>
          </button>
        </div>
      </div>

      {/* Grade Level Selector Tabs */}
      <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 shadow flex items-center gap-2 overflow-x-auto scrollbar-thin">
        {gradeList.map((grade) => {
          const isSelected = grade === selectedGrade;
          const count = rosters[grade]?.length || 0;
          return (
            <button
              key={grade}
              type="button"
              onClick={() => setSelectedGrade(grade)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 ${
                isSelected
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 scale-105'
                  : 'bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700'
              }`}
            >
              <span>{grade}</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
                isSelected ? 'bg-indigo-900 text-amber-300' : 'bg-slate-900 text-slate-400'
              }`}>
                {count} คน
              </span>
            </button>
          );
        })}
      </div>

      {/* Main Grade Detail Card */}
      {selectedGrade && (
        <div className="bg-slate-800 rounded-3xl border-2 border-slate-700 shadow-xl overflow-hidden space-y-4 p-5 sm:p-6">
          {/* Grade Header & Controls */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-slate-700/80 pb-5">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  <span>{selectedGrade}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => handleDeleteGrade(selectedGrade)}
                  className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-700/60 transition-colors"
                  title="ลบระดับชั้นนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-300 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-900 border border-slate-700 font-bold text-white">
                  รวม {studentsInGrade.length} คน
                </span>
                <span className="text-cyan-400 font-semibold">👦 ชาย {boyCount} คน</span>
                <span>•</span>
                <span className="text-pink-400 font-semibold">👧 หญิง {girlCount} คน</span>
              </div>
            </div>

            {/* Action Buttons Toolbar */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Add Student */}
              <button
                type="button"
                onClick={() => handleOpenAddStudent()}
                className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow flex items-center gap-1.5 active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>เพิ่มนักเรียน</span>
              </button>

              {/* Import Excel */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                accept=".xlsx, .xls, .csv"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow flex items-center gap-1.5 active:scale-95 transition-all"
                title="นำเข้ารายชื่อจาก Excel/CSV (ระบบคำนวณรหัสประจำตัวให้อัตโนมัติ)"
              >
                <Upload className="w-4 h-4" />
                <span>นำเข้า Excel</span>
              </button>

              {/* Download Template */}
              <button
                type="button"
                onClick={downloadStudentTemplate}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="ดาวน์โหลดไฟล์ตัวอย่าง Excel สำหรับกรอกรายชื่อ"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Template Excel</span>
              </button>

              {/* Auto Generate Codes */}
              <button
                type="button"
                onClick={handleRegenerateCodes}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-amber-300 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="สุ่ม/สร้างรหัสประจำตัว 5 หลักอัตโนมัติยกห้อง"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>สร้างรหัสอัตโนมัติ</span>
              </button>

              {/* Print Student Cards */}
              <button
                type="button"
                onClick={() => setShowPrintCardsModal(true)}
                className="px-3 py-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
                title="พิมพ์การ์ดรหัสเข้าดูคะแนนแจกนักเรียน"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>พิมพ์การ์ดรหัส</span>
              </button>

              {/* Copy All Codes */}
              <button
                type="button"
                onClick={handleCopyAllCodes}
                className="p-2 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold transition-colors"
                title="คัดลอกรายชื่อและรหัสเข้าดูคะแนนทั้งห้อง"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ เลขที่ หรือรหัสประจำตัว..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-400 outline-none focus:border-indigo-400 font-medium"
              />
            </div>

            <div className="text-xs text-slate-400">
              💡 <strong>รหัสประจำตัว (Student Code):</strong> ใช้นำไปล็อกอินที่หน้าแรก เพื่อให้นักเรียนดูคะแนนตนเองได้
            </div>
          </div>

          {/* Student Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-700">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-slate-300 font-bold border-b border-slate-700">
                  <th className="p-3 w-14 text-center">เลขที่</th>
                  <th className="p-3 min-w-[130px]">
                    <div className="flex items-center gap-1.5 text-amber-300">
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>รหัสเข้าดูคะแนน</span>
                    </div>
                  </th>
                  <th className="p-3 w-16 text-center">คำนำหน้า</th>
                  <th className="p-3 min-w-[200px]">ชื่อ - นามสกุล</th>
                  <th className="p-3 w-14 text-center">เพศ</th>
                  <th className="p-3 w-28 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      ยังไม่มีรายชื่อนักเรียนในระดับชั้นนี้ คุณครูสามารถกด <strong>"+ เพิ่มนักเรียน"</strong> หรือ <strong>"นำเข้า Excel"</strong> ได้เลยครับ
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-750/50 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-slate-300">
                        {std.studentNumber}
                      </td>
                      <td className="p-3">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 font-mono font-black text-xs shadow-sm">
                          <span>{std.studentCode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopySingleCode(std.studentCode, std.id)}
                            className="text-amber-400 hover:text-white transition-colors"
                            title="คัดลอกรหัส"
                          >
                            {copiedId === std.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="p-3 text-center text-slate-400">
                        {std.title || 'ด.ช.'}
                      </td>
                      <td className="p-3 font-bold text-white text-sm">
                        {std.name}
                      </td>
                      <td className="p-3 text-center">
                        <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                          std.gender === 'ญ' ? 'bg-pink-950/80 text-pink-300 border border-pink-700/60' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'
                        }`}>
                          {std.gender}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenAddStudent(std)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                            title="แก้ไขข้อมูลนักเรียน"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteStudent(std.id, std.name)}
                            className="p-1.5 rounded-lg bg-slate-700 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                            title="ลบนักเรียน"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ➕ MODAL: เพิ่ม/แก้ไขนักเรียน (พร้อม Gen รหัสอัตโนมัติ)       */}
      {/* ========================================================= */}
      {showAddStudentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-md rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 animate-pop">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-black text-base text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-indigo-400" />
                <span>{editingStudent ? 'แก้ไขข้อมูลนักเรียน' : `เพิ่มนักเรียนใน ${selectedGrade}`}</span>
              </h3>
              <button
                type="button"
                onClick={() => setShowAddStudentModal(false)}
                className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">เลขที่</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={studentNumber}
                    onChange={(e) => {
                      const val = e.target.value;
                      setStudentNumber(val);
                      // Auto-update student code preview if creating new student
                      if (!editingStudent) {
                        setStudentCode(generateAutoStudentCode(selectedGrade, val));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400 font-mono font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-300 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>รหัสเข้าดูคะแนน</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น 10601 หรือ 60101"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/60 text-xs text-amber-300 outline-none focus:border-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1 col-span-1">
                  <label className="text-xs font-bold text-slate-300">คำนำหน้า</label>
                  <select
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setGender(e.target.value.includes('ญ') ? 'ญ' : 'ช');
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400"
                  >
                    <option value="ด.ช.">ด.ช.</option>
                    <option value="ด.ญ.">ด.ญ.</option>
                    <option value="นาย">นาย</option>
                    <option value="น.ส.">น.ส.</option>
                  </select>
                </div>

                <div className="space-y-1 col-span-2">
                  <label className="text-xs font-bold text-slate-300">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    required
                    placeholder="เช่น กฤติน ชูเกียรติ"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400"
                    autoFocus
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">เพศ</label>
                <div className="flex gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="gender"
                      value="ช"
                      checked={gender === 'ช'}
                      onChange={() => setGender('ช')}
                      className="accent-indigo-500"
                    />
                    <span>👦 ชาย (ช)</span>
                  </label>
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="gender"
                      value="ญ"
                      checked={gender === 'ญ'}
                      onChange={() => setGender('ญ')}
                      className="accent-pink-500"
                    />
                    <span>👧 หญิง (ญ)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddStudentModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🏫 MODAL: เพิ่มระดับชั้นใหม่                                */}
      {/* ========================================================= */}
      {showAddGradeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-sm rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 animate-pop">
            <h3 className="font-black text-base text-white flex items-center gap-2">
              <School className="w-5 h-5 text-indigo-400" />
              <span>เพิ่มระดับชั้นใหม่</span>
            </h3>

            <form onSubmit={handleAddGradeSubmit} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">ชื่อระดับชั้น</label>
                <input
                  type="text"
                  required
                  placeholder="เช่น ชั้นประถมศึกษาปีที่ 4/1 หรือ ป.4"
                  value={newGradeName}
                  onChange={(e) => setNewGradeName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white outline-none focus:border-indigo-400"
                  autoFocus
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddGradeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-300"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md"
                >
                  บันทึกระดับชั้น
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* 🖨️ MODAL: พิมพ์การ์ดรหัสประจำตัวเข้าดูคะแนนให้นักเรียน        */}
      {/* ========================================================= */}
      {showPrintCardsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-pop">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    พิมพ์การ์ดรหัสเข้าดูคะแนน: {selectedGrade} ({studentsInGrade.length} คน)
                  </h3>
                  <p className="text-xs text-slate-400">
                    สำหรับพิมพ์แจกให้นักเรียนนำไปใช้ล็อกอินดูคะแนนตนเองผ่านมือถือหรือคอมพิวเตอร์
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow flex items-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  <span>สั่งพิมพ์ (Print)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShowPrintCardsModal(false)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Cards Grid */}
            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
              {studentsInGrade.map((s) => (
                <div
                  key={s.id}
                  className="p-4 rounded-2xl bg-slate-900 border-2 border-indigo-500/40 text-left space-y-2.5 shadow print:border-black print:text-black print:bg-white"
                >
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2 print:border-gray-300">
                    <span className="text-[11px] font-bold text-indigo-300 print:text-indigo-900">
                      โรงเรียนวัดบางปูน
                    </span>
                    <span className="text-xs font-mono font-black text-amber-400 print:text-amber-800">
                      เลขที่ {s.studentNumber}
                    </span>
                  </div>

                  <div>
                    <div className="text-xs text-slate-400 print:text-gray-600">{selectedGrade}</div>
                    <div className="text-sm font-black text-white print:text-black">
                      {s.title || ''}{s.name}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-center space-y-0.5 print:bg-yellow-50 print:border-yellow-600">
                    <div className="text-[10px] text-amber-300 print:text-yellow-900 font-bold uppercase tracking-wider">
                      รหัสเข้าดูคะแนน (Student Code)
                    </div>
                    <div className="text-xl font-mono font-black text-white print:text-black tracking-widest">
                      {s.studentCode}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-400 print:text-gray-500 text-center leading-tight">
                    เข้าสู่ระบบที่เว็บ KruSos EdTech เพื่อดูคะแนนและผลการเรียน
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
