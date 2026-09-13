import crypto from 'crypto';
import { db } from './db.js';

const SECRET_KEY = 'KRU_SAUCE_SECRET_2026_WATBANGPUN';

export class RoomManager {
  // Generate secure Dynamic QR Payload
  static generateDynamicPayload({ roomId, groupId, groupName, missionName }) {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 9);
    const missionSafe = Buffer.from(missionName || 'ภารกิจ').toString('base64url');

    // Create HMAC signature
    const rawData = `${roomId}:${groupId}:${timestamp}:${nonce}:${missionSafe}`;
    const signature = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawData)
      .digest('hex')
      .substring(0, 10);

    const token = `KS1.${roomId}.${groupId}.${timestamp}.${nonce}.${missionSafe}.${signature}`;

    return {
      token,
      payload: {
        type: 'KRU_SAUCE_SCORE_REQ',
        roomId,
        groupId,
        groupName,
        missionName,
        timestamp,
        token
      }
    };
  }

  // Validate scanned QR token
  static validateToken(rawToken) {
    if (!rawToken || typeof rawToken !== 'string') {
      return { valid: false, reason: 'รูปแบบ QR Code ไม่ถูกต้อง' };
    }

    // Try parsing JSON if rawToken is JSON string
    let tokenStr = rawToken;
    try {
      const parsed = JSON.parse(rawToken);
      if (parsed.token) tokenStr = parsed.token;
    } catch {
      // not JSON, proceed with tokenStr
    }

    const parts = tokenStr.split('.');
    if (parts.length !== 7 || parts[0] !== 'KS1') {
      return { valid: false, reason: 'ไม่ใช่ QR Code ของระบบครูซอส' };
    }

    const [prefix, roomId, groupId, timestampStr, nonce, missionSafe, signature] = parts;
    const timestamp = parseInt(timestampStr, 10);

    // Verify HMAC
    const rawData = `${roomId}:${groupId}:${timestamp}:${nonce}:${missionSafe}`;
    const expectedSig = crypto
      .createHmac('sha256', SECRET_KEY)
      .update(rawData)
      .digest('hex')
      .substring(0, 10);

    if (signature !== expectedSig) {
      return { valid: false, reason: 'ข้อมูล QR Code ถูกดัดแปลง (Invalid Signature)' };
    }

    // Check expiration (15 minutes window)
    const now = Date.now();
    const MAX_AGE_MS = 15 * 60 * 1000;
    if (now - timestamp > MAX_AGE_MS) {
      return { valid: false, reason: 'QR Code นี้หมดอายุแล้ว (เกิน 15 นาที) กรุณากดขอคะแนนใหม่' };
    }

    // Check if token already used (Anti-Replay)
    if (db.isTokenUsed(tokenStr)) {
      return { valid: false, reason: '⚠️ QR Code นี้ถูกใช้ให้คะแนนไปแล้ว! ไม่สามารถสแกนซ้ำได้' };
    }

    let missionName = 'ภารกิจ';
    try {
      missionName = Buffer.from(missionSafe, 'base64url').toString('utf-8');
    } catch (e) {
      // fallback
    }

    const group = db.getGroup(groupId);
    if (!group) {
      return { valid: false, reason: 'ไม่พบข้อมูลกลุ่มนี้ในระบบ' };
    }

    const room = db.getRoom(roomId);
    if (!room) {
      return { valid: false, reason: 'ไม่พบห้องกิจกรรมนี้' };
    }

    if (room.status === 'ended') {
      return { valid: false, reason: 'ห้องกิจกรรมนี้สิ้นสุดลงแล้ว' };
    }

    if (room.status === 'paused') {
      return { valid: false, reason: 'กิจกรรมกำลังอยู่ในสถานะพัก (Paused)' };
    }

    return {
      valid: true,
      data: {
        token: tokenStr,
        roomId,
        groupId,
        groupName: group.name,
        groupColor: group.color,
        groupMascot: group.mascot,
        currentScore: group.score,
        missionName,
        timestamp: new Date(timestamp).toLocaleTimeString('th-TH')
      }
    };
  }

  // Get full room state with rankings and recent activity
  static getFullRoomState(roomId) {
    const room = db.getRoom(roomId);
    if (!room) return null;

    const groups = db.getGroupsByRoom(roomId);
    const transactions = db.getTransactionsByRoom(roomId);

    // Calculate rankings
    let currentRank = 1;
    let lastScore = null;
    const rankedGroups = groups.map((g, index) => {
      if (lastScore !== null && g.score < lastScore) {
        currentRank = index + 1;
      }
      lastScore = g.score;
      return {
        ...g,
        rank: currentRank
      };
    });

    // Top 3 Podium
    const top3 = rankedGroups.slice(0, 3);
    const others = rankedGroups.slice(3);

    return {
      room,
      groups: rankedGroups,
      top3,
      others,
      recentTransactions: transactions.slice(0, 15),
      totalGroups: groups.length,
      totalScoreGiven: transactions.reduce((acc, t) => acc + (t.points || 0), 0),
      totalMissionsCompleted: transactions.length
    };
  }

  // Calculate Grand Summary Report
  static getGrandSummary(roomId) {
    const state = this.getFullRoomState(roomId);
    if (!state) return null;

    const { groups, recentTransactions, totalMissionsCompleted, totalScoreGiven } = state;
    const transactions = db.getTransactionsByRoom(roomId);

    // Mission frequency map
    const missionStats = {};
    transactions.forEach(t => {
      const name = t.missionName || 'ทั่วไป';
      missionStats[name] = (missionStats[name] || 0) + 1;
    });

    const popularMissions = Object.entries(missionStats)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    return {
      room: state.room,
      champion: groups[0] || null,
      top3: state.top3,
      allGroups: groups,
      totalGroups: groups.length,
      totalMissionsCompleted,
      totalScoreGiven,
      popularMissions,
      allTransactions: transactions
    };
  }
}
