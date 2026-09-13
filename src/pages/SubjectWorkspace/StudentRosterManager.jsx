import React, { useState, useRef } from 'react';
import {
  Upload, Plus, Download, Users, Trash2, Edit3, CheckCircle2,
  AlertCircle, FileSpreadsheet, X, School, KeyRound, Copy, Check, Printer, Sparkles, Award
} from 'lucide-react';
import { parseStudentExcel, downloadStudentTemplate } from '../../components/ExcelHelper';
import { MasterRosterStore, generateAutoStudentCode } from '../../services/masterRosterStore';
import { BadgeAwardModal } from '../../components/BadgeAwardModal';
import { AVAILABLE_BADGES } from '../../services/badgeService';
import { SubjectStore } from '../../services/subjectStore';
import { confirmDialog, alertDialog } from '../../components/ModernDialog';

export const StudentRosterManager = ({
  subject = {},
  onUpdateStudents,
  onAddStudent,
  onDeleteStudent,
  onSaveSubject
}) => {
  const [badgeModalStudent, setBadgeModalStudent] = useState(null);
  const [showManualModal, setShowManualModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [title, setTitle] = useState('ด.ช.');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('ช');

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [copiedId, setCopiedId] = useState(null);
  const [showPrintCardsModal, setShowPrintCardsModal] = useState(false);

  const fileInputRef = useRef(null);
  const safeSubject = subject || {};
  const { students = [] } = safeSubject;

  // Available students in master roster for this subject's grade level
  const masterStudents = MasterRosterStore.getStudentsByGrade(safeSubject.gradeLevel);

  const handleSaveSubject = (updated) => {
    if (onSaveSubject) {
      onSaveSubject(updated);
    } else {
      SubjectStore.saveSubject(updated);
    }
  };

  const handleOpenManual = (student = null) => {
    if (student) {
      setEditingStudent(student);
      setStudentNumber(student.studentNumber || '');
      setStudentCode(student.studentCode || '');
      setTitle(student.title || 'ด.ช.');
      setName(student.name || '');
      setGender(student.gender || 'ช');
    } else {
      setEditingStudent(null);
      const nextNo = students.length + 1;
      setStudentNumber(nextNo);
      // Auto-generate access code right from the start!
      setStudentCode(generateAutoStudentCode(safeSubject.gradeLevel, nextNo));
      setTitle('ด.ช.');
      setName('');
      setGender('ช');
    }
    setShowManualModal(true);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    const sNo = parseInt(studentNumber, 10) || (students.length + 1);
    const sCode = (studentCode && studentCode.trim())
      ? studentCode.trim()
      : generateAutoStudentCode(safeSubject.gradeLevel, sNo);

    if (editingStudent) {
      const updated = students.map((s) => {
        if (s.id === editingStudent.id) {
          return {
            ...s,
            studentNumber: sNo,
            studentCode: sCode,
            title,
            name: name.trim(),
            gender
          };
        }
        return s;
      });
      onUpdateStudents(updated);
      setUploadSuccess(`อัปเดตข้อมูลของ "${title}${name.trim()}" เรียบร้อยแล้ว`);
    } else {
      onAddStudent({
        studentNumber: sNo,
        studentCode: sCode,
        title,
        name: name.trim(),
        gender
      });
      setUploadSuccess(`เพิ่มนักเรียนใหม่พร้อมรหัสประจำตัวเรียบร้อยแล้ว`);
    }

    setShowManualModal(false);
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  // Sync / Import from Master Roster
  const handleSyncFromMaster = async () => {
    if (!masterStudents || masterStudents.length === 0) {
      await alertDialog({
        title: 'ไม่พบรายชื่อในทะเบียนกลาง',
        message: `ไม่พบรายชื่อในทะเบียนกลางของชั้น "${safeSubject.gradeLevel}"`,
        detail: 'คุณครูสามารถไปที่เมนู "ทะเบียนนักเรียนแยกชั้น" เพื่อเพิ่มรายชื่อกลางก่อนได้ครับ',
        type: 'warning'
      });
      return;
    }

    const willReplace = await confirmDialog({
      title: 'ดึงรายชื่อจากทะเบียนกลาง',
      message: `พบรายชื่อในทะเบียนกลางชั้น "${safeSubject.gradeLevel}" จำนวน ${masterStudents.length} คน`,
      detail: 'ต้องการดึงรายชื่อทั้งหมดพร้อมรหัสประจำตัวมาแทนที่รายชื่อเดิมในวิชานี้ใช่หรือไม่?',
      type: 'info',
      confirmText: 'ดึงรายชื่อทันที',
      cancelText: 'ยกเลิก'
    });

    if (willReplace) {
      const imported = masterStudents.map((s) => ({
        ...s,
        studentCode: s.studentCode || generateAutoStudentCode(safeSubject.gradeLevel, s.studentNumber)
      }));
      onUpdateStudents(imported);
      setUploadSuccess(`ดึงรายชื่อจากทะเบียนกลางสำเร็จ ${imported.length} คน พร้อมรหัสเข้าดูคะแนนทุกคน!`);
      setTimeout(() => setUploadSuccess(''), 3500);
    }
  };

  // Regenerate codes for all students in this subject
  const handleRegenerateCodes = async () => {
    const ok = await confirmDialog({
      title: 'สร้างรหัสประจำตัวใหม่อัตโนมัติ',
      message: `ต้องการสร้างรหัสประจำตัว 5 หลักอัตโนมัติให้กับนักเรียนทุกคนในวิชานี้ใช่หรือไม่?`,
      detail: '💡 รหัสประจำตัวใหม่จะถูกคำนวณและสร้างตามระดับชั้นและเลขที่ของนักเรียน',
      type: 'warning',
      confirmText: 'สร้างรหัสใหม่ทั้งห้อง',
      cancelText: 'ยกเลิก'
    });
    if (!ok) return;
    const updated = students.map((s, idx) => ({
      ...s,
      studentCode: generateAutoStudentCode(safeSubject.gradeLevel, s.studentNumber || (idx + 1))
    }));
    onUpdateStudents(updated);
    setUploadSuccess(`สร้างรหัสประจำตัวเข้าดูคะแนนใหม่ทั้งห้องเรียบร้อยแล้ว!`);
    setTimeout(() => setUploadSuccess(''), 3000);
  };

  // Handle Excel/CSV File Upload (auto-assigns codes!)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    try {
      const parsedStudents = await parseStudentExcel(file);
      if (parsedStudents && parsedStudents.length > 0) {
        const willReplace = await confirmDialog({
          title: 'รูปแบบการนำเข้า Excel',
          message: `พบข้อมูลนักเรียน ${parsedStudents.length} คนในไฟล์`,
          detail: 'กด "แทนที่เดิมทั้งหมด" เพื่อล้างรายชื่อเดิมในวิชานี้ หรือกด "เพิ่มต่อท้าย" เพื่อเก็บรายชื่อเดิมไว้',
          type: 'info',
          confirmText: 'แทนที่เดิมทั้งหมด',
          cancelText: 'เพิ่มต่อท้ายรายชื่อเดิม'
        });

        const existingMaxNo = willReplace ? 0 : students.reduce((max, s) => Math.max(max, s.studentNumber || 0), 0);

        // Auto-assign codes right upon Excel upload!
        const prepared = parsedStudents.map((s, idx) => {
          const sNo = s.studentNumber ? parseInt(s.studentNumber, 10) : (existingMaxNo + idx + 1);
          const sCode = (s.studentCode && String(s.studentCode).trim())
            ? String(s.studentCode).trim()
            : generateAutoStudentCode(safeSubject.gradeLevel, sNo);

          return {
            ...s,
            id: s.id || `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
            studentNumber: sNo,
            studentCode: sCode,
            title: s.title || 'ด.ช.',
            name: (s.name || '').trim(),
            gender: s.gender || (s.title?.includes('ญ') ? 'ญ' : 'ช')
          };
        });

        if (willReplace) {
          onUpdateStudents(prepared);
        } else {
          onUpdateStudents([...students, ...prepared]);
        }

        setUploadSuccess(`นำเข้ารายชื่อนักเรียน ${prepared.length} คน พร้อมสร้างรหัสประจำตัวอัตโนมัติครบถ้วน!`);
        setTimeout(() => setUploadSuccess(''), 3500);
      }
    } catch (err) {
      setUploadError(err.message || 'ไม่สามารถอ่านไฟล์ Excel ได้');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCopyCode = (code, id) => {
    navigator.clipboard.writeText(String(code));
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6 animate-pop pb-12">
      {/* Action Header: Upload & Manual Add Buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 glass-card p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 text-xs font-semibold">
            <Users className="w-3.5 h-3.5 text-amber-400" />
            <span>รายชื่อนักเรียนในวิชา: {safeSubject.name}</span>
          </div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <span>จัดการรายชื่อนักเรียน ({students.length} คน)</span>
            <span className="text-xs text-slate-400 font-normal">
              • ชั้น {safeSubject.gradeLevel}
            </span>
          </h3>
          <p className="text-xs text-slate-400">
            ระบบกำหนดรหัสประจำตัวให้อัตโนมัติทุกครั้งที่นำเข้า เพื่อให้นักเรียนล็อกอินดูคะแนนตนเองได้
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full lg:w-auto flex-wrap">
          {/* Sync from Master Roster Button */}
          {masterStudents.length > 0 && (
            <button
              type="button"
              onClick={handleSyncFromMaster}
              className="px-3.5 py-2.5 rounded-xl bg-indigo-900/60 hover:bg-indigo-800 border border-indigo-500/50 text-indigo-200 font-bold text-xs flex items-center gap-1.5 shadow transition-all active:scale-95"
              title={`ดึงรายชื่อจากทะเบียนกลางชั้น ${safeSubject.gradeLevel} (${masterStudents.length} คน)`}
            >
              <School className="w-4 h-4 text-amber-300" />
              <span>ดึงจากทะเบียนกลาง ({masterStudents.length} คน)</span>
            </button>
          )}

          {/* Download Template Button */}
          <button
            type="button"
            onClick={downloadStudentTemplate}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
            title="ดาวน์โหลดไฟล์ตัวอย่าง Excel สำหรับกรอกรายชื่อนักเรียน"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>โหลด Template</span>
          </button>

          {/* Upload Excel Button */}
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
            className="px-3.5 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
            title="นำเข้าจาก Excel พร้อมสร้างรหัสประจำตัวอัตโนมัติ"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'กำลังนำเข้า...' : 'นำเข้า Excel'}</span>
          </button>

          {/* Manual Add Button */}
          <button
            type="button"
            onClick={() => handleOpenManual()}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มทีละคน</span>
          </button>

          {/* Print Cards Button */}
          {students.length > 0 && (
            <button
              type="button"
              onClick={() => setShowPrintCardsModal(true)}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 hover:text-white transition-colors"
              title="พิมพ์การ์ดรหัสเข้าดูคะแนนของนักเรียนวิชานี้"
            >
              <Printer className="w-4 h-4" />
            </button>
          )}

          {/* Regenerate Codes Button */}
          {students.length > 0 && (
            <button
              type="button"
              onClick={handleRegenerateCodes}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-amber-400 hover:text-amber-300 transition-colors"
              title="สร้างรหัสประจำตัวอัตโนมัติใหม่ยกห้อง"
            >
              <Sparkles className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Notifications */}
      {uploadSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-950/80 border border-emerald-600/50 text-emerald-300 text-xs flex items-center gap-2 animate-pop">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{uploadSuccess}</span>
        </div>
      )}

      {uploadError && (
        <div className="p-3.5 rounded-2xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-center gap-2 animate-pop">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Student List Table */}
      {students.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-4">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <div>
            <h4 className="text-base font-bold text-white">ยังไม่มีนักเรียนในรายวิชานี้</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              คุณครูสามารถกดปุ่ม <strong>&quot;ดึงจากทะเบียนกลาง&quot;</strong>, <strong>&quot;นำเข้า Excel&quot;</strong> หรือ <strong>&quot;+ เพิ่มทีละคน&quot;</strong> เพื่อเริ่มต้นได้ทันทีครับ
            </p>
          </div>

          {masterStudents.length > 0 && (
            <button
              type="button"
              onClick={handleSyncFromMaster}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg flex items-center gap-2 mx-auto active:scale-95 transition-all"
            >
              <School className="w-4 h-4 text-amber-300" />
              <span>ดึงรายชื่อ {masterStudents.length} คนจากทะเบียนกลาง {safeSubject.gradeLevel} ทันที</span>
            </button>
          )}
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 uppercase font-semibold">
                <th className="p-3 w-16 text-center">เลขที่</th>
                <th className="p-3 min-w-[130px]">
                  <div className="flex items-center gap-1 text-amber-300">
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>รหัสเข้าดูคะแนน</span>
                  </div>
                </th>
                <th className="p-3 w-20 text-center">คำนำหน้า</th>
                <th className="p-3 min-w-[200px]">ชื่อ - นามสกุล</th>
                <th className="p-3 w-20 text-center">เพศ</th>
                <th className="p-3 w-28 text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 text-center font-mono font-bold text-sm text-slate-200">
                    {std.studentNumber}
                  </td>
                  <td className="p-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-500/50 text-amber-300 font-mono font-black text-xs shadow-sm">
                      <span>{std.studentCode || generateAutoStudentCode(safeSubject.gradeLevel, std.studentNumber)}</span>
                      <button
                        type="button"
                        onClick={() => handleCopyCode(std.studentCode, std.id)}
                        className="text-amber-400 hover:text-white transition-colors"
                        title="คัดลอกรหัสเข้าดูคะแนน"
                      >
                        {copiedId === std.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  </td>
                  <td className="p-3 text-center text-slate-400">
                    {std.title || '-'}
                  </td>
                  <td className="p-3 font-bold text-sm text-white">
                    <div>{std.name}</div>
                    {/* Render mini badges if any */}
                    {(() => {
                      const badgeIds = safeSubject.studentBadges?.[std.id] || [];
                      if (badgeIds.length === 0) return null;
                      return (
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          {badgeIds.map((bId) => {
                            const bInfo = AVAILABLE_BADGES.find((b) => b.id === bId);
                            if (!bInfo) return null;
                            return (
                              <span
                                key={bId}
                                title={`${bInfo.name}: ${bInfo.description}`}
                                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10px]"
                              >
                                <span>{bInfo.icon}</span>
                                <span className="font-semibold text-[9px]">{bInfo.name}</span>
                              </span>
                            );
                          })}
                        </div>
                      );
                    })()}
                  </td>
                  <td className="p-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${std.gender === 'ญ' ? 'bg-pink-950/80 text-pink-300 border border-pink-700/60' : 'bg-cyan-950/80 text-cyan-300 border border-cyan-700/60'}`}>
                      {std.gender === 'ญ' ? 'หญิง' : 'ชาย'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setBadgeModalStudent(std)}
                        className="p-1.5 rounded-lg bg-amber-950/40 hover:bg-amber-900/60 text-amber-400 hover:text-amber-200 border border-amber-600/30 transition-colors"
                        title="มอบเหรียญเกียรติยศ / ตราความดี"
                      >
                        <Award className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenManual(std)}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                        title="แก้ไขข้อมูลนักเรียน"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={async () => {
                          const ok = await confirmDialog({
                            title: 'ยืนยันการลบนักเรียน',
                            message: `ต้องการลบ "${std.title || ''}${std.name}" ออกจากรายวิชานี้ใช่หรือไม่?`,
                            detail: '⚠️ ข้อมูลคะแนนของนักเรียนคนนี้ในวิชานี้จะถูกลบออก',
                            type: 'danger',
                            confirmText: 'ใช่, ลบออก',
                            cancelText: 'ยกเลิก'
                          });
                          if (ok) {
                            onDeleteStudent(std.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                        title="ลบนักเรียน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Manual Add / Edit Student */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop space-y-4">
            <button
              type="button"
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>{editingStudent ? 'แก้ไขข้อมูลนักเรียน' : 'เพิ่มรายชื่อนักเรียนรายบุคคล'}</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">เลขที่</label>
                  <input
                    type="number"
                    min={1}
                    value={studentNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      setStudentNumber(v);
                      if (!editingStudent) {
                        setStudentCode(generateAutoStudentCode(safeSubject.gradeLevel, v));
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 font-mono font-bold text-sm text-white outline-none focus:border-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-300 mb-1 flex items-center gap-1">
                    <KeyRound className="w-3 h-3" />
                    <span>รหัสเข้าดูคะแนน</span>
                  </label>
                  <input
                    type="text"
                    placeholder="เช่น 10601 หรือ 60101"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-amber-500/60 font-mono font-bold text-sm text-amber-300 outline-none focus:border-amber-400"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">คำนำหน้า</label>
                  <select
                    value={title}
                    onChange={(e) => {
                      setTitle(e.target.value);
                      setGender(e.target.value.includes('ญ') ? 'ญ' : 'ช');
                    }}
                    className="w-full px-2 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="ด.ช.">ด.ช.</option>
                    <option value="ด.ญ.">ด.ญ.</option>
                    <option value="นาย">นาย</option>
                    <option value="น.ส.">น.ส.</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อ - นามสกุล</label>
                  <input
                    type="text"
                    placeholder="เช่น สมชาย ใจดี"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white outline-none focus:border-indigo-500"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">เพศ</label>
                <div className="flex gap-4 pt-1">
                  <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                    <input
                      type="radio"
                      name="roster_gender"
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
                      name="roster_gender"
                      value="ญ"
                      checked={gender === 'ญ'}
                      onChange={() => setGender('ญ')}
                      className="accent-pink-500"
                    />
                    <span>👧 หญิง (ญ)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30"
                >
                  {editingStudent ? 'บันทึกการแก้ไข' : 'เพิ่มนักเรียน'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Cards Modal */}
      {showPrintCardsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-4xl max-h-[90vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-pop">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Printer className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    พิมพ์การ์ดรหัสเข้าดูคะแนน: {safeSubject.name} ({students.length} คน)
                  </h3>
                  <p className="text-xs text-slate-400">
                    ชั้น {safeSubject.gradeLevel} • พิมพ์แจกให้นักเรียนเพื่อนำรหัสไปใช้ดูคะแนน
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

            <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 print:grid-cols-3">
              {students.map((s) => (
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
                    <div className="text-xs text-slate-400 print:text-gray-600">{safeSubject.name} ({safeSubject.gradeLevel})</div>
                    <div className="text-sm font-black text-white print:text-black">
                      {s.title || ''}{s.name}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-amber-950/70 border border-amber-500/50 text-center space-y-0.5 print:bg-yellow-50 print:border-yellow-600">
                    <div className="text-[10px] text-amber-300 print:text-yellow-900 font-bold uppercase tracking-wider">
                      รหัสเข้าดูคะแนน (Student Code)
                    </div>
                    <div className="text-xl font-mono font-black text-white print:text-black tracking-widest">
                      {s.studentCode || generateAutoStudentCode(safeSubject.gradeLevel, s.studentNumber)}
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

      {/* Badge Award Modal */}
      <BadgeAwardModal
        isOpen={Boolean(badgeModalStudent)}
        onClose={() => setBadgeModalStudent(null)}
        student={badgeModalStudent}
        subject={safeSubject}
        onSaveSubject={handleSaveSubject}
      />
    </div>
  );
};
