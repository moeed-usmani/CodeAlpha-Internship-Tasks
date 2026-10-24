import { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useParams, Link, useNavigate, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { COLUMNS, applyMove } from '../utils.js';
import TaskCard from '../components/TaskCard.jsx';
import TaskModal from '../components/TaskModal.jsx';
import ProjectModal from '../components/ProjectModal.jsx';
import InviteModal from '../components/InviteModal.jsx';
import Avatar from '../components/Avatar.jsx';
import Confetti from '../components/Confetti.jsx';

export default function Board() {
  const { id } = useParams();
  const nav = useNavigate();
  const [params, setParams] = useSearchParams();
  const { user, socket } = useAuth();
  const { toast } = useUI();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [online, setOnline] = useState([]);
  const [error, setError] = useState('');
  const [connected, setConnected] = useState(false);
  const [dragId, setDragId] = useState(null);
  const [over, setOver] = useState(null); // { status, beforeId }
  const [adding, setAdding] = useState(null);
  const [draft, setDraft] = useState('');
  const [q, setQ] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [prio, setPrio] = useState('all');
  const [modal, setModal] = useState(null); // 'edit' | 'team'
  const [confetti, setConfetti] = useState(0);
  const tasksRef = useRef([]);
  tasksRef.current = tasks;
  const openId = params.get('task');

  useEffect(() => {
    let live = true;
    setProject(null); setError('');
    api.project(id).then((d) => { if (live) { setProject(d.project); setTasks(d.tasks); } }).catch((e) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [id]);

  // WebSocket: room join + live events
  useEffect(() => {
    if (!socket) return undefined;
    const join = () => { setConnected(true); socket.emit('project:join', id); };
    const sync = (p) => {
      if (p.projectId !== id) return;
      setTasks(p.tasks);
      if (p.message && p.by?._id !== user._id) toast(p.message, '⚡');
    };
    const presence = (p) => { if (p.projectId === id) setOnline(p.users); };
    const updated = (p) => { if (p._id === id) setProject(p); };
    const deleted = (p) => { if (p.projectId === id) { toast('This project was deleted', '🗑'); nav('/app'); } };
    const drop = () => setConnected(false);
    socket.on('connect', join);
    socket.on('disconnect', drop);
    socket.on('tasks:sync', sync);
    socket.on('presence', presence);
    socket.on('project:updated', updated);
    socket.on('project:deleted', deleted);
    if (socket.connected) join();
    return () => {
      socket.emit('project:leave', id);
      socket.off('connect', join);
      socket.off('disconnect', drop);
      socket.off('tasks:sync', sync);
      socket.off('presence', presence);
      socket.off('project:updated', updated);
      socket.off('project:deleted', deleted);
    };
  }, [socket, id, user._id, toast, nav]);

  const closeTask = useCallback(() => setParams({}, { replace: true }), [setParams]);

  const match = useCallback((t) => {
    if (onlyMine && t.assignee?._id !== user._id) return false;
    if (prio !== 'all' && t.priority !== prio) return false;
    if (q && !t.title.toLowerCase().includes(q.toLowerCase()) && !(t.labels || []).some((l) => l.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }, [onlyMine, prio, q, user._id]);

  const byCol = useMemo(() => {
    const m = {};
    COLUMNS.forEach((c) => { m[c.key] = tasks.filter((t) => t.status === c.key).sort((a, b) => a.order - b.order); });
    return m;
  }, [tasks]);

  const move = useCallback(async (taskId, status, beforeId = null) => {
    const prev = tasksRef.current;
    const task = prev.find((t) => t._id === taskId);
    if (!task) return;
    setTasks(applyMove(prev, taskId, status, beforeId));
    if (status === 'done' && task.status !== 'done') { setConfetti((c) => c + 1); setTimeout(() => setConfetti(0), 2000); }
    try { await api.moveTask(taskId, { status, beforeId }); } catch (e) { setTasks(prev); toast(e.message, '⚠️'); }
  }, [toast]);

  // Drag over column: kis card ke pehle girana hai?
  const onColOver = (e, status) => {
    e.preventDefault();
    const cards = [...e.currentTarget.querySelectorAll('.task-card')].filter((el) => el.dataset.id !== dragId);
    let beforeId = null;
    for (const el of cards) {
      const r = el.getBoundingClientRect();
      if (e.clientY < r.top + r.height / 2) { beforeId = el.dataset.id; break; }
    }
    setOver((o) => (o && o.status === status && o.beforeId === beforeId ? o : { status, beforeId }));
  };
  const onDrop = (e, status) => {
    e.preventDefault();
    const taskId = dragId || e.dataTransfer.getData('text/plain');
    const target = over && over.status === status ? over : { beforeId: null };
    setDragId(null); setOver(null);
    if (taskId) move(taskId, status, target.beforeId);
  };

  const addTask = async (e, status) => {
    e.preventDefault();
    const title = draft.trim();
    if (!title) return;
    setDraft(''); setAdding(null);
    try { await api.createTask(id, { title, status }); } catch (err) { toast(err.message, '⚠️'); }
  };

  if (error) return <main className="page"><div className="glass empty"><span className="big-emoji">🛸</span><h2>{error}</h2><Link to="/app" className="btn">Back to dashboard</Link></div></main>;
  if (!project) return <main className="page"><div className="glass skeleton" style={{ height: 120 }} /><div className="board" style={{ marginTop: 20 }}>{[0, 1, 2, 3].map((i) => <div key={i} className="col glass skeleton" style={{ height: 360 }} />)}</div></main>;

  const isOwner = String(project.owner) === String(user._id);
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === 'done').length;

  return (
    <main className="page board-page">
      <div className="board-head glass" style={{ '--pc': project.color }}>
        <div className="bh-left">
          <Link to="/app" className="icon-btn back" aria-label="Back">←</Link>
          <span className="bh-emoji" style={{ background: `linear-gradient(135deg, ${project.color}, ${project.color}99)` }}>{project.emoji}</span>
          <div>
            <h1>{project.name}</h1>
            <p className="muted small">{project.description || 'No description'} · {done}/{total} done</p>
          </div>
        </div>
        <div className="bh-right">
          <span className={`live-pill ${connected ? 'on' : ''}`}><i className="live" />{connected ? 'Live' : 'Connecting…'}</span>
          <button className="stack member-stack" onClick={() => setModal('team')} aria-label="Team">
            {project.members.slice(0, 5).map((m) => <Avatar key={m._id} user={m} size={32} online={online.includes(m._id)} />)}
          </button>
          <button className="btn ghost" onClick={() => setModal('team')}>＋ Invite</button>
          {isOwner && <button className="icon-btn" onClick={() => setModal('edit')} aria-label="Project settings">⚙️</button>}
        </div>
        <div className="progress-line"><motion.i initial={{ width: 0 }} animate={{ width: `${total ? (done / total) * 100 : 0}%` }} transition={{ duration: 0.8 }} /></div>
      </div>

      <div className="filters">
        <input className="input" placeholder="🔍 Search tasks or labels…" value={q} onChange={(e) => setQ(e.target.value)} />
        <button className={`pill ${onlyMine ? 'on' : ''}`} onClick={() => setOnlyMine((v) => !v)}>🙋 Only mine</button>
        <select className="input sel" value={prio} onChange={(e) => setPrio(e.target.value)}>
          <option value="all">All priorities</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
      </div>

      <div className="board">
        {COLUMNS.map((c) => {
          const list = byCol[c.key].filter(match);
          const isOver = over && over.status === c.key && dragId;
          return (
            <section key={c.key} className={`col glass ${isOver ? 'over' : ''}`} style={{ '--cc': c.color }}
              onDragOver={(e) => onColOver(e, c.key)} onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(null); }} onDrop={(e) => onDrop(e, c.key)}>
              <header className="col-head">
                <span className="col-dot" />
                <h3>{c.title}</h3>
                <span className="count">{byCol[c.key].length}</span>
                <button className="icon-btn add" onClick={() => { setAdding(c.key); setDraft(''); }} aria-label={`Add task to ${c.title}`}>＋</button>
              </header>
              <div className="col-body">
                <AnimatePresence initial={false}>
                  {list.map((t) => (
                    <div key={t._id} className="slot">
                      {isOver && over.beforeId === t._id && <div className="drop-line" />}
                      <TaskCard task={t} dragging={dragId === t._id} onOpen={(tid) => setParams({ task: tid })} onDragStart={setDragId} onDragEnd={() => { setDragId(null); setOver(null); }} />
                    </div>
                  ))}
                </AnimatePresence>
                {isOver && over.beforeId === null && <div className="drop-line" />}
                {!list.length && !isOver && <p className="col-empty">{byCol[c.key].length ? 'No matches' : 'Drop tasks here'}</p>}
                {adding === c.key && (
                  <form className="quick-add" onSubmit={(e) => addTask(e, c.key)}>
                    <input className="input" autoFocus placeholder="Task title…" value={draft} maxLength={140} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === 'Escape') setAdding(null); }} />
                    <div className="qa-row"><button className="btn small">Add</button><button type="button" className="btn small ghost" onClick={() => setAdding(null)}>Cancel</button></div>
                  </form>
                )}
              </div>
            </section>
          );
        })}
      </div>

      {confetti > 0 && <Confetti key={confetti} />}
      <AnimatePresence>
        {openId && <TaskModal key={openId} taskId={openId} project={project} onClose={closeTask} onMove={move} />}
        {modal === 'edit' && <ProjectModal key="edit" project={project} onClose={() => setModal(null)} onSaved={(p) => { setProject(p); setModal(null); }} onDeleted={() => nav('/app')} />}
        {modal === 'team' && <InviteModal key="team" project={project} onClose={() => setModal(null)} onChanged={(p) => setProject(p)} />}
      </AnimatePresence>
    </main>
  );
}
