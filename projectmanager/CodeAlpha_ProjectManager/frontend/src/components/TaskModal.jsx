import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Modal from './Modal.jsx';
import Avatar from './Avatar.jsx';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { COLUMNS, PRIORITY, timeAgo, toInputDate } from '../utils.js';

export default function TaskModal({ taskId, project, onClose, onMove }) {
  const { user, socket } = useAuth();
  const { toast } = useUI();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [f, setF] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api.task(taskId).then(({ task: t, comments: c }) => {
      if (!live) return;
      setTask(t); setComments(c);
      setF({ title: t.title, description: t.description || '', priority: t.priority, assignee: t.assignee?._id || '', dueDate: toInputDate(t.dueDate), labels: (t.labels || []).join(', ') });
    }).catch((e) => { toast(e.message, '⚠️'); onClose(); });
    return () => { live = false; };
  }, [taskId, toast, onClose]);

  // Live comments
  useEffect(() => {
    if (!socket) return undefined;
    const added = (p) => { if (p.taskId === taskId) setComments((l) => (l.some((c) => c._id === p.comment._id) ? l : [...l, p.comment])); };
    const removed = (p) => { if (p.taskId === taskId) setComments((l) => l.filter((c) => c._id !== p.commentId)); };
    socket.on('comment:added', added);
    socket.on('comment:deleted', removed);
    return () => { socket.off('comment:added', added); socket.off('comment:deleted', removed); };
  }, [socket, taskId]);

  if (!task || !f) return <Modal onClose={onClose} wide><div className="skeleton" style={{ height: 320 }} /></Modal>;

  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.updateTask(taskId, { ...f, labels: f.labels.split(',').map((x) => x.trim()).filter(Boolean), assignee: f.assignee || null, dueDate: f.dueDate || null });
      toast('Task saved', '💾');
      onClose();
    } catch (err) { toast(err.message, '⚠️'); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this task?')) return;
    try { await api.deleteTask(taskId); onClose(); } catch (err) { toast(err.message, '⚠️'); }
  };
  const send = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      const c = await api.addComment(taskId, text);
      setComments((l) => (l.some((x) => x._id === c._id) ? l : [...l, c]));
      setText('');
    } catch (err) { toast(err.message, '⚠️'); }
  };
  const delComment = async (c) => {
    try { await api.deleteComment(c._id); setComments((l) => l.filter((x) => x._id !== c._id)); } catch (err) { toast(err.message, '⚠️'); }
  };

  return (
    <Modal onClose={onClose} wide>
      <form className="task-modal" onSubmit={save}>
        <div className="tm-main">
          <input className="tm-title" value={f.title} onChange={set('title')} maxLength={140} required />
          <label className="lbl">Description
            <textarea className="input" rows={4} value={f.description} onChange={set('description')} placeholder="Add more detail…" />
          </label>
          <div className="lbl">Discussion · {comments.length}</div>
          <div className="thread">
            {!comments.length && <p className="muted small">No comments yet. Start the conversation 👇</p>}
            <AnimatePresence initial={false}>
              {comments.map((c) => (
                <motion.div key={c._id} className="cmt" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, height: 0 }}>
                  <Avatar user={c.author} size={30} />
                  <div className="cmt-body">
                    <div className="cmt-head"><b>{c.author.name}</b><span className="muted small">{timeAgo(c.createdAt)}</span>{c.author._id === user._id && <button type="button" className="link danger-link" onClick={() => delComment(c)}>Delete</button>}</div>
                    <p>{c.text}</p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="cmt-form">
            <input className="input" placeholder="Write a comment…" value={text} maxLength={600} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') send(e); }} />
            <button type="button" className="btn ghost" onClick={send} disabled={!text.trim()}>Send</button>
          </div>
        </div>
        <aside className="tm-side">
          <button type="button" className="icon-btn close" onClick={onClose} aria-label="Close">✕</button>
          <label className="lbl">Status
            <select className="input" value={task.status} onChange={(e) => { onMove(taskId, e.target.value); setTask({ ...task, status: e.target.value }); }}>
              {COLUMNS.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.title}</option>)}
            </select>
          </label>
          <label className="lbl">Assignee
            <select className="input" value={f.assignee} onChange={set('assignee')}>
              <option value="">Unassigned</option>
              {project.members.map((m) => <option key={m._id} value={m._id}>{m.name}</option>)}
            </select>
          </label>
          <div className="lbl">Priority
            <div className="seg">
              {Object.entries(PRIORITY).map(([k, p]) => (
                <button type="button" key={k} className={f.priority === k ? 'on' : ''} style={f.priority === k ? { background: p.color, color: '#fff' } : undefined} onClick={() => setF({ ...f, priority: k })}>{p.label}</button>
              ))}
            </div>
          </div>
          <label className="lbl">Due date<input className="input" type="date" value={f.dueDate} onChange={set('dueDate')} /></label>
          <label className="lbl">Labels<input className="input" value={f.labels} onChange={set('labels')} placeholder="design, bug, urgent" /></label>
          <div className="tm-actions">
            <button type="button" className="btn danger" onClick={remove}>Delete</button>
            <button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save'}</button>
          </div>
        </aside>
      </form>
    </Modal>
  );
}
