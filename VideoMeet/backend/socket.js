import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import User from './models/User.js';
import Meeting from './models/Meeting.js';

// In-memory room state. Chat / whiteboard payloads are AES-GCM ciphertext created in the
// browsers; the server only relays and buffers opaque bytes and never sees the key.
const rooms = new Map(); // roomId -> { users: Map<socketId,{user,state}>, board: [], chat: [] }
const MAX_USERS = 8;
const MAX_CHAT = 100;
const MAX_BOARD = 4000;

export function initSocket(httpServer, clientUrl) {
  const io = new Server(httpServer, {
    cors: { origin: clientUrl || '*' },
    maxHttpBufferSize: 15e6, // ~15 MB (files are capped at 10 MB client-side)
  });

  io.use(async (socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth?.token || '', process.env.JWT_SECRET);
      const u = await User.findById(id).select('name');
      if (!u) return next(new Error('Unauthorized'));
      socket.data.user = { id: String(u._id), name: u.name };
      next();
    } catch { next(new Error('Unauthorized')); }
  });

  io.on('connection', (socket) => {
    let roomId = null;

    const leave = () => {
      if (!roomId) return;
      const room = rooms.get(roomId);
      socket.leave(roomId);
      if (room) {
        room.users.delete(socket.id);
        socket.to(roomId).emit('user-left', { id: socket.id });
        if (!room.users.size) rooms.delete(roomId);
      }
      roomId = null;
    };

    socket.on('join-room', async (payload, ack) => {
      const reply = typeof ack === 'function' ? ack : () => {};
      try {
        if (roomId) return reply({ error: 'Already in a room' });
        const id = String(payload?.roomId || '').toLowerCase();
        if (!(await Meeting.exists({ roomId: id }))) return reply({ error: 'Meeting not found' });
        let room = rooms.get(id);
        if (!room) { room = { users: new Map(), board: [], chat: [] }; rooms.set(id, room); }
        if (room.users.size >= MAX_USERS) return reply({ error: `Room is full (max ${MAX_USERS} people)` });

        const state = { mic: true, cam: true, screen: false };
        const others = [...room.users].map(([sid, v]) => ({ id: sid, user: v.user, state: v.state }));
        room.users.set(socket.id, { user: socket.data.user, state });
        roomId = id;
        socket.join(id);
        socket.to(id).emit('user-joined', { id: socket.id, user: socket.data.user, state });
        reply({ you: socket.id, users: others, board: room.board, chat: room.chat });
      } catch (e) {
        console.error(e);
        reply({ error: 'Could not join the meeting' });
      }
    });

    // WebRTC signaling relay (offer / answer / ICE)
    socket.on('signal', ({ to, data } = {}) => {
      const room = roomId && rooms.get(roomId);
      if (room && room.users.has(to)) io.to(to).emit('signal', { from: socket.id, data });
    });

    socket.on('media-state', (state = {}) => {
      const room = roomId && rooms.get(roomId);
      const me = room?.users.get(socket.id);
      if (!me) return;
      me.state = { mic: !!state.mic, cam: !!state.cam, screen: !!state.screen };
      socket.to(roomId).emit('media-state', { id: socket.id, state: me.state });
    });

    socket.on('chat', ({ payload } = {}) => {
      const room = roomId && rooms.get(roomId);
      if (!room || !payload) return;
      const msg = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, from: { id: socket.id, name: socket.data.user.name }, ts: Date.now(), payload };
      room.chat.push(msg);
      if (room.chat.length > MAX_CHAT) room.chat.shift();
      io.to(roomId).emit('chat', msg);
    });

    socket.on('file', ({ meta, data } = {}) => {
      if (!roomId || !meta || !data) return;
      socket.to(roomId).emit('file', { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, from: { id: socket.id, name: socket.data.user.name }, ts: Date.now(), meta, data });
    });

    socket.on('board-draw', ({ payload } = {}) => {
      const room = roomId && rooms.get(roomId);
      if (!room || !payload) return;
      room.board.push(payload);
      if (room.board.length > MAX_BOARD) room.board.shift();
      socket.to(roomId).emit('board-draw', { payload });
    });

    socket.on('board-clear', () => {
      const room = roomId && rooms.get(roomId);
      if (!room) return;
      room.board = [];
      socket.to(roomId).emit('board-clear');
    });

    socket.on('leave-room', leave);
    socket.on('disconnect', leave);
  });

  return io;
}
