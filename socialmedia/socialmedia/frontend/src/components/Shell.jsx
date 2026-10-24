import { NavLink, Link, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import Avatar from './Avatar.jsx';
import Cursor from './Cursor.jsx';

export default function Shell() {
  const { user, logout } = useAuth();
  const loc = useLocation();
  const items = [
    ['/home', '🏠', 'Home'],
    ['/explore', '🧭', 'Explore'],
    [`/u/${user.username}`, '🙋', 'Profile'],
  ];

  return (
    <div className="shell">
      <Cursor />
      <aside className="side">
        <Link to="/home" className="logo">ORBIT<span>★</span></Link>
        <nav>
          {items.map(([to, icon, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              <span className="nav-ico">{icon}</span>
              <span className="nav-label">{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="me card">
          <Avatar user={user} size={42} />
          <div className="me-info">
            <b>{user.name}</b>
            <span className="muted small">@{user.username}</span>
          </div>
          <button className="icon-btn" onClick={logout} title="Log out" aria-label="Log out">⎋</button>
        </div>
      </aside>
      <motion.main key={loc.pathname} className="main" initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <Outlet />
      </motion.main>
    </div>
  );
}
