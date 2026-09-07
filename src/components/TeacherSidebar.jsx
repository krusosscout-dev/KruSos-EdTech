import React from 'react';
import {
  LayoutDashboard, BarChart2, FileText, Award, Trophy, CheckSquare,
  Users, Sparkles, Download, LogOut, ChevronLeft, ChevronRight, School,
  Volume2, VolumeX, ChevronDown, BookOpen, Layers
} from 'lucide-react';
import { useSocket } from '../context/SocketContext';
import kruSauceLogo from '../assets/logo.js';

export const TeacherSidebar = ({
  activeMenu = 'overview',
  onSelectMenu,
  subjects = {},
  selectedSubjectId = '',
  onSelectSubject,
  onLogout,
  collapsed = false,
  onToggleCollapse,
  mobileOpen = false,
  onCloseMobile
}) => {
  const { soundMuted, toggleSound } = useSocket();
  const subjectList = Object.values(subjects);
  const currentSubject = subjects[selectedSubjectId] || subjectList[0] || null;

  const menuSections = [
    {
      title: 'งานวิชาการและคะแนน',
      items: [
        { key: 'overview', label: 'แดชบอร์ดภาพรวม', icon: LayoutDashboard },
        { key: 'gradebook', label: 'สมุดบันทึกคะแนนเก็บ', icon: BarChart2, badge: currentSubject?.assignments?.length ? `${currentSubject.assignments.length} ช่อง` : null },
        { key: 'assignments', label: 'หน้ารวมงาน/ภารกิจ', icon: FileText },
        { key: 'grading', label: 'สรุปผลและตัดเกรด', icon: Award }
      ]
    },
    {
      title: 'มาตรฐาน สพฐ. & เชิดชูเกียรติ',
      items: [
        { key: 'leaderboard', label: 'ทำเนียบเกียรติยศระดับชั้น', icon: Trophy, isHighlight: true },
        { key: 'assessments', label: 'ประเมิน 3 ด้าน สพฐ.', icon: CheckSquare }
      ]
    },
    {
      title: 'การจัดการชั้นเรียน',
      items: [
        { key: 'attendance', label: 'เช็คชื่อ & แต้มรายคาบ', icon: CheckSquare },
        { key: 'roster', label: 'ทะเบียนรายชื่อนักเรียน', icon: Users, badge: currentSubject?.students?.length ? `${currentSubject.students.length} คน` : null },
        { key: 'tools', label: 'เครื่องมือห้องเรียน (วงล้อ/QR)', icon: Sparkles }
      ]
    },
    {
      title: 'เอกสารและรายงาน',
      items: [
        { key: 'reports', label: 'ส่งออก ปพ.5 (Excel) & พิมพ์', icon: Download }
      ]
    }
  ];

  const handleMenuClick = (key) => {
    onSelectMenu(key);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex flex-col bg-slate-900 border-r border-slate-800 transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header: Single Unified Profile & School Brand (ไม่ซ้ำซ้อน) */}
        <div className="relative p-3 border-b border-slate-800 flex items-center min-h-[72px]">
          <div className={`flex items-center gap-3 min-w-0 ${collapsed ? 'mx-auto' : 'pr-6 flex-1'}`}>
            <div className="relative shrink-0">
              <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-cyan-400 via-indigo-500 to-amber-400 shadow-md shadow-indigo-600/30 flex items-center justify-center">
                <img
                  src={kruSauceLogo}
                  alt="คุณครูซอส"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-slate-900 rounded-full" title="ออนไลน์" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="font-extrabold text-sm text-white tracking-tight truncate">
                  KruSos EdTech
                </div>
                <div className="text-[11px] text-indigo-300 font-medium truncate">
                  โรงเรียนวัดบางปูน
                </div>
                <div className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                  <span>คุณครูซอส (ผู้ดูแลระบบ)</span>
                </div>
              </div>
            )}
          </div>

          {/* Floating Collapse/Expand Button: Positioned on the border, offset from logo, small & distinct */}
          <button
            type="button"
            onClick={onToggleCollapse}
            className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-slate-800 hover:bg-indigo-600 text-slate-300 hover:text-white border border-slate-700 shadow-md shadow-black/50 items-center justify-center transition-all duration-200 hover:scale-110 z-50 cursor-pointer"
            title={collapsed ? 'ขยายแถบเมนู (คลิก)' : 'ย่อแถบเมนู (คลิก)'}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Quick Subject Switcher Dropdown */}
        {subjectList.length > 0 && (
          <div className={`px-3 py-2.5 border-b border-slate-800 ${collapsed ? 'text-center' : ''}`}>
            {!collapsed ? (
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider px-1">
                  วิชาที่กำลังจัดการ:
                </div>
                <div className="relative">
                  <select
                    value={selectedSubjectId}
                    onChange={(e) => onSelectSubject(e.target.value)}
                    className="w-full pl-3 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs font-bold text-white outline-none focus:border-indigo-400 transition-colors appearance-none cursor-pointer"
                  >
                    {subjectList.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.icon || '📚'} {s.name} ({s.code}) - {s.gradeLevel}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div
                title={`วิชา: ${currentSubject?.name || ''}`}
                className="w-10 h-10 mx-auto rounded-xl bg-slate-950 border border-slate-700 flex items-center justify-center text-base"
              >
                {currentSubject?.icon || '📚'}
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu Items (Scrollable) */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-5 scrollbar-thin scrollbar-thumb-slate-800">
          {menuSections.map((sec, idx) => (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1">
                  {sec.title}
                </div>
              )}

              <div className="space-y-1">
                {sec.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeMenu === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => handleMenuClick(item.key)}
                      title={collapsed ? item.label : undefined}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative group ${
                        isActive
                          ? item.isHighlight
                            ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md shadow-amber-500/20'
                            : 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : item.isHighlight
                          ? 'text-amber-300 hover:text-amber-200 hover:bg-slate-800/80'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                      } ${collapsed ? 'justify-center px-2' : ''}`}
                    >
                      <Icon className={`w-4 h-4 shrink-0 ${isActive && item.isHighlight ? 'text-slate-950' : ''}`} />

                      {!collapsed && (
                        <span className="truncate flex-1 text-left">
                          {item.label}
                        </span>
                      )}

                      {!collapsed && item.badge && (
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-normal shrink-0 ${
                            isActive
                              ? 'bg-white/20 text-white'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar Footer: Sound Mute & Logout Button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {/* Sound Mute Button */}
          <button
            type="button"
            onClick={toggleSound}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors ${
              collapsed ? 'justify-center px-1' : ''
            }`}
            title={soundMuted ? 'เปิดเสียงเอฟเฟกต์' : 'ปิดเสียงเอฟเฟกต์'}
          >
            {soundMuted ? (
              <VolumeX className="w-4 h-4 text-rose-400 shrink-0" />
            ) : (
              <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            )}
            {!collapsed && (
              <span>{soundMuted ? 'เสียง: ปิดอยู่' : 'เสียง: เปิดอยู่'}</span>
            )}
          </button>

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-rose-900/30 transition-colors ${
              collapsed ? 'justify-center px-1' : ''
            }`}
            title="ออกจากระบบ / กลับสู่หน้าแรก"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            {!collapsed && <span>ออกจากระบบ</span>}
          </button>
        </div>
      </aside>
    </>
  );
};
