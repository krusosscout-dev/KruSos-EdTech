import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io } from 'socket.io-client';
import { soundFX } from '../components/AudioController';
import { triggerScoreConfetti, triggerVictoryFireworks } from '../components/ConfettiEffect';
import { firebaseEngine } from '../services/firebaseRealtime';
import { cloudRelay } from '../services/cloudRelay';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(true); // Default true via Zero-Config Cloud Relay
  const [syncMode, setSyncMode] = useState('cloud'); // 'cloud' | 'websocket' | 'firebase'
  const [roomState, setRoomState] = useState(null);
  const [currentGroup, setCurrentGroup] = useState(() => {
    try {
      const saved = localStorage.getItem('kru_sauce_current_group');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [latestScoreToast, setLatestScoreToast] = useState(null);
  const [grandSummary, setGrandSummary] = useState(null);
  const [soundMuted, setSoundMuted] = useState(soundFX.isMuted());
  const [customServerUrl, setCustomServerUrl] = useState(() => {
    return localStorage.getItem('kru_sauce_server_url') || import.meta.env.VITE_SOCKET_URL || '';
  });

  const fbUnsubRef = useRef(null);

  // Initialize Zero-Config Cloud Realtime Engine on startup
  useEffect(() => {
    // 1. Initialize Zero-Config Cloud Relay (Works everywhere on Vercel without setup)
    cloudRelay.init();

    // 2. Check for Firebase Configuration in env or localStorage
    const savedFbConfig = localStorage.getItem('kru_sauce_fb_config');
    const fbEnvConfig = import.meta.env.VITE_FIREBASE_CONFIG ? JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG) : null;
    const fbConfig = savedFbConfig ? JSON.parse(savedFbConfig) : fbEnvConfig;

    if (fbConfig && firebaseEngine.init(fbConfig)) {
      setSyncMode('firebase');
      setConnected(true);
      return;
    }

    // 3. Connect via Socket.io if running locally or server URL provided
    let serverUrl = customServerUrl;
    if (!serverUrl && window.location.port === '5173') {
      serverUrl = 'http://localhost:3000';
    }

    if (serverUrl) {
      const s = io(serverUrl, {
        transports: ['websocket', 'polling'],
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      s.on('connect', () => {
        console.log('[Socket] Connected to backend:', serverUrl);
        setConnected(true);
        setSyncMode('websocket');
      });

      s.on('room_state', (state) => {
        setRoomState(state);
        cloudRelay.broadcastState(state);
        if (currentGroup && state?.groups) {
          const found = state.groups.find(g => g.id === currentGroup.id);
          if (found) {
            setCurrentGroup(found);
            localStorage.setItem('kru_sauce_current_group', JSON.stringify(found));
          }
        }
      });

      s.on('score_toast', (toast) => {
        setLatestScoreToast(toast);
        soundFX.playPointGain();
        triggerScoreConfetti(0.5, 0.4);
        setTimeout(() => {
          setLatestScoreToast(prev => (prev?.timestamp === toast.timestamp ? null : prev));
        }, 6000);
      });

      s.on('grand_summary', (summary) => {
        setGrandSummary(summary);
        soundFX.playFanfare();
        triggerVictoryFireworks();
      });

      setSocket(s);

      return () => {
        s.disconnect();
      };
    }
  }, [customServerUrl]);

  const toggleSound = () => {
    const isMuted = soundFX.toggleMute();
    setSoundMuted(isMuted);
    if (!isMuted) {
      soundFX.playClick();
    }
  };

  const setServerUrl = (url) => {
    const clean = url.trim();
    setCustomServerUrl(clean);
    if (clean) {
      localStorage.setItem('kru_sauce_server_url', clean);
    } else {
      localStorage.removeItem('kru_sauce_server_url');
    }
  };

  const joinRoom = (roomId, role = 'viewer', groupId = null) => {
    if (!roomId) return;
    const roomCode = roomId.toUpperCase();

    // Subscribe to Cloud Relay for Zero-Config Vercel Realtime sync
    cloudRelay.subscribeRoom(roomCode, {
      onRoomState: (state) => {
        setRoomState(state);
        if (currentGroup && state?.groups) {
          const found = state.groups.find(g => g.id === currentGroup.id);
          if (found) {
            setCurrentGroup(found);
            localStorage.setItem('kru_sauce_current_group', JSON.stringify(found));
          }
        }
      },
      onScoreToast: (toast) => {
        setLatestScoreToast(toast);
        soundFX.playPointGain();
        triggerScoreConfetti(0.5, 0.4);
        setTimeout(() => {
          setLatestScoreToast(prev => (prev?.timestamp === toast.timestamp ? null : prev));
        }, 6000);
      },
      onGrandSummary: (summary) => {
        setGrandSummary(summary);
        soundFX.playFanfare();
        triggerVictoryFireworks();
      }
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      if (fbUnsubRef.current) fbUnsubRef.current();
      fbUnsubRef.current = firebaseEngine.subscribeRoom(
        roomCode,
        (state) => setRoomState(state),
        (toast) => {
          setLatestScoreToast(toast);
          soundFX.playPointGain();
          triggerScoreConfetti(0.5, 0.4);
        },
        (summary) => {
          setGrandSummary(summary);
          soundFX.playFanfare();
          triggerVictoryFireworks();
        }
      );
      return;
    }

    if (socket && socket.connected) {
      socket.emit('join_room', { roomId: roomCode, role, groupId });
    }
  };

  const createRoom = async ({ title, missions, customCode }) => {
    let roomCode = customCode ? customCode.trim().toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();

    const newRoom = { code: roomCode, title: title || `ห้อง ${roomCode}`, status: 'active', missions: missions || [] };
    const initialState = {
      room: newRoom,
      groups: [],
      top3: [],
      others: [],
      recentTransactions: [],
      totalGroups: 0,
      totalScoreGiven: 0,
      totalMissionsCompleted: 0
    };

    setRoomState(initialState);
    joinRoom(roomCode, 'admin');

    // Broadcast to Cloud Relay
    cloudRelay.broadcastState(initialState);

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.createRoom({ code: roomCode, title, missions });
    } else if (socket && socket.connected) {
      socket.emit('create_room', { title, missions, code: customCode });
    }

    return { success: true, room: newRoom, state: initialState };
  };

  const joinOrCreateGroup = async ({ roomId, name, color, mascot, existingGroupId }) => {
    const roomCode = roomId.toUpperCase();
    const groupId = existingGroupId || `grp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const group = {
      id: groupId,
      roomId: roomCode,
      name: (name || 'กลุ่มนักเรียน').trim(),
      color: color || '#6366f1',
      mascot: mascot || '🚀',
      score: 0,
      createdAt: new Date().toISOString()
    };

    setCurrentGroup(group);
    localStorage.setItem('kru_sauce_current_group', JSON.stringify(group));
    joinRoom(roomCode, 'student', group.id);

    // Update room state
    setRoomState(prev => {
      const currentGroups = prev?.groups ? [...prev.groups] : [];
      if (!currentGroups.some(g => g.id === group.id)) {
        currentGroups.push(group);
      }
      const updated = {
        ...(prev || { room: { code: roomCode, title: `ห้อง ${roomCode}`, status: 'active' } }),
        groups: currentGroups,
        top3: currentGroups.slice(0, 3),
        others: currentGroups.slice(3),
        totalGroups: currentGroups.length
      };
      cloudRelay.broadcastState(updated);
      return updated;
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.joinOrCreateGroup({ roomId: roomCode, name, color, mascot, existingGroupId });
    } else if (socket && socket.connected) {
      socket.emit('join_or_create_group', { roomId: roomCode, name, color, mascot, existingGroupId });
    }

    return { success: true, group };
  };

  const requestScoreQr = async ({ roomId, groupId, missionName }) => {
    const timestamp = Date.now();
    const nonce = Math.random().toString(36).substring(2, 8);
    const missionSafe = btoa(encodeURIComponent(missionName || 'ภารกิจ'));
    const token = `KS1.${roomId.toUpperCase()}.${groupId}.${timestamp}.${nonce}.${missionSafe}.VCLOK`;

    return {
      success: true,
      token,
      payload: { roomId, groupId, missionName, timestamp, token }
    };
  };

  const adminValidateQr = async (rawToken) => {
    try {
      const parts = rawToken.split('.');
      if (parts.length < 5 || parts[0] !== 'KS1') {
        return { valid: false, reason: 'ไม่ใช่ QR Code ของระบบครูซอส' };
      }
      const [_, roomId, groupId, timestampStr, nonce, missionSafe] = parts;
      const missionName = decodeURIComponent(atob(missionSafe));
      const group = (roomState?.groups || []).find(g => g.id === groupId);

      soundFX.playScanSuccess();
      return {
        valid: true,
        data: {
          token: rawToken,
          roomId,
          groupId,
          groupName: group?.name || 'กลุ่มนักเรียน',
          groupColor: group?.color || '#6366f1',
          groupMascot: group?.mascot || '🚀',
          currentScore: group?.score || 0,
          missionName,
          timestamp: new Date(parseInt(timestampStr, 10)).toLocaleTimeString('th-TH')
        }
      };
    } catch (e) {
      soundFX.playError();
      return { valid: false, reason: 'รูปแบบ QR Code ไม่ถูกต้อง' };
    }
  };

  const adminSubmitScore = async ({ roomId, groupId, missionName, points, token, note }) => {
    const roomCode = roomId.toUpperCase();
    const pts = parseInt(points, 10) || 0;

    setRoomState(prev => {
      if (!prev) return prev;
      const currentGroups = prev.groups.map(g => {
        if (g.id === groupId) {
          return { ...g, score: (g.score || 0) + pts };
        }
        return g;
      });

      currentGroups.sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));

      let rank = 1;
      let lastScore = null;
      const ranked = currentGroups.map((g, idx) => {
        if (lastScore !== null && g.score < lastScore) rank = idx + 1;
        lastScore = g.score;
        return { ...g, rank };
      });

      const groupObj = ranked.find(g => g.id === groupId);
      const tx = {
        id: `tx_${Date.now()}`,
        roomId: roomCode,
        groupId,
        groupName: groupObj?.name || 'กลุ่ม',
        missionName: missionName || 'ภารกิจทั่วไป',
        points: pts,
        note: note || '',
        timestamp: new Date().toISOString()
      };

      const updated = {
        ...prev,
        groups: ranked,
        top3: ranked.slice(0, 3),
        others: ranked.slice(3),
        recentTransactions: [tx, ...(prev.recentTransactions || [])].slice(0, 15),
        totalScoreGiven: (prev.totalScoreGiven || 0) + pts,
        totalMissionsCompleted: (prev.totalMissionsCompleted || 0) + 1
      };

      // Toast payload
      const toast = {
        groupId,
        groupName: groupObj?.name || 'กลุ่ม',
        groupMascot: groupObj?.mascot || '🚀',
        groupColor: groupObj?.color || '#6366f1',
        missionName: tx.missionName,
        points: pts,
        newTotal: groupObj?.score || 0,
        timestamp: tx.timestamp
      };

      cloudRelay.broadcastState(updated);
      cloudRelay.broadcastScoreToast(toast);

      setLatestScoreToast(toast);
      soundFX.playFanfare();
      triggerScoreConfetti(0.5, 0.4);

      return updated;
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.submitScore({ roomId: roomCode, groupId, missionName, points: pts, token, note });
    } else if (socket && socket.connected) {
      socket.emit('admin_submit_score', { roomId: roomCode, groupId, missionName, points: pts, token, note });
    }

    return { success: true };
  };

  const changeRoomStatus = async (roomId, status) => {
    const roomCode = roomId.toUpperCase();

    setRoomState(prev => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        room: { ...prev.room, status, endedAt: status === 'ended' ? new Date().toISOString() : null }
      };

      if (status === 'ended') {
        const summary = {
          room: updated.room,
          champion: updated.groups[0] || null,
          top3: updated.top3,
          allGroups: updated.groups,
          totalGroups: updated.groups.length,
          totalMissionsCompleted: updated.totalMissionsCompleted,
          totalScoreGiven: updated.totalScoreGiven
        };
        setGrandSummary(summary);
        cloudRelay.broadcastGrandSummary(summary);
        soundFX.playFanfare();
        triggerVictoryFireworks();
      }

      cloudRelay.broadcastState(updated);
      return updated;
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.changeRoomStatus(roomCode, status);
    } else if (socket && socket.connected) {
      socket.emit('change_room_status', { roomId: roomCode, status });
    }

    return { success: true };
  };

  const resetScores = async (roomId) => {
    const roomCode = roomId.toUpperCase();
    setRoomState(prev => {
      if (!prev) return prev;
      const resetGroups = prev.groups.map(g => ({ ...g, score: 0 }));
      const updated = {
        ...prev,
        groups: resetGroups,
        top3: resetGroups.slice(0, 3),
        others: resetGroups.slice(3),
        recentTransactions: [],
        totalScoreGiven: 0,
        totalMissionsCompleted: 0
      };
      cloudRelay.broadcastState(updated);
      return updated;
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.resetScores(roomCode);
    } else if (socket && socket.connected) {
      socket.emit('reset_scores', { roomId: roomCode });
    }

    return { success: true };
  };

  const deleteGroup = async (roomId, groupId) => {
    const roomCode = roomId.toUpperCase();
    setRoomState(prev => {
      if (!prev) return prev;
      const filtered = prev.groups.filter(g => g.id !== groupId);
      const updated = {
        ...prev,
        groups: filtered,
        top3: filtered.slice(0, 3),
        others: filtered.slice(3),
        totalGroups: filtered.length
      };
      cloudRelay.broadcastState(updated);
      return updated;
    });

    if (syncMode === 'firebase' && firebaseEngine.isReady()) {
      await firebaseEngine.deleteGroup(roomCode, groupId);
    } else if (socket && socket.connected) {
      socket.emit('delete_group', { roomId: roomCode, groupId });
    }

    return { success: true };
  };

  const leaveGroup = () => {
    setCurrentGroup(null);
    localStorage.removeItem('kru_sauce_current_group');
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        syncMode,
        customServerUrl,
        setServerUrl,
        roomState,
        setRoomState,
        currentGroup,
        setCurrentGroup,
        latestScoreToast,
        setLatestScoreToast,
        grandSummary,
        setGrandSummary,
        soundMuted,
        toggleSound,
        joinRoom,
        createRoom,
        joinOrCreateGroup,
        requestScoreQr,
        adminValidateQr,
        adminSubmitScore,
        changeRoomStatus,
        resetScores,
        deleteGroup,
        leaveGroup
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
