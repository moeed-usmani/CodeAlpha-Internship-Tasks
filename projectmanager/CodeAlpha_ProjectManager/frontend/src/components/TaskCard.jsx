import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { PRIORITY, dueInfo } from '../utils.js';

export default function TaskCard({ task, dragging, onOpen, onDragStart, onDragEnd }) {
  const due = dueInfo(task.dueDate, task.status === 'done');
  const pr = PRIORITY[task.priority] || PRIORITY.medium;

  return (
    <motion.div
      layout="position"
      className={`task-card ${dragging ? 'dragging' : ''} ${task.status === 'done' ? 'is-done' : ''}`}
      data-id={task._id}
      draggable
      onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', task._id); onDragStart(task._id); }}
      onDragEnd={onDragEnd}
      onClick={() => onOpen(task._id)}
      initial={{ opacity: 0, y: 14, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
      whileHover={{ y: -3 }}
    >
      <span className="prio-bar" style={{ background: pr.color }} />
      {!!task.labels?.length && (
        <div className="labels">{task.labels.map((l) => <span key={l} className="label">{l}</span>)}</div>
      )}
      <h4>{task.title}</h4>
      <div className="task-meta">
        <div className="chips">
          <span className="chip prio" style={{ color: pr.color }}><i style={{ background: pr.color }} />{pr.label}</span>
          {due && <span className={`chip due ${due.tone}`}>🗓 {due.label}</span>}
          {task.commentCount > 0 && <span className="chip">💬 {task.commentCount}</span>}
        </div>
        <Avatar user={task.assignee} size={26} />
      </div>
    </motion.div>
  );
}
