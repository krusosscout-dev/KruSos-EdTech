import express from 'express';
import { db } from './db.js';
import { RoomManager } from './roomManager.js';

const router = express.Router();

// --- SUBJECT MANAGEMENT ROUTES (Req 1, 2, 3, 5, 6) ---
router.get('/subjects', (req, res) => {
  try {
    const subjects = db.getSubjects();
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subjects', (req, res) => {
  try {
    const subject = db.createSubject(req.body);
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subjects/reset', (req, res) => {
  try {
    const subjects = db.resetMockData();
    res.json({ success: true, data: subjects });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/subjects/:id', (req, res) => {
  try {
    const subject = db.getSubject(req.params.id);
    if (!subject) return res.status(404).json({ success: false, error: 'Subject not found' });
    res.json({ success: true, data: subject });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.put('/subjects/:id', (req, res) => {
  try {
    const updated = db.updateSubject(req.params.id, req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Subject not found' });
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.delete('/subjects/:id', (req, res) => {
  try {
    const ok = db.deleteSubject(req.params.id);
    res.json({ success: ok });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subjects/:id/scores', (req, res) => {
  try {
    const { studentId, assignmentId, score } = req.body;
    const updated = db.updateScore(req.params.id, studentId, assignmentId, score);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subjects/:id/attendance', (req, res) => {
  try {
    const updated = db.saveAttendanceSession(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/subjects/:id/assessments', (req, res) => {
  try {
    const updated = db.saveAssessments(req.params.id, req.body);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});


// Create new room via REST
router.post('/rooms', (req, res) => {
  try {
    const { title, missions, customCode } = req.body;
    let code = customCode ? customCode.trim().toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();
    
    // Ensure uniqueness
    if (db.getRoom(code)) {
      code = Math.floor(100000 + Math.random() * 900000).toString();
    }

    const room = db.createRoom({ code, title, missions });
    res.json({ success: true, room });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Get room details
router.get('/rooms/:roomId', (req, res) => {
  const { roomId } = req.params;
  const state = RoomManager.getFullRoomState(roomId);
  if (!state) {
    return res.status(404).json({ success: false, error: 'ไม่พบห้องกิจกรรมนี้' });
  }
  res.json({ success: true, data: state });
});

// Get Grand Summary
router.get('/rooms/:roomId/summary', (req, res) => {
  const { roomId } = req.params;
  const summary = RoomManager.getGrandSummary(roomId);
  if (!summary) {
    return res.status(404).json({ success: false, error: 'ไม่พบข้อมูลสรุปกิจกรรม' });
  }
  res.json({ success: true, summary });
});

// Export CSV report with UTF-8 BOM for Thai Excel support
router.get('/rooms/:roomId/export/csv', (req, res) => {
  const { roomId } = req.params;
  const room = db.getRoom(roomId);
  if (!room) {
    return res.status(404).send('Room not found');
  }

  const transactions = db.getTransactionsByRoom(roomId);
  const groups = db.getGroupsByRoom(roomId);

  // Build CSV content
  const lines = [];
  
  // Header
  lines.push(`"รายงานสรุปคะแนนกิจกรรม - ระบบของครูซอส"`);
  lines.push(`"ชื่อห้องกิจกรรม:","${room.title}"`);
  lines.push(`"รหัสห้อง (PIN):","${room.code}"`);
  lines.push(`"เวลาสร้างห้อง:","${new Date(room.createdAt).toLocaleString('th-TH')}"`);
  lines.push(`"เวลาสิ้นสุด:","${room.endedAt ? new Date(room.endedAt).toLocaleString('th-TH') : 'กำลังดำเนินการ'}"`);
  lines.push('');

  // Summary Table of Groups
  lines.push('"--- สรุปอันดับและคะแนนรวมแต่ละกลุ่ม ---"');
  lines.push('"อันดับ","ชื่อกลุ่ม","สัญลักษณ์","คะแนนรวม","จำนวนภารกิจที่ผ่าน"');

  groups.forEach((g, idx) => {
    const missionCount = transactions.filter(t => t.groupId === g.id).length;
    lines.push(`"${idx + 1}","${g.name}","${g.mascot}","${g.score}","${missionCount}"`);
  });

  lines.push('');
  lines.push('"--- ประวัติการให้คะแนนแบบละเอียด (Log Transactions) ---"');
  lines.push('"ลำดับ","เวลา","ชื่อกลุ่ม","ชื่อภารกิจ","คะแนนที่ได้","คะแนนสะสมหลังทำ","หมายเหตุ","Token"');

  // Chronological order for transactions
  const chronoTx = [...transactions].reverse();
  chronoTx.forEach((tx, idx) => {
    const timeStr = new Date(tx.timestamp).toLocaleString('th-TH');
    lines.push(`"${idx + 1}","${timeStr}","${tx.groupName}","${tx.missionName}","+${tx.points}","${tx.runningTotal}","${tx.note || '-'}","${tx.token || '-'}"`);
  });

  const csvContent = '\uFEFF' + lines.join('\r\n'); // UTF-8 BOM

  const filename = `KruSauce_Report_${room.code}_${new Date().toISOString().slice(0, 10)}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
  res.send(csvContent);
});

// Export JSON report
router.get('/rooms/:roomId/export/json', (req, res) => {
  const { roomId } = req.params;
  const summary = RoomManager.getGrandSummary(roomId);
  if (!summary) return res.status(404).json({ error: 'Room not found' });
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="KruSauce_Report_${roomId}.json"`);
  res.json(summary);
});

export default router;
