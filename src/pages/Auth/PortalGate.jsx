import React, { useState, useMemo } from 'react';
import {
  KeyRound, Search, ArrowRight, AlertCircle, X, Copy, Check, CheckCircle2,
  User
} from 'lucide-react';
import { StudentCartoonAvatar } from '../../components/StudentCartoonAvatar';

export const PortalGate = ({ subjects = {}, onLoginTeacher, onLoginStudent }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchNameQuery, setSearchNameQuery] = useState('');
  const [selectedGradeFilter, setSelectedGradeFilter] = useState('all');
  const [copiedCode, setCopiedCode] = useState(null);

  // Flatten unique students across all subjects
  const allStudents = useMemo(() => {
    const studentMap = new Map();
    Object.values(subjects).forEach((subj) => {
      (subj.students || []).forEach((s) => {
        if (!studentMap.has(s.id)) {
          studentMap.set(s.id, {
            ...s,
            gradeLevel: subj.gradeLevel || 'ชั้นประถมศึกษาปีที่ 5/1',
            subjectsEnrolled: [subj]
          });
        } else {
          studentMap.get(s.id).subjectsEnrolled.push(subj);
        }
      });
    });
    return Array.from(studentMap.values()).sort(
      (a, b) => a.studentNumber - b.studentNumber
    );
  }, [subjects]);

  // Extract unique grade levels for filter
  const gradeLevels = useMemo(() => {
    const set = new Set();
    allStudents.forEach((s) => set.add(s.gradeLevel));
    return Array.from(set);
  }, [allStudents]);

  // Handle Login Submit from the single input box
  const handleAuthSubmit = (e) => {
    if (e) e.preventDefault();
    setError('');

    const cleanInput = passcode.trim();
    if (!cleanInput) {
      setError('กรุณากรอกรหัสผ่านของคุณ');
      return;
    }

    // 1. Check if Teacher Password
    if (
      cleanInput === '1234' ||
      cleanInput.toLowerCase() === 'admin' ||
      cleanInput === 'ครูซอส'
    ) {
      onLoginTeacher();
      return;
    }

    // 2. Check if Student Code / Student ID / Student Number
    const foundStudent = allStudents.find((s) => {
      return (
        String(s.studentCode).toLowerCase() === cleanInput.toLowerCase() ||
        String(s.id).toLowerCase() === cleanInput.toLowerCase() ||
        String(s.studentNumber) === cleanInput
      );
    });

    if (foundStudent) {
      onLoginStudent(foundStudent);
      return;
    }

    setError('รหัสผ่านไม่ถูกต้อง หรือไม่พบรหัสนี้ในระบบ กรุณาตรวจสอบอีกครั้ง');
  };

  // Copy student code to clipboard
  const handleCopyCode = (code) => {
    try {
      navigator.clipboard.writeText(String(code));
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2500);
    } catch (err) {
      // Fallback
    }
  };

  // Filtered Students in Search Modal
  const searchedStudents = useMemo(() => {
    const q = searchNameQuery.trim().toLowerCase();
    if (!q) return [];
    return allStudents.filter((s) => {
      const matchesGrade =
        selectedGradeFilter === 'all' || s.gradeLevel === selectedGradeFilter;
      if (!matchesGrade) return false;
      return (
        s.name.toLowerCase().includes(q) ||
        String(s.studentNumber).includes(q) ||
        String(s.studentCode).includes(q) ||
        (s.title || '').toLowerCase().includes(q)
      );
    });
  }, [allStudents, searchNameQuery, selectedGradeFilter]);

  return (
    <div className="h-screen w-screen bg-slate-950 text-white flex flex-col justify-between items-center relative overflow-hidden font-sans select-none px-4">
      
      {/* 🔮 Soft Ambient Lighting Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[450px] bg-indigo-600/15 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[350px] h-[350px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Subtle Dot Grid Background */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          backgroundImage: `radial-gradient(#6366f1 1.2px, transparent 1.2px)`,
          backgroundSize: '32px 32px'
        }}
      />

      {/* Top Spacer for perfect vertical balance */}
      <div className="w-full pt-4" />

      {/* ========================================================= */}
      {/* 🎯 MAIN CENTER VIEW (จบใน 1 หน้า ไม่เลื่อน ไม่รก คมชัด)    */}
      {/* ========================================================= */}
      <main className="w-full max-w-2xl mx-auto my-auto flex flex-col items-center text-center relative z-10 space-y-4 px-2">
        
        {/* Kru Sauce Official Circular Logo */}
        <div className="relative group">
          <div className="absolute -inset-1.5 bg-gradient-to-r from-cyan-400 via-indigo-500 to-amber-400 rounded-full blur-md opacity-75 group-hover:opacity-100 transition duration-500 animate-pulse" />
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 shadow-2xl flex items-center justify-center">
            <img
              src="/kru-sauce-logo.jpg"
              alt="ครูซอส สอนสังคม"
              className="w-full h-full object-cover rounded-full shadow-inner"
            />
          </div>
        </div>

        {/* Headline: แถวเดียว ไม่ขึ้น 2 บรรทัด */}
        <div className="space-y-1">
          <div className="inline-block px-3 py-0.5 rounded-full bg-gradient-to-r from-cyan-500/20 via-indigo-500/20 to-amber-500/20 border border-indigo-400/40 text-cyan-300 text-[11px] font-black tracking-widest uppercase font-mono shadow-sm">
            KRUSOS EDTECH
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-white tracking-tight whitespace-nowrap">
            ระบบบันทึกคะแนนและพัฒนาการเรียนรู้
          </h1>
        </div>

        {/* Subtitle: 2 บรรทัด (เพิ่มขนาดตัวอักษรตามคำขอ) */}
        <div className="space-y-1.5 text-center">
          <p className="text-sm sm:text-base md:text-lg font-bold text-amber-300 tracking-wide">
            นายนรากรณ์ จูงาม (ครูซอสสอนสังคม)
          </p>
          <p className="text-xs sm:text-sm md:text-base text-indigo-200 font-medium tracking-wide">
            แพลตฟอร์มประเมินผลการเรียนรู้และการสอนสังคมศึกษายุคใหม่
          </p>
        </div>

        {/* 🔐 PASSCODE INPUT CARD (สะอาด เรียบหรู ไม่มีเส้นส่วนเกิน) */}
        <div className="w-full max-w-sm glass-panel rounded-3xl p-5 sm:p-6 border border-slate-700/80 shadow-2xl shadow-indigo-950/80 backdrop-blur-2xl bg-slate-900/90 text-left space-y-3.5 mt-1">
          
          <form onSubmit={handleAuthSubmit} className="space-y-3">
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400">
                <KeyRound className="w-5 h-5" />
              </div>
              <input
                id="passcode-input"
                type="text"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError('');
                }}
                placeholder="กรอกรหัสผ่าน หรือ รหัสประจำตัว..."
                className="w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-950/90 border border-slate-700 text-white font-mono text-sm sm:text-base font-bold placeholder-slate-500 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/20 transition-all shadow-inner"
                autoFocus
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-2.5 rounded-xl bg-rose-950/80 border border-rose-600/50 text-rose-300 text-xs flex items-start gap-2 animate-pop">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 hover:from-indigo-500 hover:to-purple-500 text-white font-black text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer"
            >
              <span>เข้าสู่ระบบ</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Student Search Button */}
          <button
            type="button"
            onClick={() => {
              setShowSearchModal(true);
              setError('');
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-amber-500/40 text-xs font-bold text-amber-400 hover:text-amber-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-amber-400" />
            <span>นักเรียนจำรหัสไม่ได้? ค้นหารหัสจากชื่อ-นามสกุล</span>
          </button>
        </div>

        {/* 📜 คำคมคติเตือนใจเกี่ยวกับสังคมศึกษา (ตามที่ผู้ใช้กำหนด) */}
        <div className="pt-2 text-center max-w-xl mx-auto px-4 space-y-0.5">
          <p className="text-xs sm:text-sm text-slate-200 italic font-medium tracking-wide whitespace-nowrap">
            “เรียนรู้สังคม เข้าใจผู้คน สร้างวันพรุ่งนี้ที่ดีกว่า”
          </p>
          <p className="text-[10px] sm:text-[11px] font-mono tracking-widest text-indigo-400/90 uppercase whitespace-nowrap">
            LEARN SOCIETY • UNDERSTAND PEOPLE • BUILD A BETTER TOMORROW
          </p>
        </div>

      </main>

      {/* Clean Minimalist Bottom Footer (ลิขสิทธิ์ © 2026) */}
      <footer className="w-full py-3.5 text-center text-xs text-slate-400 relative z-10 border-t border-slate-800/40">
        © 2026 พัฒนาโดย เพจตามติดชีวิต KruSos
      </footer>

      {/* ========================================================= */}
      {/* 🔍 MODAL: ค้นหารหัสประจำตัวนักเรียนจากชื่อ-นามสกุล         */}
      {/* ========================================================= */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel w-full max-w-xl max-h-[85vh] rounded-3xl border border-slate-700 shadow-2xl flex flex-col overflow-hidden animate-pop">
            
            {/* Modal Header */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                  <Search className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    ค้นหารหัสประจำตัวนักเรียน
                  </h3>
                  <p className="text-xs text-slate-400">
                    พิมพ์ชื่อ นามสกุล หรือเลขที่ เพื่อค้นหารหัสประจำตัวของตนเอง
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowSearchModal(false)}
                className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Filter and Search Bar */}
            <div className="p-4 bg-slate-900/60 border-b border-slate-800 space-y-3">
              {/* Search input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="พิมพ์ชื่อจริง, นามสกุล, หรือเลขที่ (เช่น พิชญา, ณัฐวุฒิ)..."
                  value={searchNameQuery}
                  onChange={(e) => setSearchNameQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-sm text-white placeholder-slate-400 outline-none focus:border-indigo-400"
                  autoFocus
                />
              </div>

              {/* Grade filter pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs scrollbar-none">
                <button
                  onClick={() => setSelectedGradeFilter('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                    selectedGradeFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  ทั้งหมด ({allStudents.length})
                </button>
                {gradeLevels.map((lvl) => (
                  <button
                    key={lvl}
                    onClick={() => setSelectedGradeFilter(lvl)}
                    className={`px-3 py-1 rounded-lg font-bold whitespace-nowrap transition-all cursor-pointer ${
                      selectedGradeFilter === 'lvl' || selectedGradeFilter === lvl
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Students Search Results List */}
            <div className="p-4 overflow-y-auto space-y-2.5 flex-1 divide-y divide-slate-800/60">
              {!searchNameQuery.trim() ? (
                <div className="text-center py-12 text-slate-400 space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-950/60 border border-indigo-700/40 flex items-center justify-center mx-auto text-indigo-400">
                    <Search className="w-6 h-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-white">
                      พิมพ์ชื่อ-นามสกุล หรือเลขที่ในช่องค้นหา
                    </p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      เพื่อดูรหัสประจำตัวของตนเอง แล้วกดคัดลอกรหัสนำไปกรอกในช่องเข้าสู่ระบบ
                    </p>
                  </div>
                </div>
              ) : searchedStudents.length === 0 ? (
                <div className="text-center py-10 text-slate-400 space-y-2">
                  <User className="w-10 h-10 mx-auto text-slate-600" />
                  <p className="text-sm">ไม่พบรายชื่อนักเรียนที่ตรงกับคำค้นหา "{searchNameQuery}"</p>
                  <p className="text-xs text-slate-400">ลองตรวจสอบการสะกดชื่อหรือสลับระดับชั้น</p>
                </div>
              ) : (
                searchedStudents.map((std) => (
                  <div
                    key={std.id}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 group hover:bg-slate-900/50 p-2.5 rounded-2xl transition-colors border border-slate-800/40 bg-slate-900/30"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <StudentCartoonAvatar
                        gender={std.gender}
                        title={std.title}
                        size="sm"
                        className="w-9 h-9 shrink-0 aspect-square"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-sm text-white truncate flex items-center gap-2">
                          <span>
                            {std.title || ''}{std.name}
                          </span>
                          <span className="text-[11px] font-mono font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded-md border border-indigo-800/60">
                            เลขที่ {std.studentNumber}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{std.gradeLevel}</span>
                          <span>•</span>
                          <span className="text-amber-300 font-mono font-bold">
                            รหัส: {std.studentCode || '-'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* ปุ่มคัดลอกรหัส (ไม่มีทางลัดเข้าระบบ ให้คัดลอกไปใส่ตามคำขอ) */}
                    <button
                      type="button"
                      onClick={() => handleCopyCode(std.studentCode)}
                      className={`px-3 py-2 rounded-xl font-black text-xs shrink-0 flex items-center gap-1.5 transition-all shadow-sm cursor-pointer ${
                        copiedCode === std.studentCode
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 active:scale-95'
                      }`}
                      title="คัดลอกรหัสประจำตัว"
                    >
                      {copiedCode === std.studentCode ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-white" />
                          <span>คัดลอกแล้ว!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>คัดลอกรหัส</span>
                        </>
                      )}
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Notification Banner when Copied */}
            {copiedCode && (
              <div className="p-3 bg-emerald-950/90 border-t border-emerald-600/50 flex items-center justify-between gap-2 text-xs text-emerald-300 animate-pop">
                <div className="flex items-center gap-2 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="truncate">
                    คัดลอกรหัส <strong>{copiedCode}</strong> แล้ว นำไปวางในช่องรหัสผ่านหน้าแรกได้เลยครับ
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] shrink-0 cursor-pointer"
                >
                  ปิดหน้าต่าง
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
