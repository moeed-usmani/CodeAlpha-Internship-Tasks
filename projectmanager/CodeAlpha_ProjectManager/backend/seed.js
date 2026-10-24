import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Comment from './models/Comment.js';
import Notification from './models/Notification.js';
dotenv.config();

await mongoose.connect(process.env.MONGO_URI);
await Promise.all([User, Project, Task, Comment, Notification].map((m) => m.deleteMany({})));

const mk = (name, email, color) => User.create({ name, email, password: 'password123', color });
const [amna, bilal, carla] = await Promise.all([
  mk('Amna Iqbal', 'amna@nimbus.dev', '#6a4cff'),
  mk('Bilal Ahmed', 'bilal@nimbus.dev', '#12c2a4'),
  mk('Carla Gomez', 'carla@nimbus.dev', '#ff7a59'),
]);

const launch = await Project.create({ name: 'Website Relaunch', description: 'New marketing site, faster and prettier.', emoji: '🚀', color: '#6a4cff', owner: amna._id, members: [amna._id, bilal._id, carla._id] });
const app = await Project.create({ name: 'Mobile App v2', description: 'Offline mode, dark theme, push notifications.', emoji: '📱', color: '#12c2a4', owner: bilal._id, members: [bilal._id, amna._id] });

const day = 86400e3;
const rows = [
  [launch, 'Design hero section', 'todo', 'high', amna, 2, ['design']],
  [launch, 'Write landing page copy', 'todo', 'medium', carla, 4, ['content']],
  [launch, 'Set up analytics', 'todo', 'low', bilal, 7, ['dev']],
  [launch, 'Build pricing page', 'progress', 'high', bilal, 1, ['dev', 'frontend']],
  [launch, 'Illustrations pack', 'progress', 'medium', carla, 3, ['design']],
  [launch, 'SEO audit', 'review', 'medium', amna, -1, ['seo']],
  [launch, 'Brand colour palette', 'done', 'low', amna, -5, ['design']],
  [launch, 'Pick a CMS', 'done', 'medium', bilal, -8, ['dev']],
  [app, 'Offline sync engine', 'progress', 'high', bilal, 3, ['backend']],
  [app, 'Dark theme tokens', 'todo', 'medium', amna, 5, ['design']],
  [app, 'Push notification service', 'todo', 'high', bilal, 6, ['backend']],
  [app, 'Onboarding flow', 'review', 'low', amna, 1, ['ux']],
  [app, 'App icon refresh', 'done', 'low', amna, -3, ['design']],
];
const order = {};
const tasks = [];
for (const [project, title, status, priority, assignee, due, labels] of rows) {
  const k = `${project._id}-${status}`;
  order[k] = (order[k] ?? -1) + 1;
  tasks.push(await Task.create({ project: project._id, title, status, priority, assignee: assignee._id, dueDate: new Date(Date.now() + due * day), labels, order: order[k], createdBy: amna._id }));
}
await Comment.create({ task: tasks[3]._id, project: launch._id, author: amna._id, text: 'Can we show the yearly discount toggle here too?' });
await Comment.create({ task: tasks[3]._id, project: launch._id, author: bilal._id, text: 'Yep, adding it now 👍' });
await Notification.create({ user: amna._id, type: 'assign', text: 'Bilal Ahmed assigned you “Dark theme tokens”', project: app._id, task: tasks[9]._id });

console.log('Seeded! Demo logins (password: password123): amna@nimbus.dev, bilal@nimbus.dev, carla@nimbus.dev');
process.exit(0);
