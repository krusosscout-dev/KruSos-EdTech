import { createFullMockSubjects } from './mockData';

// Client-side Reactive Subject Store with LocalStorage & Server Sync
const STORAGE_KEY = 'kru_sauce_subjects_store_v3';

export class SubjectStore {
  static getSubjects() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Object.keys(parsed).length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Error reading localStorage subject store:', e);
    }
    const init = createFullMockSubjects();
    this.saveSubjects(init);
    return init;
  }

  static resetToMockData() {
    const mock = createFullMockSubjects();
    this.saveSubjects(mock);
    return mock;
  }


  static saveSubjects(subjects) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(subjects));
    } catch (e) {
      console.error('Error saving localStorage subject store:', e);
    }
  }

  static getSubject(id) {
    const all = this.getSubjects();
    return all[id] || null;
  }

  static saveSubject(subject) {
    const all = this.getSubjects();
    all[subject.id] = subject;
    this.saveSubjects(all);
    return subject;
  }

  static createSubject({ code, name, gradeLevel, academicYear, semester, color, icon }) {
    const id = `SUBJ_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const newSubject = {
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

    const all = this.getSubjects();
    all[id] = newSubject;
    this.saveSubjects(all);
    return newSubject;
  }

  static deleteSubject(id) {
    const all = this.getSubjects();
    if (all[id]) {
      delete all[id];
      this.saveSubjects(all);
      return true;
    }
    return false;
  }
}
