import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import roomRoutes from './routes/rooms.js';
import { initSocket } from './socket.js';

dotenv.config();
const app = express();
app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

app.get('/api/health', (_, res) => res.json({ ok: true }));
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

const server = http.createServer(app);
initSocket(server, process.env.CLIENT_URL);

const PORT = process.env.PORT || 5004;
mongoose.connect(process.env.MONGO_URI)
  .then(() => { console.log('MongoDB connected'); server.listen(PORT, () => console.log(`API + signaling server on http://localhost:${PORT}`)); })
  .catch((e) => { console.error('MongoDB connection failed:', e.message); process.exit(1); });
