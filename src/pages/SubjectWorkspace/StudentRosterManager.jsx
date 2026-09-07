import React, { useState, useRef } from 'react';
import { Upload, Plus, Download, Users, Trash2, Edit3, CheckCircle2, AlertCircle, FileSpreadsheet, X } from 'lucide-react';
import { parseStudentExcel, downloadStudentTemplate } from '../../components/ExcelHelper';

export const StudentRosterManager = ({ subject = {}, onUpdateStudents, onAddStudent, onDeleteStudent }) => {
  const [showManualModal, setShowManualModal] = useState(false);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentCode, setStudentCode] = useState('');
  const [title, setTitle] = useState('ด.ช.');
  const [name, setName] = useState('');
  const [gender, setGender] = useState('ช');

  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [uploadError, setUploadError] = useState('');

  const fileInputRef = useRef(null);
  const safeSubject = subject || {};
  const { students = [] } = safeSubject;

  const handleOpenManual = () => {
    setStudentNumber(students.length + 1);
    setStudentCode('');
    setTitle('ด.ช.');
    setName('');
    setGender('ช');
    setShowManualModal(true);
  };

  const handleManualSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddStudent({
      studentNumber: parseInt(studentNumber, 10) || (students.length + 1),
      studentCode: studentCode.trim(),
      title,
      name: name.trim(),
      gender
    });

    setShowManualModal(false);
  };

  // Handle Excel/CSV File Upload (Requirement 6)
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadSuccess('');
    setUploadError('');

    try {
      const parsedStudents = await parseStudentExcel(file);
      if (parsedStudents && parsedStudents.length > 0) {
        // Confirm replace or merge
        const willReplace = window.confirm(
          `พบข้อมูลนักเรียน ${parsedStudents.length} คนในไฟล์\n\nกด "ตกลง (OK)" เพื่อแทนที่รายชื่อเดิมทั้งหมด\nหรือกด "ยกเลิก (Cancel)" เพื่อเพิ่มต่อท้ายรายชื่อเดิม`
        );

        if (willReplace) {
          onUpdateStudents(parsedStudents);
        } else {
          // Merge
          const existingMaxNo = students.reduce((max, s) => Math.max(max, s.studentNumber || 0), 0);
          const adjusted = parsedStudents.map((s, idx) => ({
            ...s,
            studentNumber: existingMaxNo + idx + 1
          }));
          onUpdateStudents([...students, ...adjusted]);
        }

        setUploadSuccess(`นำเข้ารายชื่อนักเรียนสำเร็จ ${parsedStudents.length} คน เรียบร้อยแล้ว!`);
      }
    } catch (err) {
      setUploadError(err.message || 'ไม่สามารถอ่านไฟล์ Excel ได้');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6 animate-pop">
      {/* Action Header: Upload & Manual Add Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-5 rounded-3xl border border-slate-800">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Users className="w-5 h-5 text-indigo-400" />
            <span>จัดการรายชื่อนักเรียน ({students.length} คน)</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            นำเข้ารายชื่อนักเรียนทั้งห้องผ่านไฟล์ Excel / CSV หรือเพิ่มรายชื่อเองทีละคน
          </p>
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto flex-wrap">
          {/* Download Template Button */}
          <button
            onClick={downloadStudentTemplate}
            className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 font-medium text-xs flex items-center gap-1.5 transition-colors"
            title="ดาวน์โหลดไฟล์ตัวอย่าง Excel สำหรับกรอกรายชื่อนักเรียน"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>โหลด Template Excel</span>
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
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="px-4 py-2.5 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'กำลังนำเข้า...' : 'อัปโหลดไฟล์ Excel'}</span>
          </button>

          {/* Manual Add Button */}
          <button
            onClick={handleOpenManual}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ เพิ่มทีละคน</span>
          </button>
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
        <div className="glass-card rounded-3xl p-12 text-center border border-slate-800 text-slate-400 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h4 className="text-base font-bold text-white">ยังไม่มีนักเรียนในรายวิชานี้</h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            กดปุ่ม &quot;อัปโหลดไฟล์ Excel&quot; หรือ &quot;+ เพิ่มทีละคน&quot; ด้านบนเพื่อเริ่มต้น
          </p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <th className="p-3 w-16 text-center">เลขที่</th>
                <th className="p-3 w-28">รหัสนักเรียน</th>
                <th className="p-3 w-24">คำนำหน้า</th>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3 w-20 text-center">เพศ</th>
                <th className="p-3 w-20 text-center">จัดการ</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {students.map((std) => (
                <tr key={std.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="p-3 text-center font-mono font-bold text-base text-slate-200">
                    {std.studentNumber}
                  </td>
                  <td className="p-3 font-mono text-sm text-slate-300">
                    {std.studentCode || '-'}
                  </td>
                  <td className="p-3 text-sm text-slate-300">
                    {std.title || '-'}
                  </td>
                  <td className="p-3 font-bold text-base text-white">
                    {std.name}
                  </td>

                  <td className="p-3 text-center font-bold">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] ${std.gender === 'ญ' ? 'bg-pink-950 text-pink-400' : 'bg-blue-950 text-blue-400'}`}>
                      {std.gender === 'ญ' ? 'หญิง' : 'ชาย'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => {
                        if (window.confirm(`ต้องการลบ "${std.title || ''}${std.name}" ออกจากรายวิชานี้ใช่หรือไม่?`)) {
                          onDeleteStudent(std.id);
                        }
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                      title="ลบนักเรียน"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal: Manual Add Student */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-md rounded-3xl p-6 shadow-2xl relative animate-pop space-y-4">
            <button
              onClick={() => setShowManualModal(false)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Plus className="w-5 h-5 text-indigo-400" />
              <span>เพิ่มรายชื่อนักเรียนรายบุคคล</span>
            </h3>

            <form onSubmit={handleManualSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">เลขที่</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={studentNumber}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === '' || /^\d+$/.test(v)) setStudentNumber(v);
                    }}
                    onWheel={(e) => {
                      e.preventDefault();
                      const isUp = e.deltaY < 0;
                      const curr = parseInt(studentNumber, 10) || 1;
                      const next = isUp ? curr + 1 : Math.max(1, curr - 1);
                      setStudentNumber(next);
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono font-bold text-sm text-white outline-none focus:border-indigo-500 no-spin cursor-pointer"
                    title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับเลขที่"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">รหัสนักเรียน</label>
                  <input
                    type="text"
                    placeholder="เช่น 10001"
                    value={studentCode}
                    onChange={(e) => setStudentCode(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono text-sm text-white outline-none focus:border-indigo-500"
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
                  <label className="block text-xs font-semibold text-slate-300 mb-1">ชื่อ-นามสกุล</label>
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

              <div className="flex gap-2 pt-2">
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
                  เพิ่มนักเรียน
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
