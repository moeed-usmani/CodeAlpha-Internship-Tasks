import { Router } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { publicUser } from '../utils/serialize.js';

const router = Router();
const sign = (u) => ({
  token: jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' }),
  user: publicUser(u, { withEmail: true }),
});

router.post('/register', async (req, res, next) => {
  try {
    const { name, username, email, password } = req.body;
    if (!name || !username || !email || !password) return res.status(400).json({ message: 'All fields are required' });
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) return res.status(400).json({ message: 'Username: 3-20 letters, numbers or _' });
    if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });
    if (await User.findOne({ email: email.toLowerCase() })) return res.status(400).json({ message: 'Email already registered' });
    if (await User.findOne({ username: username.toLowerCase() })) return res.status(400).json({ message: 'Username already taken' });
    const emojis = ['😎', '🦄', '🔥', '🌈', '🚀', '🎧', '🍕', '👾', '🐯', '🌸'];
    const colors = ['#ffd23f', '#ff5fa2', '#3a86ff', '#06d6a0', '#ff7b3a', '#b794f6'];
    const pick = (a) => a[Math.floor(Math.random() * a.length)];
    const user = await User.create({ name, username, email, password, avatar: pick(emojis), color: pick(colors) });
    res.status(201).json(sign(user));
  } catch (e) { next(e); }
});

router.post('/login', async (req, res, next) => {
  try {
    const id = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ $or: [{ email: id }, { username: id }] });
    if (!user || !(await user.matches(req.body.password || ''))) return res.status(401).json({ message: 'Wrong email/username or password' });
    res.json(sign(user));
  } catch (e) { next(e); }
});

router.get('/me', protect, (req, res) => res.json({ user: publicUser(req.user, { withEmail: true }) }));

export default router;
