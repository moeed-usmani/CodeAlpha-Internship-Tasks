import { Router } from 'express';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Comment from '../models/Comment.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { USER_FIELDS, getProjectFor, loadTasks, broadcastTasks, notify } from '../utils/helpers.js';

const router = Router();
router.use(protect);

// Dashboard: mere projects + progress
router.get('/', async (req, res, next) => {
  try {
    const projects = await Project.find({ members: req.user._id }).sort({ updatedAt: -1 }).populate('members', USER_FIELDS).lean();
    const counts = await Task.aggregate([
      { $match: { project: { $in: projects.map((p) => p._id) } } },
      { $group: { _id: { project: '$project', status: '$status' }, n: { $sum: 1 } } },
    ]);
    const stats = {};
    counts.forEach(({ _id, n }) => {
      const k = String(_id.project);
      stats[k] = stats[k] || { total: 0, done: 0 };
      stats[k].total += n;
      if (_id.status === 'done') stats[k].done += n;
    });
    res.json(projects.map((p) => ({ ...p, stats: stats[String(p._id)] || { total: 0, done: 0 } })));
  } catch (e) { next(e); }
});

// Dashboard numbers (/:id se pehle)
router.get('/stats/me', async (req, res, next) => {
  try {
    const projectIds = (await Project.find({ members: req.user._id }).select('_id')).map((p) => p._id);
    const mine = await Task.find({ project: { $in: projectIds }, assignee: req.user._id }).select('status dueDate').lean();
    const open = mine.filter((t) => t.status !== 'done');
    const soon = Date.now() + 3 * 86400e3;
    res.json({
      projects: projectIds.length,
      openTasks: open.length,
      dueSoon: open.filter((t) => t.dueDate && new Date(t.dueDate).getTime() <= soon).length,
      completed: mine.length - open.length,
    });
  } catch (e) { next(e); }
});

router.post('/', async (req, res, next) => {
  try {
    const { name, description = '', emoji = '🚀', color = '#6a4cff' } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Project name is required' });
    const project = await Project.create({ name: name.trim(), description, emoji, color, owner: req.user._id, members: [req.user._id] });
    const starter = [
      ['Welcome to your board 👋', 'todo', 'Drag me to another column!'],
      ['Invite your teammates', 'todo', 'Use the Invite button at the top of the board.'],
    ];
    await Task.insertMany(starter.map(([title, status, description], order) => ({ project: project._id, title, status, description, order, createdBy: req.user._id })));
    res.status(201).json(await Project.findById(project._id).populate('members', USER_FIELDS).lean());
  } catch (e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const project = await Project.findOne({ _id: req.params.id, members: req.user._id }).populate('members', USER_FIELDS).lean();
    if (!project) return res.status(404).json({ message: 'Project not found' });
    res.json({ project, tasks: await loadTasks(project._id) });
  } catch (e) { next(e); }
});

router.put('/:id', async (req, res, next) => {
  try {
    const project = await getProjectFor(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (String(project.owner) !== String(req.user._id)) return res.status(403).json({ message: 'Only the owner can edit the project' });
    ['name', 'description', 'emoji', 'color'].forEach((k) => { if (req.body[k] !== undefined) project[k] = req.body[k]; });
    await project.save();
    const full = await Project.findById(project._id).populate('members', USER_FIELDS).lean();
    req.app.get('io').to(`project:${project._id}`).emit('project:updated', full);
    res.json(full);
  } catch (e) { next(e); }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const project = await getProjectFor(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    if (String(project.owner) !== String(req.user._id)) return res.status(403).json({ message: 'Only the owner can delete the project' });
    await Promise.all([Task.deleteMany({ project: project._id }), Comment.deleteMany({ project: project._id }), Notification.deleteMany({ project: project._id })]);
    req.app.get('io').to(`project:${project._id}`).emit('project:deleted', { projectId: String(project._id) });
    await project.deleteOne();
    res.json({ ok: true });
  } catch (e) { next(e); }
});

// Teammate ko email se invite karo (wo pehle se sign up hona chahiye)
router.post('/:id/members', async (req, res, next) => {
  try {
    const project = await getProjectFor(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const email = (req.body.email || '').toLowerCase().trim();
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'No account with that email. Ask them to sign up first.' });
    if (project.members.some((m) => String(m) === String(user._id))) return res.status(400).json({ message: 'Already a member' });
    project.members.push(user._id);
    await project.save();
    await notify(req, { user: user._id, type: 'invite', text: `${req.user.name} added you to “${project.name}”`, project: project._id });
    const full = await Project.findById(project._id).populate('members', USER_FIELDS).lean();
    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('project:updated', full);
    io.to(`user:${user._id}`).emit('projects:changed');
    res.status(201).json(full);
  } catch (e) { next(e); }
});

router.delete('/:id/members/:uid', async (req, res, next) => {
  try {
    const project = await getProjectFor(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const isOwner = String(project.owner) === String(req.user._id);
    const self = String(req.params.uid) === String(req.user._id);
    if (String(req.params.uid) === String(project.owner)) return res.status(400).json({ message: 'The owner cannot be removed' });
    if (!isOwner && !self) return res.status(403).json({ message: 'Not allowed' });
    project.members = project.members.filter((m) => String(m) !== String(req.params.uid));
    await project.save();
    await Task.updateMany({ project: project._id, assignee: req.params.uid }, { $set: { assignee: null } });
    const full = await Project.findById(project._id).populate('members', USER_FIELDS).lean();
    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('project:updated', full);
    io.to(`user:${req.params.uid}`).emit('projects:changed');
    await broadcastTasks(req, project._id);
    res.json(full);
  } catch (e) { next(e); }
});

export default router;
