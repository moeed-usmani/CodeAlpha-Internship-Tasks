import jwt from 'jsonwebtoken';
import Project from './models/Project.js';

const onlineUsers = async (io, projectId) => {
  const socks = await io.in(`project:${projectId}`).fetchSockets();
  return [...new Set(socks.map((s) => s.data.userId))];
};

export default function setupSockets(io) {
  io.use((socket, next) => {
    try {
      const { id } = jwt.verify(socket.handshake.auth?.token || '', process.env.JWT_SECRET);
      socket.data.userId = String(id);
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.data.userId}`);

    socket.on('project:join', async (projectId) => {
      try {
        const ok = await Project.exists({ _id: projectId, members: socket.data.userId });
        if (!ok) return;
        socket.join(`project:${projectId}`);
        io.to(`project:${projectId}`).emit('presence', { projectId, users: await onlineUsers(io, projectId) });
      } catch { /* ignore */ }
    });

    socket.on('project:leave', async (projectId) => {
      socket.leave(`project:${projectId}`);
      try { io.to(`project:${projectId}`).emit('presence', { projectId, users: await onlineUsers(io, projectId) }); } catch { /* ignore */ }
    });

    socket.on('disconnecting', () => {
      for (const room of socket.rooms) {
        if (!room.startsWith('project:')) continue;
        const projectId = room.slice(8);
        setTimeout(async () => {
          try { io.to(room).emit('presence', { projectId, users: await onlineUsers(io, projectId) }); } catch { /* ignore */ }
        }, 150);
      }
    });
  });
}
