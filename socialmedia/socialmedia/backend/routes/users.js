import { Router } from 'express';
import User from '../models/User.js';
import Post from '../models/Post.js';
import { protect, optionalAuth } from '../middleware/auth.js';
import { AUTHOR_FIELDS, publicUser, shapePost } from '../utils/serialize.js';

const router = Router();
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Kis ko follow karein (jinhe abhi follow nahi kiya)
router.get('/suggestions', protect, async (req, res, next) => {
  try {
    const skip = [...req.user.following, req.user._id];
    const users = await User.find({ _id: { $nin: skip } }).sort({ createdAt: -1 }).limit(30);
    users.sort((a, b) => b.followers.length - a.followers.length);
    res.json(users.slice(0, 5).map((u) => publicUser(u)));
  } catch (e) { next(e); }
});

// Log dhoondo
router.get('/search', optionalAuth, async (req, res, next) => {
  try {
    const q = (req.query.q || '').trim();
    const filter = q ? { $or: [{ name: { $regex: esc(q), $options: 'i' } }, { username: { $regex: esc(q), $options: 'i' } }] } : {};
    const users = await User.find(filter).sort({ createdAt: -1 }).limit(24);
    const me = req.user ? String(req.user._id) : null;
    res.json(users.map((u) => ({ ...publicUser(u), isFollowing: me ? u.followers.some((f) => String(f) === me) : false, isMe: me === String(u._id) })));
  } catch (e) { next(e); }
});

// Apni profile edit
router.put('/me', protect, async (req, res, next) => {
  try {
    const { name, bio, avatar, color } = req.body;
    if (name !== undefined) { if (!name.trim()) return res.status(400).json({ message: 'Name cannot be empty' }); req.user.name = name.trim().slice(0, 40); }
    if (bio !== undefined) req.user.bio = String(bio).slice(0, 160);
    if (avatar) req.user.avatar = avatar;
    if (color) req.user.color = color;
    await req.user.save();
    res.json({ user: publicUser(req.user, { withEmail: true }) });
  } catch (e) { next(e); }
});

// Follow / unfollow (toggle)
router.post('/:id/follow', protect, async (req, res, next) => {
  try {
    const targetId = req.params.id;
    if (String(req.user._id) === targetId) return res.status(400).json({ message: "You can't follow yourself" });
    const target = await User.findById(targetId);
    if (!target) return res.status(404).json({ message: 'User not found' });
    const already = target.followers.some((f) => String(f) === String(req.user._id));
    const op = already ? '$pull' : '$addToSet';
    await User.updateOne({ _id: target._id }, { [op]: { followers: req.user._id } });
    await User.updateOne({ _id: req.user._id }, { [op]: { following: target._id } });
    const fresh = await User.findById(target._id);
    res.json({ following: !already, followersCount: fresh.followers.length });
  } catch (e) { next(e); }
});

// Followers / following list
router.get('/:username/people', optionalAuth, async (req, res, next) => {
  try {
    const type = req.query.type === 'following' ? 'following' : 'followers';
    const u = await User.findOne({ username: req.params.username.toLowerCase() }).populate(type, 'name username avatar color bio');
    if (!u) return res.status(404).json({ message: 'User not found' });
    res.json(u[type]);
  } catch (e) { next(e); }
});

// Profile + posts
router.get('/:username', optionalAuth, async (req, res, next) => {
  try {
    const u = await User.findOne({ username: req.params.username.toLowerCase() });
    if (!u) return res.status(404).json({ message: 'User not found' });
    const me = req.user ? String(req.user._id) : null;
    const posts = await Post.find({ author: u._id }).sort({ createdAt: -1 }).limit(50).populate('author', AUTHOR_FIELDS).lean();
    res.json({
      user: publicUser(u),
      isMe: me === String(u._id),
      isFollowing: me ? u.followers.some((f) => String(f) === me) : false,
      posts: posts.map((p) => shapePost(p, me)),
    });
  } catch (e) { next(e); }
});

export default router;
