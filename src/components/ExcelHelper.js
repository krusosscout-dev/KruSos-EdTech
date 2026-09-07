import * as XLSX from 'xlsx';

// Parse uploaded Excel or CSV file into student array
export const parseStudentExcel = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const json = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (!json || json.length === 0) {
          throw new Error('ไม่พบข้อมูลในไฟล์ Excel');
        }

        // Map columns flexibly (support Thai and English headers)
        const students = json.map((row, index) => {
          const studentNumber =
            row['เลขที่'] || row['ลำดับ'] || row['No'] || row['no'] || row['number'] || (index + 1);
          const studentCode =
            row['รหัสนักเรียน'] || row['รหัสประจำตัว'] || row['รหัส'] || row['StudentID'] || row['id'] || '';
          const title =
            row['คำนำหน้า'] || row['คำนำหน้านาม'] || row['Title'] || '';
          const fullName =
            row['ชื่อ-นามสกุล'] || row['ชื่อ - นามสกุล'] || row['ชื่อ นามสกุล'] || row['ชื่อสกุล'] || row['Name'] || '';
          const firstName = row['ชื่อ'] || '';
          const lastName = row['นามสกุล'] || '';
          const gender =
            row['เพศ'] || row['Gender'] || (title.includes('หญิง') || title.includes('ญ') ? 'ญ' : 'ช');

          let resolvedName = fullName.trim();
          if (!resolvedName && firstName) {
            resolvedName = `${firstName.trim()} ${lastName.trim()}`.trim();
          }

          return {
            id: `std_${Date.now()}_${index}_${Math.random().toString(36).substring(2, 6)}`,
            studentNumber: parseInt(studentNumber, 10) || (index + 1),
            studentCode: String(studentCode).trim(),
            title: title.trim(),
            name: resolvedName || `นักเรียนคนที่ ${index + 1}`,
            gender: gender.trim() || 'ช'
          };
        });

        // Sort by student number ascending
        students.sort((a, b) => a.studentNumber - b.studentNumber);
        resolve(students);
      } catch (err) {
        reject(new Error(`เกิดข้อผิดพลาดในการอ่านไฟล์ Excel: ${err.message}`));
      }
    };

    reader.onerror = (error) => reject(error);
    reader.readAsArrayBuffer(file);
  });
};

// Download Excel Template for Teachers to fill student names
export const downloadStudentTemplate = () => {
  const sampleData = [
    { 'เลขที่': 1, 'รหัสนักเรียน': '10001', 'คำนำหน้า': 'ด.ช.', 'ชื่อ': 'กิตติศักดิ์', 'นามสกุล': 'ใจดี', 'เพศ': 'ช' },
    { 'เลขที่': 2, 'รหัสนักเรียน': '10002', 'คำนำหน้า': 'ด.ช.', 'ชื่อ': 'ณัฐวุฒิ', 'นามสกุล': 'รักเรียน', 'เพศ': 'ช' },
    { 'เลขที่': 3, 'รหัสนักเรียน': '10003', 'คำนำหน้า': 'ด.ญ.', 'ชื่อ': 'พิชญา', 'นามสกุล': 'ปัญญาดี', 'เพศ': 'ญ' },
    { 'เลขที่': 4, 'รหัสนักเรียน': '10004', 'คำนำหน้า': 'ด.ญ.', 'ชื่อ': 'สุพรรษา', 'นามสกุล': 'มีสุข', 'เพศ': 'ญ' },
    { 'เลขที่': 5, 'รหัสนักเรียน': '10005', 'คำนำหน้า': 'ด.ช.', 'ชื่อ': 'อัครพล', 'นามสกุล': 'สมบูรณ์', 'เพศ': 'ช' }
  ];

  const ws = XLSX.utils.json_to_sheet(sampleData);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายชื่อนักเรียน');

  XLSX.writeFile(wb, 'ตัวอย่างไฟล์นำเข้ารายชื่อนักเรียน_ครูซอส.xlsx');
};

// Calculate Thai Grade (0, 1, 1.5, 2, 2.5, 3, 3.5, 4)
export const calculateGrade = (score, maxScore = 100) => {
  if (maxScore <= 0) return '0';
  const pct = (score / maxScore) * 100;
  if (pct >= 80) return '4';
  if (pct >= 75) return '3.5';
  if (pct >= 70) return '3';
  if (pct >= 65) return '2.5';
  if (pct >= 60) return '2';
  if (pct >= 55) return '1.5';
  if (pct >= 50) return '1';
  return '0';
};

// Export Comprehensive Multi-Sheet Gradebook Excel
export const exportComprehensiveExcel = (subject) => {
  const wb = XLSX.utils.book_new();
  const { students = [], assignments = [], scores = {}, attendance = [], assessments = {} } = subject;

  // Total possible max score
  const totalMaxScore = assignments.reduce((acc, a) => acc + (parseFloat(a.maxScore) || 0), 0);

  // Sheet 1: สมุดคะแนนเก็บ (Gradebook)
  const gradebookRows = students.map((std) => {
    let rowTotal = 0;
    const row = {
      'เลขที่': std.studentNumber,
      'รหัสนักเรียน': std.studentCode || '-',
      'ชื่อ-นามสกุล': `${std.title || ''}${std.name}`
    };

    assignments.forEach((a) => {
      const s = scores[std.id]?.[a.id];
      const val = s !== undefined && s !== '' ? parseFloat(s) : 0;
      rowTotal += val;
      row[`${a.title} (${a.maxScore} คะแนน)`] = s !== undefined && s !== '' ? val : '-';
    });

    row['คะแนนรวม'] = rowTotal;
    row['คะแนนเต็ม'] = totalMaxScore;
    row['ร้อยละ'] = totalMaxScore > 0 ? ((rowTotal / totalMaxScore) * 100).toFixed(1) + '%' : '0%';
    row['ผลการเรียน (เกรด)'] = calculateGrade(rowTotal, totalMaxScore);

    return row;
  });

  const ws1 = XLSX.utils.json_to_sheet(gradebookRows);
  XLSX.utils.book_append_sheet(wb, ws1, 'คะแนนเก็บและเกรด');

  // Sheet 2: การเข้าเรียน & คะแนนรายคาบ (Attendance)
  const attendanceRows = students.map((std) => {
    let presentCount = 0;
    let totalSessions = attendance.length;
    let totalBonusPoints = 0;

    attendance.forEach((session) => {
      const rec = session.records?.[std.id];
      if (rec?.status === 'present') presentCount++;
      totalBonusPoints += (parseFloat(rec?.periodBonusPoints) || 0);
    });

    const pct = totalSessions > 0 ? ((presentCount / totalSessions) * 100).toFixed(1) : '100';

    return {
      'เลขที่': std.studentNumber,
      'ชื่อ-นามสกุล': `${std.title || ''}${std.name}`,
      'จำนวนคาบทั้งหมด': totalSessions,
      'มาเรียน (คาบ)': presentCount,
      'ร้อยละเวลาเรียน': `${pct}%`,
      'สิทธิ์สอบ (>=80%)': parseFloat(pct) >= 80 ? 'มีสิทธิ์' : 'มส.',
      'คะแนนจิตพิสัย/แต้มรายคาบสะสม': totalBonusPoints
    };
  });

  const ws2 = XLSX.utils.json_to_sheet(attendanceRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'การเข้าเรียนและคะแนนรายคาบ');

  // Sheet 3: คุณลักษณะอันพึงประสงค์ (8 ข้อ)
  const char8Names = [
    '1.รักชาติ ศาสน์ กษัตริย์',
    '2.ซื่อสัตย์สุจริต',
    '3.มีวินัย',
    '4.ใฝ่เรียนรู้',
    '5.อยู่อย่างพอเพียง',
    '6.มุ่งมั่นในการทำงาน',
    '7.รักความเป็นไทย',
    '8.มีจิตสาธารณะ'
  ];

  const charRows = students.map((std) => {
    const stdChars = assessments.characteristics?.[std.id] || {};
    const row = {
      'เลขที่': std.studentNumber,
      'ชื่อ-นามสกุล': `${std.title || ''}${std.name}`
    };

    let sum = 0;
    char8Names.forEach((item, idx) => {
      const val = stdChars[idx + 1] !== undefined ? stdChars[idx + 1] : 3;
      sum += parseInt(val, 10);
      row[item] = val;
    });

    const avg = (sum / 8);
    row['สรุปผลการประเมิน'] = avg >= 2.5 ? 'ดีเยี่ยม (3)' : avg >= 1.5 ? 'ดี (2)' : avg >= 1.0 ? 'ผ่าน (1)' : 'ไม่ผ่าน (0)';
    return row;
  });

  const ws3 = XLSX.utils.json_to_sheet(charRows);
  XLSX.utils.book_append_sheet(wb, ws3, 'คุณลักษณะอันพึงประสงค์');

  // Sheet 4: สมรรถนะสำคัญ 5 ด้าน
  const comp5Names = [
    '1.ความสามารถในการสื่อสาร',
    '2.ความสามารถในการคิด',
    '3.ความสามารถในการแก้ปัญหา',
    '4.ความสามารถในการใช้ทักษะชีวิต',
    '5.ความสามารถในการใช้เทคโนโลยี'
  ];

  const compRows = students.map((std) => {
    const stdComps = assessments.competencies?.[std.id] || {};
    const row = {
      'เลขที่': std.studentNumber,
      'ชื่อ-นามสกุล': `${std.title || ''}${std.name}`
    };

    let sum = 0;
    comp5Names.forEach((item, idx) => {
      const val = stdComps[idx + 1] !== undefined ? stdComps[idx + 1] : 3;
      sum += parseInt(val, 10);
      row[item] = val;
    });

    const avg = (sum / 5);
    row['สรุปผลการประเมิน'] = avg >= 2.5 ? 'ดีเยี่ยม (3)' : avg >= 1.5 ? 'ดี (2)' : avg >= 1.0 ? 'ผ่าน (1)' : 'ไม่ผ่าน (0)';
    return row;
  });

  const ws4 = XLSX.utils.json_to_sheet(compRows);
  XLSX.utils.book_append_sheet(wb, ws4, 'สมรรถนะสำคัญ 5 ด้าน');

  // Sheet 5: การอ่าน คิดวิเคราะห์ และเขียน
  const readRows = students.map((std) => {
    const rating = assessments.readingAnalysis?.[std.id] !== undefined ? assessments.readingAnalysis[std.id] : 3;
    const ratingText = rating === 3 ? 'ดีเยี่ยม (3)' : rating === 2 ? 'ดี (2)' : rating === 1 ? 'ผ่าน (1)' : 'ไม่ผ่าน (0)';
    return {
      'เลขที่': std.studentNumber,
      'ชื่อ-นามสกุล': `${std.title || ''}${std.name}`,
      'ระดับผลการประเมิน (0-3)': rating,
      'สรุปผล': ratingText
    };
  });

  const ws5 = XLSX.utils.json_to_sheet(readRows);
  XLSX.utils.book_append_sheet(wb, ws5, 'การอ่านคิดวิเคราะห์และเขียน');

  // Download
  const filename = `ปพ5_สรุปผลการเรียน_${subject.code || 'วิชา'}_${subject.name || ''}_2569.xlsx`;
  XLSX.writeFile(wb, filename);
};
