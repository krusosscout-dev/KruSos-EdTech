import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routes from './routes.js';
import { db } from './db.js';
import { RoomManager } from './roomManager.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// API routes
app.use('/api', routes);

// Serve static frontend in production
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// Fallback for SPA routing in production
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(distPath, 'index.html');
  res.sendFile(indexPath, err => {
    if (err) {
      res.status(200).send(`
        <!DOCTYPE html>
        <html>
        <head><title>ระบบของครูซอส</title></head>
        <body style="font-family: sans-serif; text-align: center; padding: 50px; background: #0f172a; color: #f8fafc;">
          <h1>🎯 ระบบของครูซอส (Server Running)</h1>
          <p>กรุณาเปิด Frontend Development Server ที่พอร์ต 5173 หรือรัน npm run build</p>
        </body>
        </html>
      `);
    }
  });
});

// Socket.io Real-time Handlers
io.on('connection', (socket) => {
  let currentRoom = null;
  let currentRole = null;
  let currentGroupId = null;

  // Join a room channel
  socket.on('join_room', ({ roomId, role, groupId }) => {
    if (!roomId) return;
    const roomCode = roomId.toUpperCase();
    currentRoom = roomCode;
    currentRole = role || 'viewer';
    currentGroupId = groupId || null;

    socket.join(roomCode);
    console.log(`[Socket] Client ${socket.id} (${currentRole}) joined room ${roomCode}`);

    // Send latest room state immediately
    const state = RoomManager.getFullRoomState(roomCode);
    if (state) {
      socket.emit('room_state', state);
    } else {
      socket.emit('error_message', { message: 'ไม่พบห้องกิจกรรมนี้' });
    }
  });

  // Admin creates room
  socket.on('create_room', ({ code, title, missions }, callback) => {
    try {
      let roomCode = code ? code.trim().toUpperCase() : Math.floor(100000 + Math.random() * 900000).toString();
      if (db.getRoom(roomCode)) {
        roomCode = Math.floor(100000 + Math.random() * 900000).toString();
      }

      const room = db.createRoom({ code: roomCode, title, missions });
      const state = RoomManager.getFullRoomState(roomCode);

      socket.join(roomCode);
      currentRoom = roomCode;
      currentRole = 'admin';

      if (callback) callback({ success: true, room, state });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Student creates / joins a group
  socket.on('join_or_create_group', ({ roomId, name, color, mascot, existingGroupId }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      const room = db.getRoom(roomCode);
      if (!room) {
        return callback && callback({ success: false, error: 'ไม่พบห้องกิจกรรมนี้' });
      }

      let group = null;
      if (existingGroupId) {
        group = db.getGroup(existingGroupId);
      }

      if (!group) {
        // Create new group
        if (!name || !name.trim()) {
          return callback && callback({ success: false, error: 'กรุณาระบุชื่อกลุ่ม' });
        }
        group = db.createGroup({ roomId: roomCode, name, color, mascot });
      }

      currentRoom = roomCode;
      currentRole = 'student';
      currentGroupId = group.id;
      socket.join(roomCode);

      const state = RoomManager.getFullRoomState(roomCode);
      io.to(roomCode).emit('room_state', state);
      io.to(roomCode).emit('group_joined', { group, message: `🎉 กลุ่ม "${group.name}" เข้าร่วมห้องแล้ว!` });

      if (callback) callback({ success: true, group, state });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Student requests dynamic scoring QR Code
  socket.on('request_score_qr', ({ roomId, groupId, missionName }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      const group = db.getGroup(groupId);
      if (!group) {
        return callback && callback({ success: false, error: 'ไม่พบข้อมูลกลุ่ม' });
      }

      const dynamicData = RoomManager.generateDynamicPayload({
        roomId: roomCode,
        groupId,
        groupName: group.name,
        missionName: missionName || 'ภารกิจทั่วไป'
      });

      if (callback) callback({ success: true, ...dynamicData });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Admin scans QR code -> decode & validate before opening score popup
  socket.on('admin_validate_qr', ({ rawToken }, callback) => {
    try {
      const result = RoomManager.validateToken(rawToken);
      if (callback) callback(result);
    } catch (err) {
      if (callback) callback({ valid: false, reason: err.message });
    }
  });

  // Admin submits score after verification
  socket.on('admin_submit_score', ({ roomId, groupId, missionName, points, token, note }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      const room = db.getRoom(roomCode);
      if (!room) {
        return callback && callback({ success: false, error: 'ไม่พบห้องกิจกรรม' });
      }

      if (room.status === 'ended') {
        return callback && callback({ success: false, error: 'ห้องกิจกรรมนี้สิ้นสุดลงแล้ว' });
      }

      // If token provided, double check token is not already used
      if (token && db.isTokenUsed(token)) {
        return callback && callback({ success: false, error: '⚠️ QR Code นี้ถูกใช้ให้คะแนนไปแล้ว' });
      }

      const { transaction, group } = db.addScoreTransaction({
        roomId: roomCode,
        groupId,
        missionName,
        points: parseInt(points, 10) || 0,
        token,
        note
      });

      const state = RoomManager.getFullRoomState(roomCode);

      // Broadcast updated room state to ALL clients in the room (display, students, admin)
      io.to(roomCode).emit('room_state', state);

      // Broadcast celebratory Toast Notification
      io.to(roomCode).emit('score_toast', {
        groupId: group.id,
        groupName: group.name,
        groupMascot: group.mascot,
        groupColor: group.color,
        missionName: transaction.missionName,
        points: transaction.points,
        newTotal: group.score,
        timestamp: transaction.timestamp
      });

      // Send dedicated event to the specific group that got scored
      io.to(roomCode).emit('group_score_awarded', {
        groupId: group.id,
        points: transaction.points,
        missionName: transaction.missionName,
        newTotal: group.score
      });

      if (callback) callback({ success: true, transaction, group, state });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Admin changes room status ('active' | 'paused' | 'ended')
  socket.on('change_room_status', ({ roomId, status }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      const room = db.updateRoomStatus(roomCode, status);
      if (!room) {
        return callback && callback({ success: false, error: 'ไม่พบห้องกิจกรรม' });
      }

      const state = RoomManager.getFullRoomState(roomCode);
      io.to(roomCode).emit('room_state', state);
      io.to(roomCode).emit('room_status_changed', { status, room });

      if (status === 'ended') {
        const grandSummary = RoomManager.getGrandSummary(roomCode);
        io.to(roomCode).emit('grand_summary', grandSummary);
      }

      if (callback) callback({ success: true, room, state });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Admin resets room scores
  socket.on('reset_scores', ({ roomId }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      db.resetRoomScores(roomCode);
      const state = RoomManager.getFullRoomState(roomCode);
      io.to(roomCode).emit('room_state', state);
      io.to(roomCode).emit('scores_reset', { message: 'คะแนนทั้งหมดถูกรีเซ็ตแล้ว' });
      if (callback) callback({ success: true, state });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Admin updates group info (name/color/mascot)
  socket.on('update_group', ({ groupId, updates }, callback) => {
    try {
      const group = db.updateGroup(groupId, updates);
      if (!group) return callback && callback({ success: false, error: 'ไม่พบกลุ่ม' });

      const state = RoomManager.getFullRoomState(group.roomId);
      io.to(group.roomId).emit('room_state', state);
      if (callback) callback({ success: true, group });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  // Admin deletes a group
  socket.on('delete_group', ({ roomId, groupId }, callback) => {
    try {
      const roomCode = roomId.toUpperCase();
      db.deleteGroup(groupId);
      const state = RoomManager.getFullRoomState(roomCode);
      io.to(roomCode).emit('room_state', state);
      if (callback) callback({ success: true });
    } catch (err) {
      if (callback) callback({ success: false, error: err.message });
    }
  });

  socket.on('disconnect', () => {
    // disconnected
  });
});

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 [KRU SAUCE] Server running on port ${PORT}`);
  console.log(`🌐 Local URL: http://localhost:${PORT}`);
  console.log(`=========================================`);
});
