import { Router } from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import { protect } from '../middleware/auth.js';
import { AUTHOR_FIELDS, shapePost } from '../utils/serialize.js';

const router = Router();
const COLORS = ['#ffffff', '#ffd23f', '#ff5fa2', '#3a86ff', '#06d6a0', '#ff7b3a', '#b794f6'];

// Feed: scope = all | following | explore (sab se zyada likes)
router.get('/', protect, async (req, res, next) => {
  try {
    const scope = req.query.scope || 'all';
    const filter = {};
    if (scope === 'following') filter.author = { $in: [...req.user.following, req.user._id] };
    let posts = await Post.find(filter).sort({ createdAt: -1 }).limit(scope === 'explore' ? 80 : 50).populate('author', AUTHOR_FIELDS).lean();
    if (scope === 'explore') posts = posts.sort((a, b) => (b.likes.length + b.commentCount) - (a.likes.length + a.commentCount)).slice(0, 30);
    res.json(posts.map((p) => shapePost(p, req.user._id)));
  } catch (e) { next(e); }
});

router.post('/', protect, async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    const image = (req.body.image || '').trim();
    if (!text && !image) return res.status(400).json({ message: 'Write something or add an image' });
    if (image && !/^https?:\/\//i.test(image)) return res.status(400).json({ message: 'Image must be an http(s) link' });
    const color = COLORS.includes(req.body.color) ? req.body.color : '#ffffff';
    const post = await Post.create({ author: req.user._id, text, image, color });
    const full = await Post.findById(post._id).populate('author', AUTHOR_FIELDS).lean();
    res.status(201).json(shapePost(full, req.user._id));
  } catch (e) { next(e); }
});

// Comment delete (route '/:id' se pehle rakha hai)
router.delete('/comments/:cid', protect, async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.cid);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    const post = await Post.findById(c.post);
    const mine = String(c.author) === String(req.user._id);
    const myPost = post && String(post.author) === String(req.user._id);
    if (!mine && !myPost) return res.status(403).json({ message: 'Not allowed' });
    await c.deleteOne();
    if (post) await Post.updateOne({ _id: post._id }, { $inc: { commentCount: -1 } });
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.delete('/:id', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    if (String(post.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your post' });
    await Comment.deleteMany({ post: post._id });
    await post.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/:id/like', protect, async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const liked = post.likes.some((id) => String(id) === String(req.user._id));
    await Post.updateOne({ _id: post._id }, { [liked ? '$pull' : '$addToSet']: { likes: req.user._id } });
    const fresh = await Post.findById(post._id);
    res.json({ liked: !liked, likes: fresh.likes.length });
  } catch (e) { next(e); }
});

router.get('/:id/comments', protect, async (req, res, next) => {
  try {
    res.json(await Comment.find({ post: req.params.id }).sort({ createdAt: 1 }).populate('author', AUTHOR_FIELDS).lean());
  } catch (e) { next(e); }
});

router.post('/:id/comments', protect, async (req, res, next) => {
  try {
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });
    const c = await Comment.create({ post: post._id, author: req.user._id, text });
    await Post.updateOne({ _id: post._id }, { $inc: { commentCount: 1 } });
    res.status(201).json(await Comment.findById(c._id).populate('author', AUTHOR_FIELDS).lean());
  } catch (e) { next(e); }
});

export default router;
