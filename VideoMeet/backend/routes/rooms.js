import { Router } from 'express';
import crypto from 'crypto';
import Meeting from '../models/Meeting.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.post('/', async (req, res, next) => {
  try {
    const title = (req.body.title || '').trim().slice(0, 60) || 'Untitled meeting';
    const meeting = await Meeting.create({ roomId: crypto.randomBytes(6).toString('hex'), title, host: req.user._id });
    res.status(201).json({ roomId: meeting.roomId, title: meeting.title });
  } catch (e) { next(e); }
});

router.get('/mine', async (req, res, next) => {
  try {
    const list = await Meeting.find({ host: req.user._id }).sort({ createdAt: -1 }).limit(8);
    res.json(list.map((m) => ({ roomId: m.roomId, title: m.title, createdAt: m.createdAt })));
  } catch (e) { next(e); }
});

router.get('/:roomId', async (req, res, next) => {
  try {
    const m = await Meeting.findOne({ roomId: req.params.roomId.toLowerCase() }).populate('host', 'name');
    if (!m) return res.status(404).json({ message: 'Meeting not found. Check the code and try again.' });
    res.json({ roomId: m.roomId, title: m.title, host: m.host?.name });
  } catch (e) { next(e); }
});

export default router;
