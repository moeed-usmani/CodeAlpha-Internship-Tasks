import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { publicUser } from '../utils/helpers.js';

const router = Router();
const COLORS = ['#6a4cff', '#12c2a4', '#ff7a59', '#ff5d8f', '#2f9bff', '#f5a524', '#8b5cf6'];
const sign = (u) => ({ token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }), user: publicUser(u) });

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    res.status(201).json(sign(await User.create({ name, email, password, color })));
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: (req.body.email || '').toLowerCase().trim() });
    if (!user || !(await user.matches(req.body.password || ''))) return res.status(401).json({ message: 'Invalid email or password' });
    res.json(sign(user));
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user) }));

export default router;
