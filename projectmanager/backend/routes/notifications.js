import { Router } from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get('/', async (req, res, next) => {
  try { res.json(await Notification.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(30).lean()); } catch (e) { next(e); }
});
router.post('/read-all', async (req, res, next) => {
  try { await Notification.updateMany({ user: req.user._id, read: false }, { read: true }); res.json({ ok: true }); } catch (e) { next(e); }
});
router.post('/:id/read', async (req, res, next) => {
  try { await Notification.updateOne({ _id: req.params.id, user: req.user._id }, { read: true }); res.json({ ok: true }); } catch (e) { next(e); }
});

export default router;
