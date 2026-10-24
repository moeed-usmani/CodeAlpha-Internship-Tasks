export const COLUMNS = [
  { key: 'todo', title: 'To do', color: '#8a94ff', emoji: '📝' },
  { key: 'progress', title: 'In progress', color: '#ffb020', emoji: '⚡' },
  { key: 'review', title: 'In review', color: '#c06bff', emoji: '👀' },
  { key: 'done', title: 'Done', color: '#12c2a4', emoji: '✅' },
];
export const PRIORITY = { high: { label: 'High', color: '#ff5d73' }, medium: { label: 'Medium', color: '#ffb020' }, low: { label: 'Low', color: '#12c2a4' } };
export const PROJECT_COLORS = ['#6a4cff', '#2f9bff', '#12c2a4', '#ff7a59', '#ff5d8f', '#f5a524'];
export const PROJECT_EMOJIS = ['🚀', '📱', '🎨', '🛒', '📊', '🧪', '🌱', '🎬', '📚', '⚙️', '💡', '🏆'];

export const initials = (name = '') => name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();

export const timeAgo = (d) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(d).getTime()) / 1000));
  if (s < 60) return 'just now';
  const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
};

export const dueInfo = (date, done) => {
  if (!date) return null;
  const d = new Date(date); d.setHours(0, 0, 0, 0);
  const t = new Date(); t.setHours(0, 0, 0, 0);
  const diff = Math.round((d - t) / 86400e3);
  const label = diff === 0 ? 'Today' : diff === 1 ? 'Tomorrow' : diff === -1 ? 'Yesterday' : d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  const tone = done ? 'ok' : diff < 0 ? 'late' : diff <= 1 ? 'soon' : 'ok';
  return { label, tone };
};

export const toInputDate = (d) => (d ? new Date(d).toISOString().slice(0, 10) : '');

// Task ko status me beforeId ke pehle rakho (UI me turant dikhane ke liye)
export const applyMove = (tasks, id, status, beforeId) => {
  const moving = tasks.find((t) => t._id === id);
  if (!moving) return tasks;
  const rest = tasks.filter((t) => t._id !== id);
  const out = [];
  COLUMNS.forEach((c) => {
    const col = rest.filter((t) => t.status === c.key).sort((a, b) => a.order - b.order);
    if (c.key === status) {
      let idx = beforeId ? col.findIndex((t) => t._id === beforeId) : -1;
      if (idx === -1) idx = col.length;
      col.splice(idx, 0, { ...moving, status });
    }
    col.forEach((t, i) => out.push({ ...t, order: i }));
  });
  return out;
};
