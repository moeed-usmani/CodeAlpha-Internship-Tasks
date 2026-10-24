export const EMOJIS = ['😎', '🦄', '🔥', '🌈', '🚀', '🎧', '🍕', '👾', '🐯', '🌸', '🐼', '🦊', '🍉', '⚡', '🪐', '🎨'];
export const COLORS = ['#ffd23f', '#ff5fa2', '#3a86ff', '#06d6a0', '#ff7b3a', '#b794f6'];
export const POST_COLORS = ['#ffffff', ...COLORS];

export const timeAgo = (date) => {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};
