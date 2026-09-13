import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createFullMockSubjects } from '../src/services/mockData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.join(__dirname, '../data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const initialData = {
  subjects: createFullMockSubjects(),
  rooms: {},
  groups: {},
  transactions: [],
  usedTokens: {}
};

class LocalDB {
  constructor() {
    this.data = initialData;

    this.load();
  }

  load() {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        this.data = {
          ...initialData,
          ...parsed,
          subjects: parsed.subjects && Object.keys(parsed.subjects).length > 0 ? parsed.subjects : initialData.subjects
        };
      } else {
        this.save();
      }
    } catch (err) {
      console.error('[DB] Error loading, reset to initial:', err);
      this.data = initialData;
      this.save();
    }
  }

  save() {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
    } catch (err) {
      console.error('[DB] Save error:', err);
    }
  }

  // --- SUBJECT MANAGEMENT ---
  getSubjects() {
    return this.data.subjects || {};
  }

  resetMockData() {
    this.data.subjects = createFullMockSubjects();
    this.save();
    return this.data.subjects;
  }

  getSubject(id) {
    if (!id) return null;
    return this.data.subjects?.[id] || null;
  }

  createSubject({ code, name, gradeLevel, academicYear, semester, color, icon }) {
    const id = `SUBJ_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSubj = {
      id,
      code: (code || 'ว10000').trim().toUpperCase(),
      name: (name || 'วิชาใหม่').trim(),
      gradeLevel: (gradeLevel || 'ประถมศึกษาปีที่ 5').trim(),
      academicYear: academicYear || '2569',
      semester: semester || '1',
      color: color || '#6366f1',
      icon: icon || '📘',
      students: [],
      assignments: [],
      scores: {},
      attendance: [],
      assessments: {
        characteristics: {},
        competencies: {},
        readingAnalysis: {}
      },
      createdAt: new Date().toISOString()
    };

    if (!this.data.subjects) this.data.subjects = {};
    this.data.subjects[id] = newSubj;
    this.save();
    return newSubj;
  }

  updateSubject(id, updates) {
    const subj = this.getSubject(id);
    if (!subj) return null;
    Object.assign(subj, updates);
    this.save();
    return subj;
  }

  deleteSubject(id) {
    if (this.data.subjects?.[id]) {
      delete this.data.subjects[id];
      this.save();
      return true;
    }
    return false;
  }

  // --- STUDENT ROSTER MANAGEMENT (Requirement 6) ---
  updateStudents(subjectId, students) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    subj.students = students;
    this.save();
    return subj;
  }

  addStudent(subjectId, studentData) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    const newStudent = {
      id: `std_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      studentNumber: parseInt(studentData.studentNumber, 10) || (subj.students.length + 1),
      studentCode: String(studentData.studentCode || '').trim(),
      title: (studentData.title || 'ด.ช.').trim(),
      name: (studentData.name || '').trim(),
      gender: studentData.gender || 'ช'
    };
    subj.students.push(newStudent);
    subj.students.sort((a, b) => a.studentNumber - b.studentNumber);
    this.save();
    return { subject: subj, student: newStudent };
  }

  deleteStudent(subjectId, studentId) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    subj.students = subj.students.filter(s => s.id !== studentId);
    // Delete student scores
    if (subj.scores?.[studentId]) delete subj.scores[studentId];
    if (subj.assessments?.characteristics?.[studentId]) delete subj.assessments.characteristics[studentId];
    if (subj.assessments?.competencies?.[studentId]) delete subj.assessments.competencies[studentId];
    if (subj.assessments?.readingAnalysis?.[studentId]) delete subj.assessments.readingAnalysis[studentId];
    this.save();
    return subj;
  }

  // --- ASSIGNMENTS MANAGEMENT (Requirement 2) ---
  addAssignment(subjectId, assignmentData) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    const newAsg = {
      id: `asg_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      title: assignmentData.title.trim(),
      category: assignmentData.category || 'ใบงาน',
      maxScore: parseFloat(assignmentData.maxScore) || 10,
      date: assignmentData.date || new Date().toISOString().slice(0, 10),
      description: (assignmentData.description || '').trim()
    };
    if (!subj.assignments) subj.assignments = [];
    subj.assignments.push(newAsg);
    this.save();
    return { subject: subj, assignment: newAsg };
  }

  updateAssignment(subjectId, assignmentId, updates) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    const asg = subj.assignments?.find(a => a.id === assignmentId);
    if (!asg) return null;
    Object.assign(asg, updates);
    this.save();
    return subj;
  }

  deleteAssignment(subjectId, assignmentId) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    subj.assignments = subj.assignments.filter(a => a.id !== assignmentId);
    // Clean scores for this assignment
    if (subj.scores) {
      Object.keys(subj.scores).forEach(stdId => {
        if (subj.scores[stdId]?.[assignmentId] !== undefined) {
          delete subj.scores[stdId][assignmentId];
        }
      });
    }
    this.save();
    return subj;
  }

  // --- SCORE ENTRY (Requirement 1) ---
  updateScore(subjectId, studentId, assignmentId, score) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    if (!subj.scores) subj.scores = {};
    if (!subj.scores[studentId]) subj.scores[studentId] = {};
    subj.scores[studentId][assignmentId] = score;
    this.save();
    return subj;
  }

  // --- ATTENDANCE & PERIOD ENGAGEMENT POINTS (Requirement 5) ---
  saveAttendanceSession(subjectId, sessionData) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    if (!subj.attendance) subj.attendance = [];

    const existingIdx = subj.attendance.findIndex(s => s.id === sessionData.id);
    if (existingIdx >= 0) {
      subj.attendance[existingIdx] = sessionData;
    } else {
      subj.attendance.push({
        id: sessionData.id || `att_${Date.now()}`,
        date: sessionData.date || new Date().toISOString().slice(0, 10),
        period: sessionData.period || 'คาบเรียน',
        records: sessionData.records || {}
      });
    }
    this.save();
    return subj;
  }

  // --- ASSESSMENTS (Requirement 3: Characteristics, Competencies, Reading & Writing) ---
  saveAssessments(subjectId, { type, data }) {
    const subj = this.getSubject(subjectId);
    if (!subj) return null;
    if (!subj.assessments) {
      subj.assessments = { characteristics: {}, competencies: {}, readingAnalysis: {} };
    }
    if (type === 'characteristics') subj.assessments.characteristics = data;
    if (type === 'competencies') subj.assessments.competencies = data;
    if (type === 'readingAnalysis') subj.assessments.readingAnalysis = data;
    this.save();
    return subj;
  }

  // Legacy room support if needed
  createRoom(data) {
    const roomId = data.code.toUpperCase();
    const room = { id: roomId, code: roomId, title: data.title || `ห้อง ${roomId}`, status: 'active', missions: data.missions || [] };
    this.data.rooms[roomId] = room;
    this.save();
    return room;
  }
  getRoom(roomId) { return this.data.rooms?.[roomId?.toUpperCase()] || null; }
  getGroupsByRoom(roomId) { return Object.values(this.data.groups || {}).filter(g => g.roomId === roomId?.toUpperCase()); }
  getTransactionsByRoom(roomId) { return (this.data.transactions || []).filter(t => t.roomId === roomId?.toUpperCase()); }
}

export const db = new LocalDB();
