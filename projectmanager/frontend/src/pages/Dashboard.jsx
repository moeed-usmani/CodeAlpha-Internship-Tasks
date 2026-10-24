import { useEffect, useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import ProjectCard from '../components/ProjectCard.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import CountUp from '../components/CountUp.jsx';
import { PRIORITY, dueInfo } from '../utils.js';

const greeting = () => { const h = new Date().getHours(); return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; };

export default function Dashboard() {
  const { user, socket } = useAuth();
  const nav = useNavigate();
  const [projects, setProjects] = useState(null);
  const [stats, setStats] = useState(null);
  const [mine, setMine] = useState([]);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(() => {
    api.projects().then(setProjects).catch((e) => { setError(e.message); setProjects([]); });
    api.stats().then(setStats).catch(() => {});
    api.mine().then(setMine).catch(() => {});
  }, []);
  useEffect(() => { load(); }, [load]);

  // Naye project me add ho jao to list refresh
  useEffect(() => {
    if (!socket) return undefined;
    socket.on('projects:changed', load);
    return () => { socket.off('projects:changed', load); };
  }, [socket, load]);

  const tiles = [
    ['📁', 'Projects', stats?.projects, '#6a4cff'],
    ['🎯', 'My open tasks', stats?.openTasks, '#2f9bff'],
    ['⏰', 'Due soon', stats?.dueSoon, '#ff7a59'],
    ['🏁', 'Completed', stats?.completed, '#12c2a4'],
  ];

  return (
    <main className="page">
      <motion.div className="hello" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}>
        <div>
          <p className="muted">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</p>
          <h1>{greeting()}, <span className="grad">{user.name.split(' ')[0]}</span> 👋</h1>
        </div>
        <button className="btn big" onClick={() => setCreating(true)}>＋ New project</button>
      </motion.div>

      <div className="stat-grid">
        {tiles.map(([icon, label, val, c], i) => (
          <motion.div key={label} className="stat glass" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 * i, type: 'spring', stiffness: 200, damping: 22 }}>
            <span className="stat-ico" style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}>{icon}</span>
            <div><b><CountUp to={val ?? 0} /></b><span>{label}</span></div>
          </motion.div>
        ))}
      </div>

      <div className="dash-grid">
        <section>
          <h2 className="sec-title">Your projects</h2>
          {error && <p className="error">⚠️ {error} — is the backend running?</p>}
          <div className="proj-grid">
            {projects === null && [0, 1, 2].map((i) => <div key={i} className="glass skeleton" style={{ height: 210 }} />)}
            {(projects || []).map((p, i) => <ProjectCard key={p._id} project={p} index={i} />)}
            {projects && (
              <motion.button className="pcard new" onClick={() => setCreating(true)} whileHover={{ y: -4 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <span>＋</span>Create a project
              </motion.button>
            )}
          </div>
        </section>
        <aside>
          <h2 className="sec-title">My focus</h2>
          <div className="focus glass">
            {!mine.length && <p className="muted pad">Nothing assigned to you. Enjoy the calm ☕</p>}
            {mine.map((t, i) => {
              const due = dueInfo(t.dueDate, false);
              return (
                <motion.div key={t._id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.05 }}>
                  <Link to={`/app/p/${t.project._id}?task=${t._id}`} className="focus-item">
                    <i style={{ background: PRIORITY[t.priority].color }} />
                    <span className="focus-text"><b>{t.title}</b><span className="muted small">{t.project.emoji} {t.project.name}</span></span>
                    {due && <span className={`chip due ${due.tone}`}>{due.label}</span>}
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </aside>
      </div>

      <AnimatePresence>
        {creating && <ProjectModal onClose={() => setCreating(false)} onSaved={(p) => nav(`/app/p/${p._id}`)} />}
      </AnimatePresence>
    </main>
  );
}
