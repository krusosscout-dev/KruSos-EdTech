import { initializeApp, getApps, getApp } from 'firebase/app';
import { getDatabase, ref, set, get, update, onValue, push, child } from 'firebase/database';

class FirebaseSyncEngine {
  constructor() {
    this.app = null;
    this.db = null;
    this.initialized = false;
    this.listeners = [];
  }

  init(config) {
    if (!config || !config.apiKey || !config.databaseURL) {
      return false;
    }
    try {
      this.app = getApps().length === 0 ? initializeApp(config) : getApp();
      this.db = getDatabase(this.app);
      this.initialized = true;
      console.log('[Firebase] Realtime Database initialized successfully');
      return true;
    } catch (err) {
      console.error('[Firebase] Init failed:', err);
      this.initialized = false;
      return false;
    }
  }

  isReady() {
    return this.initialized && this.db !== null;
  }

  // Subscribe to Room State in Realtime
  subscribeRoom(roomId, onStateUpdate, onScoreToast, onGrandSummary) {
    if (!this.isReady() || !roomId) return () => {};

    const roomRef = ref(this.db, `rooms/${roomId.toUpperCase()}`);
    const unsubscribe = onValue(roomRef, (snapshot) => {
      const val = snapshot.val();
      if (!val) return;

      const rawGroups = val.groups ? Object.values(val.groups) : [];
      rawGroups.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

      let currentRank = 1;
      let lastScore = null;
      const rankedGroups = rawGroups.map((g, index) => {
        if (lastScore !== null && g.score < lastScore) {
          currentRank = index + 1;
        }
        lastScore = g.score;
        return { ...g, rank: currentRank };
      });

      const transactions = val.transactions ? Object.values(val.transactions).reverse() : [];
      const top3 = rankedGroups.slice(0, 3);
      const others = rankedGroups.slice(3);

      const state = {
        room: val.meta || { code: roomId, title: `ห้อง ${roomId}`, status: 'active' },
        groups: rankedGroups,
        top3,
        others,
        recentTransactions: transactions.slice(0, 15),
        totalGroups: rankedGroups.length,
        totalScoreGiven: transactions.reduce((acc, t) => acc + (t.points || 0), 0),
        totalMissionsCompleted: transactions.length
      };

      if (onStateUpdate) onStateUpdate(state);

      if (val.latestToast && onScoreToast) {
        onScoreToast(val.latestToast);
      }

      if (val.meta?.status === 'ended' && onGrandSummary) {
        onGrandSummary({
          room: state.room,
          champion: rankedGroups[0] || null,
          top3,
          allGroups: rankedGroups,
          totalGroups: rankedGroups.length,
          totalMissionsCompleted: state.totalMissionsCompleted,
          totalScoreGiven: state.totalScoreGiven,
          allTransactions: transactions
        });
      }
    });

    return unsubscribe;
  }

  // Create room in Firebase
  async createRoom({ code, title, missions }) {
    if (!this.isReady()) throw new Error('Firebase is not configured');
    const roomId = code.toUpperCase();
    const roomRef = ref(this.db, `rooms/${roomId}`);

    const newRoom = {
      meta: {
        code: roomId,
        title: title || `ห้องกิจกรรม ${roomId}`,
        status: 'active',
        missions: missions || [],
        createdAt: new Date().toISOString()
      },
      groups: {},
      transactions: {},
      usedTokens: {}
    };

    await set(roomRef, newRoom);
    return newRoom.meta;
  }

  // Join or Create Group in Firebase
  async joinOrCreateGroup({ roomId, name, color, mascot, existingGroupId }) {
    if (!this.isReady()) throw new Error('Firebase is not configured');
    const normalizedRoom = roomId.toUpperCase();

    if (existingGroupId) {
      const snap = await get(ref(this.db, `rooms/${normalizedRoom}/groups/${existingGroupId}`));
      if (snap.exists()) return snap.val();
    }

    const groupId = `grp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const group = {
      id: groupId,
      roomId: normalizedRoom,
      name: name.trim(),
      color: color || '#6366f1',
      mascot: mascot || '🚀',
      score: 0,
      createdAt: new Date().toISOString()
    };

    await set(ref(this.db, `rooms/${normalizedRoom}/groups/${groupId}`), group);
    return group;
  }

  // Submit Score in Firebase
  async submitScore({ roomId, groupId, missionName, points, token, note }) {
    if (!this.isReady()) throw new Error('Firebase is not configured');
    const normalizedRoom = roomId.toUpperCase();

    // Check token
    if (token) {
      const tokenSnap = await get(ref(this.db, `rooms/${normalizedRoom}/usedTokens/${token}`));
      if (tokenSnap.exists()) {
        throw new Error('⚠️ QR Code นี้ถูกใช้ให้คะแนนไปแล้ว!');
      }
    }

    const groupRef = ref(this.db, `rooms/${normalizedRoom}/groups/${groupId}`);
    const groupSnap = await get(groupRef);
    if (!groupSnap.exists()) throw new Error('ไม่พบกลุ่มในระบบ');

    const group = groupSnap.val();
    const pts = parseInt(points, 10) || 0;
    const newScore = (group.score || 0) + pts;

    const txId = `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const transaction = {
      id: txId,
      roomId: normalizedRoom,
      groupId,
      groupName: group.name,
      missionName: missionName || 'ภารกิจทั่วไป',
      points: pts,
      token: token || null,
      note: (note || '').trim(),
      timestamp: new Date().toISOString(),
      runningTotal: newScore
    };

    const updates = {};
    updates[`rooms/${normalizedRoom}/groups/${groupId}/score`] = newScore;
    updates[`rooms/${normalizedRoom}/transactions/${txId}`] = transaction;
    updates[`rooms/${normalizedRoom}/latestToast`] = {
      groupId: group.id,
      groupName: group.name,
      groupMascot: group.mascot,
      groupColor: group.color,
      missionName: transaction.missionName,
      points: transaction.points,
      newTotal: newScore,
      timestamp: transaction.timestamp
    };

    if (token) {
      updates[`rooms/${normalizedRoom}/usedTokens/${token}`] = {
        usedAt: new Date().toISOString(),
        groupId,
        points: pts
      };
    }

    await update(ref(this.db), updates);
    return { transaction, group: { ...group, score: newScore } };
  }

  // Change room status
  async changeRoomStatus(roomId, status) {
    if (!this.isReady()) throw new Error('Firebase is not configured');
    const normalizedRoom = roomId.toUpperCase();
    await update(ref(this.db, `rooms/${normalizedRoom}/meta`), {
      status,
      endedAt: status === 'ended' ? new Date().toISOString() : null
    });
  }

  // Reset scores
  async resetScores(roomId) {
    if (!this.isReady()) throw new Error('Firebase is not configured');
    const normalizedRoom = roomId.toUpperCase();
    const groupsSnap = await get(ref(this.db, `rooms/${normalizedRoom}/groups`));
    const updates = {};
    if (groupsSnap.exists()) {
      Object.keys(groupsSnap.val()).forEach((gid) => {
        updates[`rooms/${normalizedRoom}/groups/${gid}/score`] = 0;
      });
    }
    updates[`rooms/${normalizedRoom}/transactions`] = null;
    await update(ref(this.db), updates);
  }

  // Delete group
  async deleteGroup(roomId, groupId) {
    if (!this.isReady()) return;
    const normalizedRoom = roomId.toUpperCase();
    await set(ref(this.db, `rooms/${normalizedRoom}/groups/${groupId}`), null);
  }
}

export const firebaseEngine = new FirebaseSyncEngine();
