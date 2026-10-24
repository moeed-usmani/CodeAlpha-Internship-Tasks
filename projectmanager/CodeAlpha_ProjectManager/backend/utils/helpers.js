import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Notification from '../models/Notification.js';
import Comment from '../models/Comment.js';

export const USER_FIELDS = 'name email color';

export const publicUser = (u) => ({ _id: u._id, name: u.name, email: u.email, color: u.color });

// User is project ka member hai? Haan to project return karo
export const getProjectFor = (projectId, userId) => Project.findOne({ _id: projectId, members: userId });

export const loadTasks = async (projectId) => {
  const tasks = await Task.find({ project: projectId }).sort({ order: 1, createdAt: 1 }).populate('assignee', USER_FIELDS).lean();
  const counts = await Comment.aggregate([
    { $match: { task: { $in: tasks.map((t) => t._id) } } },
    { $group: { _id: '$task', n: { $sum: 1 } } },
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.n]));
  return tasks.map((t) => ({ ...t, commentCount: map.get(String(t._id)) || 0 }));
};

// Poore project ke tasks sab connected members ko bhejo (real-time)
export const broadcastTasks = async (req, projectId, message = '') => {
  const io = req.app.get('io');
  const tasks = await loadTasks(projectId);
  io.to(`project:${projectId}`).emit('tasks:sync', {
    projectId: String(projectId),
    tasks,
    message,
    by: { _id: req.user._id, name: req.user.name },
  });
  return tasks;
};

export const notify = async (req, { user, type, text, project, task }) => {
  if (!user || String(user) === String(req.user._id)) return;
  const n = await Notification.create({ user, type, text, project, task });
  req.app.get('io').to(`user:${user}`).emit('notification', n.toObject());
};

// Task ko column me kisi task ke "pehle" (ya aakhir me) rakho aur order dobara likho
export const placeTask = async (task, status, beforeId) => {
  const oldStatus = task.status;
  const siblings = await Task.find({ project: task.project, status, _id: { $ne: task._id } }).sort({ order: 1, createdAt: 1 });
  let idx = beforeId ? siblings.findIndex((t) => String(t._id) === String(beforeId)) : -1;
  if (idx === -1) idx = siblings.length;
  siblings.splice(idx, 0, task);
  const ops = siblings.map((t, i) => ({
    updateOne: { filter: { _id: t._id }, update: { $set: { order: i, ...(String(t._id) === String(task._id) ? { status } : {}) } } },
  }));
  if (oldStatus !== status) {
    const old = await Task.find({ project: task.project, status: oldStatus, _id: { $ne: task._id } }).sort({ order: 1, createdAt: 1 });
    old.forEach((t, i) => ops.push({ updateOne: { filter: { _id: t._id }, update: { $set: { order: i } } } }));
  }
  await Task.bulkWrite(ops);
};
