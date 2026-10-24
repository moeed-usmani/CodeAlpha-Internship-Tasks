import { useEffect, useRef, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { timeAgo } from '../utils.js';
import Avatar from './Avatar.jsx';

const ICON = { assign: '🎯', comment: '💬', invite: '🤝', done: '🎉', move: '↔️', info: '🔔' };

export default function Navbar() {
  const { user, socket, logout } = useAuth();
  const { toast } = useUI();
  const nav = useNavigate();
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const [menu, setMenu] = useState(false);
  const box = useRef(null);
  const unread = items.filter((n) => !n.read).length;

  const load = useCallback(() => {
    api.notifications().then(setItems).catch(() => {});
  }, []);

  useEffect(() => { load(); }, [load]);

  // Real-time notification
  useEffect(() => {
    if (!socket) return undefined;
    const onNote = (n) => {
      setItems((l) => [n, ...l]);
      toast(n.text, ICON[n.type] || '🔔');
    };
    socket.on('notification', onNote);
    return () => { socket.off('notification', onNote); };
  }, [socket, toast]);

  useEffect(() => {
    const close = (e) => { if (box.current && !box.current.contains(e.target)) { setOpen(false); setMenu(false); } };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const go = async (n) => {
    setOpen(false);
    if (!n.read) { setItems((l) => l.map((x) => (x._id === n._id ? { ...x, read: true } : x))); api.readOne(n._id).catch(() => {}); }
    if (n.project) nav(`/app/p/${n.project}${n.task ? `?task=${n.task}` : ''}`);
  };
  const readAll = () => { setItems((l) => l.map((x) => ({ ...x, read: true }))); api.readAll().catch(() => {}); };

  return (
    <header className="topbar glass">
      <Link to="/app" className="brand"><span className="brand-mark">☁️</span> Nimbus</Link>
      <div className="topbar-right" ref={box}>
        <div className="pop-wrap">
          <button className="icon-btn bell" onClick={() => { setOpen((v) => !v); setMenu(false); }} aria-label="Notifications">
            🔔
            {unread > 0 && <motion.b key={unread} className="dot-badge" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500 }}>{unread}</motion.b>}
          </button>
          <AnimatePresence>
            {open && (
              <motion.div className="pop glass notif" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <div className="pop-head"><b>Notifications</b>{unread > 0 && <button className="link" onClick={readAll}>Mark all read</button>}</div>
                {!items.length && <p className="muted pad">You're all caught up ✨</p>}
                <div className="notif-list">
                  {items.map((n) => (
                    <button key={n._id} className={`notif-item ${n.read ? '' : 'unread'}`} onClick={() => go(n)}>
                      <span className="notif-ico">{ICON[n.type] || '🔔'}</span>
                      <span><span className="notif-text">{n.text}</span><span className="muted small">{timeAgo(n.createdAt)}</span></span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <div className="pop-wrap">
          <button className="me-btn" onClick={() => { setMenu((v) => !v); setOpen(false); }}>
            <Avatar user={user} size={34} /><span className="me-name">{user.name.split(' ')[0]}</span>
          </button>
          <AnimatePresence>
            {menu && (
              <motion.div className="pop glass menu" initial={{ opacity: 0, y: -10, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
                <div className="menu-user"><b>{user.name}</b><span className="muted small">{user.email}</span></div>
                <button className="menu-item" onClick={logout}>↩ Log out</button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
