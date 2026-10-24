import { Router } from 'express';
import Task, { STATUSES } from '../models/Task.js';
import Comment from '../models/Comment.js';
import Project from '../models/Project.js';
import { protect } from '../middleware/auth.js';
import { USER_FIELDS, getProjectFor, broadcastTasks, notify, placeTask } from '../utils/helpers.js';

const router = Router();
router.use(protect);

const isMember = (project, userId) => project.members.some((m) => String(m) === String(userId));
const cleanLabels = (l) => (Array.isArray(l) ? l.map((x) => String(x).trim()).filter(Boolean).slice(0, 5) : []);

// Mere open tasks (dashboard "My focus")
router.get('/tasks/mine', async (req, res, next) => {
  try {
    const projectIds = (await Project.find({ members: req.user._id }).select('_id')).map((p) => p._id);
    const tasks = await Task.find({ project: { $in: projectIds }, assignee: req.user._id, status: { $ne: 'done' } })
      .populate('project', 'name emoji color').lean();
    tasks.sort((a, b) => (a.dueDate ? new Date(a.dueDate).getTime() : Infinity) - (b.dueDate ? new Date(b.dueDate).getTime() : Infinity));
    res.json(tasks.slice(0, 8));
  } catch (e) { next(e); }
});

router.post('/projects/:id/tasks', async (req, res, next) => {
  try {
    const project = await getProjectFor(req.params.id, req.user._id);
    if (!project) return res.status(404).json({ message: 'Project not found' });
    const title = (req.body.title || '').trim();
    if (!title) return res.status(400).json({ message: 'Task title is required' });
    const status = STATUSES.includes(req.body.status) ? req.body.status : 'todo';
    const assignee = req.body.assignee && isMember(project, req.body.assignee) ? req.body.assignee : null;
    const order = await Task.countDocuments({ project: project._id, status });
    const task = await Task.create({
      project: project._id, title, status, order, assignee,
      description: req.body.description || '',
      priority: ['low', 'medium', 'high'].includes(req.body.priority) ? req.body.priority : 'medium',
      dueDate: req.body.dueDate || null,
      labels: cleanLabels(req.body.labels),
      createdBy: req.user._id,
    });
    await notify(req, { user: assignee, type: 'assign', text: `${req.user.name} assigned you “${title}”`, project: project._id, task: task._id });
    await broadcastTasks(req, project._id, `${req.user.name} added “${title}”`);
    res.status(201).json(await Task.findById(task._id).populate('assignee', USER_FIELDS).lean());
  } catch (e) { next(e); }
});

router.get('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('assignee', USER_FIELDS).lean();
    if (!task || !(await getProjectFor(task.project, req.user._id))) return res.status(404).json({ message: 'Task not found' });
    const comments = await Comment.find({ task: task._id }).sort({ createdAt: 1 }).populate('author', USER_FIELDS).lean();
    res.json({ task, comments });
  } catch (e) { next(e); }
});

router.put('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const project = task && (await getProjectFor(task.project, req.user._id));
    if (!task || !project) return res.status(404).json({ message: 'Task not found' });
    const b = req.body;
    if (b.title !== undefined) { if (!String(b.title).trim()) return res.status(400).json({ message: 'Title cannot be empty' }); task.title = String(b.title).trim(); }
    if (b.description !== undefined) task.description = b.description;
    if (b.priority && ['low', 'medium', 'high'].includes(b.priority)) task.priority = b.priority;
    if (b.dueDate !== undefined) task.dueDate = b.dueDate || null;
    if (b.labels !== undefined) task.labels = cleanLabels(b.labels);
    let newAssignee = null;
    if (b.assignee !== undefined) {
      const picked = b.assignee && isMember(project, b.assignee) ? b.assignee : null;
      if (String(picked || '') !== String(task.assignee || '')) newAssignee = picked;
      task.assignee = picked;
    }
    await task.save();
    if (newAssignee) await notify(req, { user: newAssignee, type: 'assign', text: `${req.user.name} assigned you “${task.title}”`, project: project._id, task: task._id });
    await broadcastTasks(req, project._id, `${req.user.name} updated “${task.title}”`);
    res.json(await Task.findById(task._id).populate('assignee', USER_FIELDS).lean());
  } catch (e) { next(e); }
});

// Drag & drop: status + kis card ke pehle (beforeId, null = aakhir me)
router.put('/tasks/:id/move', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const project = task && (await getProjectFor(task.project, req.user._id));
    if (!task || !project) return res.status(404).json({ message: 'Task not found' });
    const status = req.body.status;
    if (!STATUSES.includes(status)) return res.status(400).json({ message: 'Invalid status' });
    const changed = task.status !== status;
    await placeTask(task, status, req.body.beforeId);
    if (changed && status === 'done' && task.createdBy) await notify(req, { user: task.createdBy, type: 'done', text: `${req.user.name} completed “${task.title}” 🎉`, project: project._id, task: task._id });
    if (changed && task.assignee) await notify(req, { user: task.assignee, type: 'move', text: `${req.user.name} moved “${task.title}” to ${status}`, project: project._id, task: task._id });
    const tasks = await broadcastTasks(req, project._id, changed ? `${req.user.name} moved “${task.title}”` : '');
    res.json({ tasks });
  } catch (e) { next(e); }
});

router.delete('/tasks/:id', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const project = task && (await getProjectFor(task.project, req.user._id));
    if (!task || !project) return res.status(404).json({ message: 'Task not found' });
    await Comment.deleteMany({ task: task._id });
    await task.deleteOne();
    await broadcastTasks(req, project._id, `${req.user.name} deleted “${task.title}”`);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

router.post('/tasks/:id/comments', async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    const project = task && (await getProjectFor(task.project, req.user._id));
    if (!task || !project) return res.status(404).json({ message: 'Task not found' });
    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ message: 'Comment cannot be empty' });
    const c = await Comment.create({ task: task._id, project: project._id, author: req.user._id, text });
    const comment = await Comment.findById(c._id).populate('author', USER_FIELDS).lean();
    for (const u of new Set([String(task.assignee || ''), String(task.createdBy || '')])) {
      if (u) await notify(req, { user: u, type: 'comment', text: `${req.user.name} commented on “${task.title}”`, project: project._id, task: task._id });
    }
    const io = req.app.get('io');
    io.to(`project:${project._id}`).emit('comment:added', { projectId: String(project._id), taskId: String(task._id), comment });
    await broadcastTasks(req, project._id);
    res.status(201).json(comment);
  } catch (e) { next(e); }
});

router.delete('/comments/:cid', async (req, res, next) => {
  try {
    const c = await Comment.findById(req.params.cid);
    if (!c) return res.status(404).json({ message: 'Comment not found' });
    if (String(c.author) !== String(req.user._id)) return res.status(403).json({ message: 'Not your comment' });
    await c.deleteOne();
    req.app.get('io').to(`project:${c.project}`).emit('comment:deleted', { taskId: String(c.task), commentId: String(c._id) });
    await broadcastTasks(req, c.project);
    res.json({ ok: true });
  } catch (e) { next(e); }
});

export default router;
