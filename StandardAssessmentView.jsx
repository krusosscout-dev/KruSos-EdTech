import React, { useState } from 'react';
import { Award, CheckCircle2, Sparkles, BookOpen, Star, ShieldCheck, Heart, Zap } from 'lucide-react';

const CHAR_8_ITEMS = [
  { id: 1, name: '1. รักชาติ ศาสน์ กษัตริย์' },
  { id: 2, name: '2. ซื่อสัตย์สุจริต' },
  { id: 3, name: '3. มีวินัย' },
  { id: 4, name: '4. ใฝ่เรียนรู้' },
  { id: 5, name: '5. อยู่อย่างพอเพียง' },
  { id: 6, name: '6. มุ่งมั่นในการทำงาน' },
  { id: 7, name: '7. รักความเป็นไทย' },
  { id: 8, name: '8. มีจิตสาธารณะ' },
];

const COMP_5_ITEMS = [
  { id: 1, name: '1. ความสามารถในการสื่อสาร' },
  { id: 2, name: '2. ความสามารถในการคิด' },
  { id: 3, name: '3. ความสามารถในการแก้ปัญหา' },
  { id: 4, name: '4. ความสามารถในการใช้ทักษะชีวิต' },
  { id: 5, name: '5. ความสามารถในการใช้เทคโนโลยี' },
];

export const StandardAssessmentView = ({ subject = {}, onSaveAssessments }) => {
  const [activeTab, setActiveTab] = useState('characteristics'); // 'characteristics' | 'competencies' | 'readingAnalysis'

  const safeSubject = subject || {};
  const { students = [], assessments = {} } = safeSubject;
  const characteristics = assessments.characteristics || {};
  const competencies = assessments.competencies || {};
  const readingAnalysis = assessments.readingAnalysis || {};

  // Batch action: Set all to level 3 (ดีเยี่ยม)
  const handleSetAllLevel3 = () => {
    if (activeTab === 'characteristics') {
      const updated = { ...characteristics };
      students.forEach(s => {
        updated[s.id] = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3, 6: 3, 7: 3, 8: 3 };
      });
      onSaveAssessments('characteristics', updated);
    } else if (activeTab === 'competencies') {
      const updated = { ...competencies };
      students.forEach(s => {
        updated[s.id] = { 1: 3, 2: 3, 3: 3, 4: 3, 5: 3 };
      });
      onSaveAssessments('competencies', updated);
    } else if (activeTab === 'readingAnalysis') {
      const updated = { ...readingAnalysis };
      students.forEach(s => {
        updated[s.id] = 3;
      });
      onSaveAssessments('readingAnalysis', updated);
    }
  };

  const handleUpdateChar = (studentId, itemId, value) => {
    const updated = {
      ...characteristics,
      [studentId]: {
        ...(characteristics[studentId] || {}),
        [itemId]: parseInt(value, 10)
      }
    };
    onSaveAssessments('characteristics', updated);
  };

  const handleUpdateComp = (studentId, itemId, value) => {
    const updated = {
      ...competencies,
      [studentId]: {
        ...(competencies[studentId] || {}),
        [itemId]: parseInt(value, 10)
      }
    };
    onSaveAssessments('competencies', updated);
  };

  const handleUpdateReading = (studentId, value) => {
    const updated = {
      ...readingAnalysis,
      [studentId]: parseInt(value, 10)
    };
    onSaveAssessments('readingAnalysis', updated);
  };

  return (
    <div className="space-y-5 animate-pop">
      {/* Category Tabs & Quick Batch Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 glass-card p-4 rounded-3xl border border-slate-800">
        <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('characteristics')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'characteristics'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Heart className="w-4 h-4 text-rose-400" />
            <span>คุณลักษณะอันพึงประสงค์ (8 ข้อ)</span>
          </button>

          <button
            onClick={() => setActiveTab('competencies')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'competencies'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className="w-4 h-4 text-amber-400" />
            <span>สมรรถนะสำคัญ (5 ด้าน)</span>
          </button>

          <button
            onClick={() => setActiveTab('readingAnalysis')}
            className={`flex-1 sm:flex-initial px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'readingAnalysis'
                ? 'bg-indigo-600 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>การอ่าน คิดวิเคราะห์ เขียน</span>
          </button>
        </div>

        <button
          onClick={handleSetAllLevel3}
          className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-950/70 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
          title="ตั้งค่าระดับ 3 (ดีเยี่ยม) ให้นักเรียนทุกคนในหมวดนี้ทันที แล้วค่อยปรับแก้เฉพาะคน"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>ตั้งค่าระดับ 3 (ดีเยี่ยม) ทั้งห้อง</span>
        </button>
      </div>

      {/* Guide Note */}
      <div className="px-4 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 flex items-center justify-between flex-wrap gap-2">
        <span>เกณฑ์การประเมิน สพฐ.: <strong>3 = ดีเยี่ยม</strong>, <strong>2 = ดี</strong>, <strong>1 = ผ่านเกณฑ์</strong>, <strong>0 = ไม่ผ่านเกณฑ์</strong></span>
        <span className="text-indigo-400 font-semibold">• ข้อมูลจะถูกส่งออกในไฟล์ Excel ปพ.5 อัตโนมัติ</span>
      </div>

      {/* Tab 1: คุณลักษณะอันพึงประสงค์ (8 ข้อ) */}
      {activeTab === 'characteristics' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <th className="p-3 w-12 text-center sticky left-0 bg-slate-900 z-10 border-r border-slate-700">เลขที่</th>
                  <th className="p-3 min-w-[170px] sticky left-12 bg-slate-900 z-10 border-r-2 border-slate-600 shadow-[inset_-2px_0_0_0_#64748b] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none">ชื่อ-นามสกุล</th>
                  {CHAR_8_ITEMS.map((item, itIdx) => (
                    <th key={item.id} className={`p-2.5 text-center min-w-[95px] border-r border-slate-800/60 font-medium ${itIdx === 0 ? 'border-l-2 border-slate-600' : ''}`}>
                      <div className="truncate max-w-[90px] mx-auto text-[11px] text-slate-300" title={item.name}>
                        {item.name}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[90px] font-bold text-amber-300">สรุปผล</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {students.map(std => {
                  const studentChars = characteristics[std.id] || {};
                  let sum = 0;
                  CHAR_8_ITEMS.forEach(it => {
                    const val = studentChars[it.id] !== undefined ? studentChars[it.id] : 3;
                    sum += parseInt(val, 10);
                  });
                  const avg = sum / 8;
                  const resultText = avg >= 2.5 ? 'ดีเยี่ยม' : avg >= 1.5 ? 'ดี' : avg >= 1.0 ? 'ผ่าน' : 'ไม่ผ่าน';

                  return (
                    <tr key={std.id} className="hover:bg-slate-800/60 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-base text-slate-200 sticky left-0 bg-slate-850 z-10 border-r border-slate-700">
                        {std.studentNumber}
                      </td>
                      <td className="p-3 font-bold text-base text-white sticky left-12 bg-slate-850 z-10 border-r-2 border-slate-600 truncate max-w-[200px] shadow-[inset_-2px_0_0_0_#64748b] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none">
                        {std.title || ''}{std.name}
                      </td>

                      {CHAR_8_ITEMS.map((it, itIdx) => {
                        const val = studentChars[it.id] !== undefined ? studentChars[it.id] : 3;
                        return (
                          <td key={it.id} className={`p-2 text-center border-r border-slate-800/60 ${itIdx === 0 ? 'border-l-2 border-slate-600' : ''}`}>
                            <select
                              value={val}
                              onChange={(e) => handleUpdateChar(std.id, it.id, e.target.value)}
                              onWheel={(e) => {
                                e.preventDefault();
                                const current = parseInt(val, 10) || 0;
                                const next = e.deltaY < 0 ? Math.min(3, current + 1) : Math.max(0, current - 1);
                                handleUpdateChar(std.id, it.id, next);
                              }}
                              title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับระดับ (0 - 3)"
                              className={`px-2 py-1 rounded-lg font-mono font-bold text-xs outline-none border transition-colors cursor-pointer ${
                                val === 3
                                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                                  : val === 2
                                  ? 'bg-indigo-950/80 border-indigo-600/60 text-indigo-300'
                                  : val === 1
                                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                                  : 'bg-rose-950/80 border-rose-600/60 text-rose-300'
                              }`}
                            >
                              <option value="3">3</option>
                              <option value="2">2</option>
                              <option value="1">1</option>
                              <option value="0">0</option>
                            </select>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded-lg ${avg >= 2.5 ? 'text-emerald-400 bg-emerald-950/50' : 'text-indigo-400'}`}>
                          {resultText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: สมรรถนะสำคัญ 5 ด้าน */}
      {activeTab === 'competencies' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                  <th className="p-3 w-12 text-center sticky left-0 bg-slate-900 z-10 border-r border-slate-700">เลขที่</th>
                  <th className="p-3 min-w-[170px] sticky left-12 bg-slate-900 z-10 border-r-2 border-slate-600 shadow-[inset_-2px_0_0_0_#64748b] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none">ชื่อ-นามสกุล</th>
                  {COMP_5_ITEMS.map((item, itIdx) => (
                    <th key={item.id} className={`p-2.5 text-center min-w-[110px] border-r border-slate-800/60 font-medium ${itIdx === 0 ? 'border-l-2 border-slate-600' : ''}`}>
                      <div className="truncate max-w-[105px] mx-auto text-[11px] text-slate-300" title={item.name}>
                        {item.name}
                      </div>
                    </th>
                  ))}
                  <th className="p-3 text-center min-w-[90px] font-bold text-amber-300">สรุปผล</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/60">
                {students.map(std => {
                  const studentComps = competencies[std.id] || {};
                  let sum = 0;
                  COMP_5_ITEMS.forEach(it => {
                    const val = studentComps[it.id] !== undefined ? studentComps[it.id] : 3;
                    sum += parseInt(val, 10);
                  });
                  const avg = sum / 5;
                  const resultText = avg >= 2.5 ? 'ดีเยี่ยม' : avg >= 1.5 ? 'ดี' : avg >= 1.0 ? 'ผ่าน' : 'ไม่ผ่าน';

                  return (
                    <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 text-center font-mono font-bold text-base text-slate-200 sticky left-0 bg-slate-850 z-10 border-r border-slate-700">
                        {std.studentNumber}
                      </td>
                      <td className="p-3 font-bold text-base text-white sticky left-12 bg-slate-850 z-10 border-r-2 border-slate-600 truncate max-w-[200px] shadow-[inset_-2px_0_0_0_#64748b] after:content-[''] after:absolute after:top-0 after:right-0 after:bottom-0 after:w-[2px] after:bg-slate-500 after:pointer-events-none">
                        {std.title || ''}{std.name}
                      </td>

                      {COMP_5_ITEMS.map((it, itIdx) => {
                        const val = studentComps[it.id] !== undefined ? studentComps[it.id] : 3;
                        return (
                          <td key={it.id} className={`p-2 text-center border-r border-slate-800/60 ${itIdx === 0 ? 'border-l-2 border-slate-600' : ''}`}>
                            <select
                              value={val}
                              onChange={(e) => handleUpdateComp(std.id, it.id, e.target.value)}
                              onWheel={(e) => {
                                e.preventDefault();
                                const current = parseInt(val, 10) || 0;
                                const next = e.deltaY < 0 ? Math.min(3, current + 1) : Math.max(0, current - 1);
                                handleUpdateComp(std.id, it.id, next);
                              }}
                              title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับระดับ (0 - 3)"
                              className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs outline-none border transition-colors cursor-pointer ${
                                val === 3
                                  ? 'bg-emerald-950/80 border-emerald-600/60 text-emerald-300'
                                  : val === 2
                                  ? 'bg-indigo-950/80 border-indigo-600/60 text-indigo-300'
                                  : val === 1
                                  ? 'bg-amber-950/80 border-amber-600/60 text-amber-300'
                                  : 'bg-rose-950/80 border-rose-600/60 text-rose-300'
                              }`}
                            >
                              <option value="3">3</option>
                              <option value="2">2</option>
                              <option value="1">1</option>
                              <option value="0">0</option>
                            </select>
                          </td>
                        );
                      })}

                      <td className="p-3 text-center font-bold text-xs">
                        <span className={`px-2 py-0.5 rounded-lg ${avg >= 2.5 ? 'text-emerald-400 bg-emerald-950/50' : 'text-indigo-400'}`}>
                          {resultText}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: การอ่าน คิดวิเคราะห์ และเขียน */}
      {activeTab === 'readingAnalysis' && (
        <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl max-w-2xl mx-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 uppercase font-semibold">
                <th className="p-3 w-14 text-center">เลขที่</th>
                <th className="p-3">ชื่อ-นามสกุล</th>
                <th className="p-3 text-center w-48">ระดับผลการประเมิน (0 - 3)</th>
                <th className="p-3 text-center w-28">สรุปผล</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {students.map(std => {
                const val = readingAnalysis[std.id] !== undefined ? readingAnalysis[std.id] : 3;
                const resultText = val === 3 ? 'ดีเยี่ยม' : val === 2 ? 'ดี' : val === 1 ? 'ผ่าน' : 'ไม่ผ่าน';

                return (
                  <tr key={std.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-3 text-center font-mono font-bold text-slate-400">{std.studentNumber}</td>
                    <td className="p-3 font-semibold text-white">{std.title || ''}{std.name}</td>
                    <td className="p-3 text-center">
                      <div
                        onWheel={(e) => {
                          e.preventDefault();
                          const current = parseInt(val, 10) || 0;
                          const next = e.deltaY < 0 ? Math.min(3, current + 1) : Math.max(0, current - 1);
                          handleUpdateReading(std.id, next);
                        }}
                        title="เลื่อนลูกกลิ้งเมาส์เพื่อปรับระดับ (0 - 3)"
                        className="flex items-center justify-center gap-1.5 cursor-ns-resize"
                      >
                        {[3, 2, 1, 0].map(level => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => handleUpdateReading(std.id, level)}
                            className={`w-8 h-8 rounded-xl font-mono font-bold text-xs border transition-all ${
                              val === level
                                ? level === 3
                                  ? 'bg-emerald-600 text-white border-emerald-400 shadow-md'
                                  : level === 2
                                  ? 'bg-indigo-600 text-white border-indigo-400 shadow-md'
                                  : level === 1
                                  ? 'bg-amber-600 text-white border-amber-400'
                                  : 'bg-rose-600 text-white border-rose-400'
                                : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="p-3 text-center font-bold">
                      <span className={`px-2.5 py-1 rounded-lg text-xs ${
                        val >= 2 ? 'text-emerald-300 bg-emerald-950 border border-emerald-800' : 'text-amber-300 bg-amber-950'
                      }`}>
                        {resultText}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
