import { Link } from 'react-router-dom';

export default function Avatar({ user, size = 44, link = true }) {
  const el = (
    <span className="avatar" style={{ width: size, height: size, background: user.color, fontSize: size * 0.52 }}>
      {user.avatar}
    </span>
  );
  return link ? <Link to={`/u/${user.username}`} aria-label={user.name}>{el}</Link> : el;
}
