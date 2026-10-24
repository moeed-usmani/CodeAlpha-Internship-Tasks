import { initials } from '../utils.js';

export default function Avatar({ user, size = 32, online = false, title }) {
  if (!user) return <span className="avatar empty" style={{ width: size, height: size }} title="Unassigned">?</span>;
  return (
    <span className="avatar" title={title || user.name} style={{ width: size, height: size, fontSize: size * 0.38, background: `linear-gradient(135deg, ${user.color}, ${user.color}bb)` }}>
      {initials(user.name)}
      {online && <i className="online" />}
    </span>
  );
}
