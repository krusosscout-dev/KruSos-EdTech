// Rich Mock Dataset for ครูซอส / โรงเรียนวัดบางปูน (ปีการศึกษา 2569)

export const createFullMockSubjects = () => {
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

  const buildAssessments = (students) => {
    const characteristics = {};
    const competencies = {};
    const readingAnalysis = {};

    students.forEach((s, idx) => {
      const scoreBase = idx % 5 === 4 ? 2 : 3;
      characteristics[s.id] = {
        1: 3, 2: 3, 3: scoreBase, 4: 3, 5: 3, 6: scoreBase, 7: 3, 8: 3
      };
      competencies[s.id] = {
        1: 3, 2: scoreBase, 3: 3, 4: 3, 5: 3
      };
      readingAnalysis[s.id] = scoreBase;
    });

    return { characteristics, competencies, readingAnalysis };
  };

  // 1. วิทยาการคำนวณ ป.5/1 (100 คะแนนเต็ม)
  const compAssignments = [
    { id: 'asg_c1', title: 'ใบงานที่ 1: การเขียนผังงานแก้ปัญหา (Flowchart)', category: 'ใบงาน', maxScore: 10, date: '2026-08-10', description: 'เขียนผังงานอธิบายขั้นตอนการแก้ปัญหาในชีวิตประจำวัน' },
    { id: 'asg_c2', title: 'ใบงานที่ 2: การเขียนโปรแกรม Scratch เบื้องต้น', category: 'ชิ้นงาน', maxScore: 20, date: '2026-08-20', description: 'สร้างการเคลื่อนที่และบทสนทนาตัวละครในโปรแกรม Scratch' },
    { id: 'asg_c3', title: 'สอบย่อยกลางภาค: การใช้เหตุผลเชิงตรรกะ', category: 'สอบย่อย', maxScore: 15, date: '2026-08-30', description: 'แบบทดสอบออนไลน์การคิดแก้ปัญหาแบบมีตรรกะ 20 ข้อ' },
    { id: 'asg_c4', title: 'โครงงาน Scratch: สร้างเกมนิทานฝึกคิด', category: 'โครงงาน', maxScore: 25, date: '2026-09-02', description: 'ชิ้นงานเกมตอบคำถามสร้างสรรค์ด้วยคำสั่งบล็อกเงื่อนไข if-else' },
    { id: 'asg_c5', title: 'แบบทดสอบวัดผลสัมฤทธิ์ปลายภาคเรียน', category: 'สอบปลายภาค', maxScore: 30, date: '2026-09-05', description: 'การวัดผลประเมินผลปลายภาคเรียนที่ 1 ปีการศึกษา 2569' }
  ];

  const compScores = {
    'std_p5_1': { 'asg_c1': 9, 'asg_c2': 18, 'asg_c3': 14, 'asg_c4': 23, 'asg_c5': 27 },
    'std_p5_2': { 'asg_c1': 10, 'asg_c2': 19, 'asg_c3': 15, 'asg_c4': 24, 'asg_c5': 28 },
    'std_p5_3': { 'asg_c1': 10, 'asg_c2': 20, 'asg_c3': 15, 'asg_c4': 25, 'asg_c5': 29 },
    'std_p5_4': { 'asg_c1': 8, 'asg_c2': 17, 'asg_c3': 12, 'asg_c4': 21, 'asg_c5': 24 },
    'std_p5_5': { 'asg_c1': 8, 'asg_c2': 16, 'asg_c3': 11, 'asg_c4': 20, 'asg_c5': 23 },
    'std_p5_6': { 'asg_c1': 9, 'asg_c2': 19, 'asg_c3': 14, 'asg_c4': 22, 'asg_c5': 26 },
    'std_p5_7': { 'asg_c1': 7, 'asg_c2': 15, 'asg_c3': 10, 'asg_c4': 19, 'asg_c5': 21 },
    'std_p5_8': { 'asg_c1': 9, 'asg_c2': 18, 'asg_c3': 13, 'asg_c4': 22, 'asg_c5': 26 },
    'std_p5_9': { 'asg_c1': 10, 'asg_c2': 20, 'asg_c3': 15, 'asg_c4': 25, 'asg_c5': 29 },
    'std_p5_10': { 'asg_c1': 8, 'asg_c2': 16, 'asg_c3': 12, 'asg_c4': 20, 'asg_c5': 24 },
    'std_p5_11': { 'asg_c1': 7, 'asg_c2': 14, 'asg_c3': 11, 'asg_c4': 18, 'asg_c5': 22 },
    'std_p5_12': { 'asg_c1': 9, 'asg_c2': 19, 'asg_c3': 13, 'asg_c4': 23, 'asg_c5': 27 },
    'std_p5_13': { 'asg_c1': 8, 'asg_c2': 15, 'asg_c3': 10, 'asg_c4': 19, 'asg_c5': 23 },
    'std_p5_14': { 'asg_c1': 9, 'asg_c2': 18, 'asg_c3': 14, 'asg_c4': 22, 'asg_c5': 26 },
    'std_p5_15': { 'asg_c1': 7, 'asg_c2': 13, 'asg_c3': 9, 'asg_c4': 18, 'asg_c5': 20 }
  };

  const compAttendance = [
    {
      id: 'att_c1',
      date: '2026-08-10',
      period: 'คาบ 1 (08:30 - 09:30)',
      records: {
        'std_p5_1': { status: 'present', periodBonusPoints: 2, note: 'ช่วยตอบคำถามหน้าชั้น' },
        'std_p5_2': { status: 'present', periodBonusPoints: 1, note: 'ส่งงานตรงเวลา' },
        'std_p5_3': { status: 'present', periodBonusPoints: 3, note: 'อธิบายผังงานได้ยอดเยี่ยม' },
        'std_p5_4': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_5': { status: 'late', periodBonusPoints: 0, note: 'เข้าสาย 5 นาที' },
        'std_p5_6': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_7': { status: 'leave', periodBonusPoints: 0, note: 'ลาป่วย' },
        'std_p5_8': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_9': { status: 'present', periodBonusPoints: 2, note: 'จิตสาธารณะช่วยเพื่อนในกลุ่ม' },
        'std_p5_10': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_11': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_12': { status: 'present', periodBonusPoints: 2, note: 'ตั้งใจฝึกเขียนโปรแกรม' },
        'std_p5_13': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_14': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_15': { status: 'absent', periodBonusPoints: 0, note: 'ขาดเรียนไม่มีใบลา' }
      }
    },
    {
      id: 'att_c2',
      date: '2026-08-20',
      period: 'คาบ 3 (10:30 - 11:30)',
      records: {
        'std_p5_1': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_2': { status: 'present', periodBonusPoints: 2, note: 'นำเสนอผลงาน Scratch ยอดเยี่ยม' },
        'std_p5_3': { status: 'present', periodBonusPoints: 2, note: '' },
        'std_p5_4': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_5': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_6': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_7': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_8': { status: 'present', periodBonusPoints: 2, note: 'ช่วยครูจัดเก็บอุปกรณ์คอมพิวเตอร์' },
        'std_p5_9': { status: 'present', periodBonusPoints: 3, note: 'ตอบโจทย์ปัญหาระคนได้ถูกต้อง' },
        'std_p5_10': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_11': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_12': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_13': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p5_14': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p5_15': { status: 'present', periodBonusPoints: 0, note: '' }
      }
    }
  ];

  // 2. วิทยาศาสตร์และเทคโนโลยี ป.6/1 (100 คะแนนเต็ม)
  const sciAssignments = [
    { id: 'asg_s1', title: 'การทดลองที่ 1: วงจรไฟฟ้าอย่างง่าย (อนุกรม-ขนาน)', category: 'ชิ้นงาน', maxScore: 15, date: '2026-08-15', description: 'ต่อวงจรไฟฟ้าและบันทึกผลความสว่างของหลอดไฟ' },
    { id: 'asg_s2', title: 'ใบงานที่ 2: ระบบย่อยอาหารและการดูดซึมสารอาหาร', category: 'ใบงาน', maxScore: 15, date: '2026-08-25', description: 'สรุปการเดินทางของอาหารและหน้าที่ของอวัยวะ' },
    { id: 'asg_s3', title: 'สอบย่อยกลางภาค: การแยกสารและปรากฏการณ์ของโลก', category: 'สอบย่อย', maxScore: 20, date: '2026-09-01', description: 'แบบทดสอบออนไลน์ 20 ข้อ' },
    { id: 'asg_s4', title: 'โครงงานวิทยาศาสตร์: เครื่องกรองน้ำจากธรรมชาติ', category: 'โครงงาน', maxScore: 25, date: '2026-09-03', description: 'ออกแบบและประดิษฐ์อุปกรณ์กรองน้ำจากวัสดุธรรมชาติ' },
    { id: 'asg_s5', title: 'การทดสอบวัดผลสัมฤทธิ์วิทยาศาสตร์ปลายภาค', category: 'สอบปลายภาค', maxScore: 25, date: '2026-09-05', description: 'การวัดผลสัมฤทธิ์ปลายภาคเรียนที่ 1' }
  ];

  const sciScores = {
    'std_p6_1': { 'asg_s1': 14, 'asg_s2': 15, 'asg_s3': 18, 'asg_s4': 24, 'asg_s5': 23 },
    'std_p6_2': { 'asg_s1': 13, 'asg_s2': 14, 'asg_s3': 17, 'asg_s4': 22, 'asg_s5': 22 },
    'std_p6_3': { 'asg_s1': 15, 'asg_s2': 15, 'asg_s3': 19, 'asg_s4': 25, 'asg_s5': 24 },
    'std_p6_4': { 'asg_s1': 14, 'asg_s2': 14, 'asg_s3': 18, 'asg_s4': 23, 'asg_s5': 23 },
    'std_p6_5': { 'asg_s1': 12, 'asg_s2': 13, 'asg_s3': 15, 'asg_s4': 20, 'asg_s5': 20 },
    'std_p6_6': { 'asg_s1': 14, 'asg_s2': 15, 'asg_s3': 18, 'asg_s4': 24, 'asg_s5': 24 },
    'std_p6_7': { 'asg_s1': 11, 'asg_s2': 12, 'asg_s3': 14, 'asg_s4': 19, 'asg_s5': 19 },
    'std_p6_8': { 'asg_s1': 13, 'asg_s2': 14, 'asg_s3': 16, 'asg_s4': 22, 'asg_s5': 21 },
    'std_p6_9': { 'asg_s1': 15, 'asg_s2': 15, 'asg_s3': 20, 'asg_s4': 25, 'asg_s5': 25 },
    'std_p6_10': { 'asg_s1': 12, 'asg_s2': 13, 'asg_s3': 15, 'asg_s4': 21, 'asg_s5': 20 },
    'std_p6_11': { 'asg_s1': 10, 'asg_s2': 11, 'asg_s3': 13, 'asg_s4': 18, 'asg_s5': 18 },
    'std_p6_12': { 'asg_s1': 14, 'asg_s2': 14, 'asg_s3': 18, 'asg_s4': 23, 'asg_s5': 23 },
    'std_p6_13': { 'asg_s1': 12, 'asg_s2': 12, 'asg_s3': 15, 'asg_s4': 20, 'asg_s5': 19 },
    'std_p6_14': { 'asg_s1': 13, 'asg_s2': 14, 'asg_s3': 17, 'asg_s4': 22, 'asg_s5': 22 },
    'std_p6_15': { 'asg_s1': 9, 'asg_s2': 10, 'asg_s3': 12, 'asg_s4': 17, 'asg_s5': 17 }
  };

  const sciAttendance = [
    {
      id: 'att_s1',
      date: '2026-08-15',
      period: 'คาบ 2 (09:30 - 10:30)',
      records: {
        'std_p6_1': { status: 'present', periodBonusPoints: 2, note: 'ต่อวงจรไฟฟ้าได้รวดเร็ว' },
        'std_p6_2': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p6_3': { status: 'present', periodBonusPoints: 3, note: 'ช่วยอธิบายเพื่อนร่วมกลุ่ม' },
        'std_p6_4': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p6_5': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p6_6': { status: 'present', periodBonusPoints: 2, note: 'บันทึกการทดลองได้ละเอียด' },
        'std_p6_7': { status: 'late', periodBonusPoints: 0, note: 'เข้าสาย 10 นาที' },
        'std_p6_8': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p6_9': { status: 'present', periodBonusPoints: 2, note: '' },
        'std_p6_10': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p6_11': { status: 'leave', periodBonusPoints: 0, note: 'ลากิจไปทำธุระกับผู้ปกครอง' },
        'std_p6_12': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p6_13': { status: 'present', periodBonusPoints: 0, note: '' },
        'std_p6_14': { status: 'present', periodBonusPoints: 1, note: '' },
        'std_p6_15': { status: 'present', periodBonusPoints: 0, note: '' }
      }
    }
  ];

  // 3. คณิตศาสตร์ ป.5/1 (100 คะแนนเต็ม)
  const mathAssignments = [
    { id: 'asg_m1', title: 'ใบงานที่ 1: การบวกลบเศษส่วนและจำนวนคละ', category: 'ใบงาน', maxScore: 20, date: '2026-08-12', description: 'แบบฝึกหัดแสดงวิธีทำเศษส่วน 10 ข้อ' },
    { id: 'asg_m2', title: 'ใบงานที่ 2: การคูณหารทศนิยมและการประมาณค่า', category: 'ใบงาน', maxScore: 20, date: '2026-08-22', description: 'โจทย์ปัญหาทศนิยมไม่เกินสามตำแหน่ง' },
    { id: 'asg_m3', title: 'สอบย่อยกลางภาค: บัญญัติไตรยางศ์และร้อยละ', category: 'สอบย่อย', maxScore: 20, date: '2026-09-01', description: 'การแก้โจทย์ปัญหาร้อยละ กำไร ขาดทุน' },
    { id: 'asg_m4', title: 'การทดสอบวัดผลสัมฤทธิ์คณิตศาสตร์ปลายภาค', category: 'สอบปลายภาค', maxScore: 40, date: '2026-09-05', description: 'ข้อสอบวัดผลสัมฤทธิ์ปลายภาคเรียนที่ 1' }
  ];

  const mathScores = {
    'std_p5_1': { 'asg_m1': 19, 'asg_m2': 18, 'asg_m3': 18, 'asg_m4': 36 },
    'std_p5_2': { 'asg_m1': 20, 'asg_m2': 19, 'asg_m3': 19, 'asg_m4': 38 },
    'std_p5_3': { 'asg_m1': 20, 'asg_m2': 20, 'asg_m3': 20, 'asg_m4': 40 },
    'std_p5_4': { 'asg_m1': 17, 'asg_m2': 17, 'asg_m3': 16, 'asg_m4': 33 },
    'std_p5_5': { 'asg_m1': 16, 'asg_m2': 15, 'asg_m3': 15, 'asg_m4': 31 },
    'std_p5_6': { 'asg_m1': 19, 'asg_m2': 18, 'asg_m3': 18, 'asg_m4': 36 },
    'std_p5_7': { 'asg_m1': 15, 'asg_m2': 14, 'asg_m3': 14, 'asg_m4': 29 },
    'std_p5_8': { 'asg_m1': 18, 'asg_m2': 17, 'asg_m3': 17, 'asg_m4': 35 },
    'std_p5_9': { 'asg_m1': 20, 'asg_m2': 20, 'asg_m3': 19, 'asg_m4': 39 },
    'std_p5_10': { 'asg_m1': 16, 'asg_m2': 16, 'asg_m3': 16, 'asg_m4': 32 },
    'std_p5_11': { 'asg_m1': 14, 'asg_m2': 14, 'asg_m3': 14, 'asg_m4': 28 },
    'std_p5_12': { 'asg_m1': 19, 'asg_m2': 18, 'asg_m3': 18, 'asg_m4': 36 },
    'std_p5_13': { 'asg_m1': 15, 'asg_m2': 15, 'asg_m3': 15, 'asg_m4': 30 },
    'std_p5_14': { 'asg_m1': 18, 'asg_m2': 18, 'asg_m3': 17, 'asg_m4': 35 },
    'std_p5_15': { 'asg_m1': 13, 'asg_m2': 13, 'asg_m3': 13, 'asg_m4': 26 }
  };

  // 4. ภาษาอังกฤษเพื่อการสื่อสาร ป.4/1 (100 คะแนนเต็ม)
  const engAssignments = [
    { id: 'asg_e1', title: 'Vocabulary Quiz: My Classroom & Daily Life', category: 'สอบย่อย', maxScore: 20, date: '2026-08-14', description: 'คำศัพท์และประโยคในชีวิตประจำวัน 20 คำ' },
    { id: 'asg_e2', title: 'Speaking Activity: Self Introduction & Hobby', category: 'ชิ้นงาน', maxScore: 25, date: '2026-08-26', description: 'การพูดสนทนาและแนะนำตนเองเป็นภาษาอังกฤษ' },
    { id: 'asg_e3', title: 'Worksheet: Present Simple & Question Words', category: 'ใบงาน', maxScore: 25, date: '2026-09-02', description: 'แบบฝึกหัดไวยากรณ์และรูปประโยคคำถาม' },
    { id: 'asg_e4', title: 'Final English Achievement Test', category: 'สอบปลายภาค', maxScore: 30, date: '2026-09-05', description: 'การทดสอบวัดผลสัมฤทธิ์ภาษาอังกฤษปลายภาค' }
  ];

  const engScores = {
    'std_p5_1': { 'asg_e1': 18, 'asg_e2': 23, 'asg_e3': 23, 'asg_e4': 27 },
    'std_p5_2': { 'asg_e1': 19, 'asg_e2': 24, 'asg_e3': 24, 'asg_e4': 28 },
    'std_p5_3': { 'asg_e1': 20, 'asg_e2': 25, 'asg_e3': 25, 'asg_e4': 29 },
    'std_p5_4': { 'asg_e1': 16, 'asg_e2': 21, 'asg_e3': 21, 'asg_e4': 24 },
    'std_p5_5': { 'asg_e1': 15, 'asg_e2': 19, 'asg_e3': 20, 'asg_e4': 23 },
    'std_p5_6': { 'asg_e1': 18, 'asg_e2': 23, 'asg_e3': 23, 'asg_e4': 26 },
    'std_p5_7': { 'asg_e1': 14, 'asg_e2': 18, 'asg_e3': 18, 'asg_e4': 21 },
    'std_p5_8': { 'asg_e1': 17, 'asg_e2': 22, 'asg_e3': 22, 'asg_e4': 26 },
    'std_p5_9': { 'asg_e1': 20, 'asg_e2': 25, 'asg_e3': 24, 'asg_e4': 29 },
    'std_p5_10': { 'asg_e1': 16, 'asg_e2': 20, 'asg_e3': 20, 'asg_e4': 24 }
  };

  return {
    'SUBJ_P5_COMP': {
      id: 'SUBJ_P5_COMP',
      code: 'ว15101',
      name: 'วิทยาการคำนวณ ป.5',
      gradeLevel: 'ชั้นประถมศึกษาปีที่ 5/1',
      academicYear: '2569',
      semester: '1',
      color: '#6366f1',
      icon: '💻',
      students: stdsP5,
      assignments: compAssignments,
      scores: compScores,
      attendance: compAttendance,
      assessments: buildAssessments(stdsP5),
      createdAt: '2026-08-01T08:00:00.000Z'
    },
    'SUBJ_P6_SCI': {
      id: 'SUBJ_P6_SCI',
      code: 'ว16101',
      name: 'วิทยาศาสตร์และเทคโนโลยี ป.6',
      gradeLevel: 'ชั้นประถมศึกษาปีที่ 6/1',
      academicYear: '2569',
      semester: '1',
      color: '#10b981',
      icon: '🔬',
      students: stdsP6,
      assignments: sciAssignments,
      scores: sciScores,
      attendance: sciAttendance,
      assessments: buildAssessments(stdsP6),
      createdAt: '2026-08-01T08:30:00.000Z'
    },
    'SUBJ_P5_MATH': {
      id: 'SUBJ_P5_MATH',
      code: 'ค15101',
      name: 'คณิตศาสตร์ ป.5',
      gradeLevel: 'ชั้นประถมศึกษาปีที่ 5/1',
      academicYear: '2569',
      semester: '1',
      color: '#f59e0b',
      icon: '📐',
      students: stdsP5,
      assignments: mathAssignments,
      scores: mathScores,
      attendance: compAttendance,
      assessments: buildAssessments(stdsP5),
      createdAt: '2026-08-01T09:00:00.000Z'
    },
    'SUBJ_P4_ENG': {
      id: 'SUBJ_P4_ENG',
      code: 'อ14101',
      name: 'ภาษาอังกฤษเพื่อการสื่อสาร ป.4',
      gradeLevel: 'ชั้นประถมศึกษาปีที่ 4/1',
      academicYear: '2569',
      semester: '1',
      color: '#ec4899',
      icon: '🌐',
      students: stdsP5.slice(0, 10),
      assignments: engAssignments,
      scores: engScores,
      attendance: compAttendance.slice(0, 1),
      assessments: buildAssessments(stdsP5.slice(0, 10)),
      createdAt: '2026-08-01T09:30:00.000Z'
    }
  };
};
