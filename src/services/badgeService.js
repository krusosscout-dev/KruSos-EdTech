// Digital Badges & Achievements Service (ระบบเหรียญเกียรติยศและตราความดี)

export const AVAILABLE_BADGES = [
  {
    id: 'on_time',
    name: 'ส่งงานตรงเวลาเป๊ะ',
    icon: '🌟',
    color: 'from-amber-400 to-yellow-500',
    borderColor: 'border-amber-400',
    description: 'มีความรับผิดชอบ ส่งงานและภารกิจครบตรงตามกำหนดเวลาทุกครั้ง'
  },
  {
    id: 'helping_hand',
    name: 'จิตสาธารณะ & ช่วยเหลืองานห้อง',
    icon: '🤝',
    color: 'from-emerald-400 to-teal-500',
    borderColor: 'border-emerald-400',
    description: 'มีน้ำใจ เสียสละ ช่วยเหลือเพื่อนและคุณครูด้วยความเต็มใจ'
  },
  {
    id: 'creative_thinker',
    name: 'นักคิดสร้างสรรค์ & มีตรรกะ',
    icon: '🧠',
    color: 'from-purple-400 to-indigo-500',
    borderColor: 'border-purple-400',
    description: 'มีกระบวนการคิดแก้ปัญหาที่โดดเด่น สร้างสรรค์ และมีเหตุผล'
  },
  {
    id: 'top_performer',
    name: 'ท็อปฟอร์มคะแนนยอดเยี่ยม',
    icon: '👑',
    color: 'from-rose-400 to-pink-500',
    borderColor: 'border-rose-400',
    description: 'มุ่งมั่นในการเรียน ทำคะแนนสอบและชิ้นงานได้คะแนนระดับแนวหน้า'
  },
  {
    id: 'knowledge_seeker',
    name: 'รักการอ่าน & ค้นคว้า',
    icon: '📖',
    color: 'from-cyan-400 to-blue-500',
    borderColor: 'border-cyan-400',
    description: 'กระตือรือร้นในการแสวงหาความรู้ใหม่ ๆ รอบตัวอยู่เสมอ'
  },
  {
    id: 'discipline_star',
    name: 'ผู้นำวินัยยอดเยี่ยม',
    icon: '🛡️',
    color: 'from-amber-500 to-orange-600',
    borderColor: 'border-orange-400',
    description: 'ปฏิบัติตามกฎกติกาห้องเรียนอย่างเคร่งครัด เป็นแบบอย่างที่ดี'
  },
  {
    id: 'active_voice',
    name: 'กล้าแสดงออก & มีส่วนร่วม',
    icon: '🙋',
    color: 'from-lime-400 to-emerald-500',
    borderColor: 'border-lime-400',
    description: 'กล้าตอบคำถาม กล้าแสดงความคิดเห็นสร้างสรรค์ในชั้นเรียน'
  }
];

export class BadgeService {
  // Get all badges awarded to a student in a subject
  static getStudentBadges(subject, studentId) {
    if (!subject || !studentId) return [];
    const rawBadges = subject.studentBadges?.[studentId] || [];
    return AVAILABLE_BADGES.filter((b) => rawBadges.includes(b.id));
  }

  // Toggle award/revoke a badge for a student in a subject
  static toggleBadge(subject, studentId, badgeId) {
    if (!subject || !studentId) return subject;

    const currentBadges = subject.studentBadges?.[studentId] || [];
    const exists = currentBadges.includes(badgeId);

    const updatedStudentBadges = exists
      ? currentBadges.filter((id) => id !== badgeId)
      : [...currentBadges, badgeId];

    return {
      ...subject,
      studentBadges: {
        ...(subject.studentBadges || {}),
        [studentId]: updatedStudentBadges
      }
    };
  }
}
