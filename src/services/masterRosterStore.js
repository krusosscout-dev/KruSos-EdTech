// Centralized Master Student Roster Store (ทะเบียนนักเรียนแยกตามระดับชั้น)
import { createFullMockSubjects } from './mockData';

const STORAGE_KEY = 'kru_sauce_master_rosters_v1';

// Generate smart, memorable 5-digit student access code based on grade & student number
export const generateAutoStudentCode = (gradeLevel = '', studentNumber = 1) => {
  const num = parseInt(studentNumber, 10) || 1;
  const numPadded = String(num).padStart(2, '0');

  // Match e.g. "ป.6/1" or "ประถมศึกษาปีที่ 6/1"
  const slashMatch = String(gradeLevel).match(/(?:ป\.|ชั้นประถมศึกษาปีที่\s*|ม\.|ชั้นมัธยมศึกษาปีที่\s*)?(\d+)\s*\/\s*(\d+)/i);
  if (slashMatch) {
    const g = slashMatch[1]; // e.g. 6
    const r = slashMatch[2]; // e.g. 1
    return `${g}${String(r).padStart(2, '0')}${numPadded}`; // e.g. 60101
  }

  // Match e.g. "ป.6" or "ชั้นประถมศึกษาปีที่ 6"
  const singleMatch = String(gradeLevel).match(/(\d+)/);
  if (singleMatch) {
    const g = singleMatch[1];
    return `10${g}${numPadded}`; // e.g. 10601, 10501
  }

  // Fallback 5-digit: 26000 + num
  return `26${String(num).padStart(3, '0')}`;
};

export class MasterRosterStore {
  static getMasterRosters() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage master rosters:', e);
    }

    // Default Seed from Mock Data
    const seed = this.createDefaultSeed();
    this.saveMasterRosters(seed);
    return seed;
  }

  static createDefaultSeed() {
    // 15 Students for ป.5/1
    const stdsP5 = [
      { id: 'std_p5_1', studentNumber: 1, studentCode: '10501', title: 'ด.ช.', name: 'กิตติศักดิ์ ใจดี', gender: 'ช' },
      { id: 'std_p5_2', studentNumber: 2, studentCode: '10502', title: 'ด.ช.', name: 'ณัฐวุฒิ รักเรียน', gender: 'ช' },
      { id: 'std_p5_3', studentNumber: 3, studentCode: '10503', title: 'ด.ญ.', name: 'พิชญา ปัญญาดี', gender: 'ญ' },
      { id: 'std_p5_4', studentNumber: 4, studentCode: '10504', title: 'ด.ญ.', name: 'สุพรรษา มีสุข', gender: 'ญ' },
      { id: 'std_p5_5', studentNumber: 5, studentCode: '10505', title: 'ด.ช.', name: 'อัครพล สมบูรณ์', gender: 'ช' },
      { id: 'std_p5_6', studentNumber: 6, studentCode: '10506', title: 'ด.ญ.', name: 'กนกวรรณ จันทร์เพ็ญ', gender: 'ญ' },
      { id: 'std_p5_7', studentNumber: 7, studentCode: '10507', title: 'ด.ช.', name: 'ชินวัตร วิทยา', gender: 'ช' },
      { id: 'std_p5_8', studentNumber: 8, studentCode: '10508', title: 'ด.ช.', name: 'ธนกฤต มั่งคั่ง', gender: 'ช' },
      { id: 'std_p5_9', studentNumber: 9, studentCode: '10509', title: 'ด.ญ.', name: 'นภัสสร รุ่งเรือง', gender: 'ญ' },
      { id: 'std_p5_10', studentNumber: 10, studentCode: '10510', title: 'ด.ช.', name: 'ภาณุวิชญ์ พงษ์ไพร', gender: 'ช' },
      { id: 'std_p5_11', studentNumber: 11, studentCode: '10511', title: 'ด.ช.', name: 'วรเมธ สุขเกษม', gender: 'ช' },
      { id: 'std_p5_12', studentNumber: 12, studentCode: '10512', title: 'ด.ญ.', name: 'ศิริพร บุญรอด', gender: 'ญ' },
      { id: 'std_p5_13', studentNumber: 13, studentCode: '10513', title: 'ด.ช.', name: 'อนันดา ศรีสวัสดิ์', gender: 'ช' },
      { id: 'std_p5_14', studentNumber: 14, studentCode: '10514', title: 'ด.ญ.', name: 'อรัญญา แก้วมณี', gender: 'ญ' },
      { id: 'std_p5_15', studentNumber: 15, studentCode: '10515', title: 'ด.ช.', name: 'เอกราช ชัยชนะ', gender: 'ช' }
    ];

    // 15 Students for ป.6/1
    const stdsP6 = [
      { id: 'std_p6_1', studentNumber: 1, studentCode: '10601', title: 'ด.ช.', name: 'กฤติน ชูเกียรติ', gender: 'ช' },
      { id: 'std_p6_2', studentNumber: 2, studentCode: '10602', title: 'ด.ช.', name: 'ขจรศักดิ์ ยิ่งยง', gender: 'ช' },
      { id: 'std_p6_3', studentNumber: 3, studentCode: '10603', title: 'ด.ญ.', name: 'จิราพร วงศ์สว่าง', gender: 'ญ' },
      { id: 'std_p6_4', studentNumber: 4, studentCode: '10604', title: 'ด.ญ.', name: 'ชนากานต์ ทรัพย์เจริญ', gender: 'ญ' },
      { id: 'std_p6_5', studentNumber: 5, studentCode: '10605', title: 'ด.ช.', name: 'ชลธี สายธาร', gender: 'ช' },
      { id: 'std_p6_6', studentNumber: 6, studentCode: '10606', title: 'ด.ญ.', name: 'ฐิติมา บุญญานุภาพ', gender: 'ญ' },
      { id: 'std_p6_7', studentNumber: 7, studentCode: '10607', title: 'ด.ช.', name: 'ทศพล มั่นคง', gender: 'ช' },
      { id: 'std_p6_8', studentNumber: 8, studentCode: '10608', title: 'ด.ช.', name: 'ธีรดนย์ รัตนโชติ', gender: 'ช' },
      { id: 'std_p6_9', studentNumber: 9, studentCode: '10609', title: 'ด.ญ.', name: 'เบญจวรรณ พานิชย์', gender: 'ญ' },
      { id: 'std_p6_10', studentNumber: 10, studentCode: '10610', title: 'ด.ช.', name: 'ปภังกร เลิศล้ำ', gender: 'ช' },
      { id: 'std_p6_11', studentNumber: 11, studentCode: '10611', title: 'ด.ช.', name: 'พงศกร ธนะพัฒน์', gender: 'ช' },
      { id: 'std_p6_12', studentNumber: 12, studentCode: '10612', title: 'ด.ญ.', name: 'รัชดาภรณ์ สดใส', gender: 'ญ' },
      { id: 'std_p6_13', studentNumber: 13, studentCode: '10613', title: 'ด.ช.', name: 'วชิรวิทย์ ฉัตรแก้ว', gender: 'ช' },
      { id: 'std_p6_14', studentNumber: 14, studentCode: '10614', title: 'ด.ญ.', name: 'ศศิวิมล แสงสุริยัน', gender: 'ญ' },
      { id: 'std_p6_15', studentNumber: 15, studentCode: '10615', title: 'ด.ช.', name: 'อิทธิพล บูรณเกียรติ', gender: 'ช' }
    ];

    return {
      'ชั้นประถมศึกษาปีที่ 1': [],
      'ชั้นประถมศึกษาปีที่ 2': [],
      'ชั้นประถมศึกษาปีที่ 3': [],
      'ชั้นประถมศึกษาปีที่ 4': [],
      'ชั้นประถมศึกษาปีที่ 5/1': stdsP5,
      'ชั้นประถมศึกษาปีที่ 6/1': stdsP6
    };
  }

  static saveMasterRosters(rosters) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(rosters));
    } catch (e) {
      console.error('Error saving master rosters to localStorage:', e);
    }
  }

  static getGradeLevels() {
    const all = this.getMasterRosters();
    return Object.keys(all);
  }

  static getStudentsByGrade(gradeLevel) {
    const all = this.getMasterRosters();
    return all[gradeLevel] || [];
  }

  static addGradeLevel(gradeLevel) {
    const clean = gradeLevel.trim();
    if (!clean) return false;
    const all = this.getMasterRosters();
    if (!all[clean]) {
      all[clean] = [];
      this.saveMasterRosters(all);
    }
    return true;
  }

  static deleteGradeLevel(gradeLevel) {
    const all = this.getMasterRosters();
    if (all[gradeLevel]) {
      delete all[gradeLevel];
      this.saveMasterRosters(all);
      return true;
    }
    return false;
  }

  static renameGradeLevel(oldGrade, newGrade) {
    const clean = newGrade.trim();
    if (!clean || clean === oldGrade) return false;
    const all = this.getMasterRosters();
    if (all[oldGrade]) {
      all[clean] = all[oldGrade];
      delete all[oldGrade];
      this.saveMasterRosters(all);
      return true;
    }
    return false;
  }

  // Add single student - guarantees automatic code generation!
  static addStudentToGrade(gradeLevel, studentData) {
    const all = this.getMasterRosters();
    if (!all[gradeLevel]) all[gradeLevel] = [];

    const existingList = all[gradeLevel];
    const sNumber = parseInt(studentData.studentNumber, 10) || (existingList.length + 1);

    // Auto-generate code if empty
    const sCode = (studentData.studentCode && String(studentData.studentCode).trim())
      ? String(studentData.studentCode).trim()
      : generateAutoStudentCode(gradeLevel, sNumber);

    const newStudent = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentNumber: sNumber,
      studentCode: sCode,
      title: studentData.title || 'ด.ช.',
      name: studentData.name.trim(),
      gender: studentData.gender || (studentData.title?.includes('ญ') ? 'ญ' : 'ช')
    };

    all[gradeLevel].push(newStudent);
    all[gradeLevel].sort((a, b) => a.studentNumber - b.studentNumber);
    this.saveMasterRosters(all);
    return newStudent;
  }

  // Update single student
  static updateStudentInGrade(gradeLevel, studentId, updates) {
    const all = this.getMasterRosters();
    if (!all[gradeLevel]) return false;

    all[gradeLevel] = all[gradeLevel].map((s) => {
      if (s.id === studentId) {
        const sNumber = updates.studentNumber !== undefined ? (parseInt(updates.studentNumber, 10) || s.studentNumber) : s.studentNumber;
        const sCode = (updates.studentCode !== undefined && String(updates.studentCode).trim())
          ? String(updates.studentCode).trim()
          : (s.studentCode || generateAutoStudentCode(gradeLevel, sNumber));

        return {
          ...s,
          ...updates,
          studentNumber: sNumber,
          studentCode: sCode
        };
      }
      return s;
    });

    all[gradeLevel].sort((a, b) => a.studentNumber - b.studentNumber);
    this.saveMasterRosters(all);
    return true;
  }

  // Delete student
  static deleteStudentFromGrade(gradeLevel, studentId) {
    const all = this.getMasterRosters();
    if (!all[gradeLevel]) return false;

    all[gradeLevel] = all[gradeLevel].filter((s) => s.id !== studentId);
    this.saveMasterRosters(all);
    return true;
  }

  // Import batch of students (e.g. from Excel) - auto-assigns codes to everyone!
  static importStudentsToGrade(gradeLevel, parsedStudents = [], replace = false) {
    const all = this.getMasterRosters();
    if (!all[gradeLevel]) all[gradeLevel] = [];

    const existingList = replace ? [] : all[gradeLevel];
    const existingMaxNo = existingList.reduce((max, s) => Math.max(max, s.studentNumber || 0), 0);

    const prepared = parsedStudents.map((s, idx) => {
      const sNumber = s.studentNumber ? parseInt(s.studentNumber, 10) : (existingMaxNo + idx + 1);
      const sCode = (s.studentCode && String(s.studentCode).trim())
        ? String(s.studentCode).trim()
        : generateAutoStudentCode(gradeLevel, sNumber);

      return {
        id: s.id || `std_${Date.now()}_${idx}_${Math.random().toString(36).substring(2, 6)}`,
        studentNumber: sNumber,
        studentCode: sCode,
        title: s.title || 'ด.ช.',
        name: (s.name || '').trim(),
        gender: s.gender || (s.title?.includes('ญ') ? 'ญ' : 'ช')
      };
    });

    all[gradeLevel] = replace ? prepared : [...existingList, ...prepared];
    all[gradeLevel].sort((a, b) => a.studentNumber - b.studentNumber);
    this.saveMasterRosters(all);
    return all[gradeLevel];
  }

  // Regenerate codes for all students in a grade
  static regenerateCodesForGrade(gradeLevel) {
    const all = this.getMasterRosters();
    if (!all[gradeLevel]) return false;

    all[gradeLevel] = all[gradeLevel].map((s, idx) => {
      const sNumber = s.studentNumber || (idx + 1);
      return {
        ...s,
        studentCode: generateAutoStudentCode(gradeLevel, sNumber)
      };
    });

    this.saveMasterRosters(all);
    return all[gradeLevel];
  }
}
