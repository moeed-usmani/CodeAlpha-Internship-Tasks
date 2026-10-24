import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import ProgressRing from './ProgressRing.jsx';

export default function ProjectCard({ project, index = 0 }) {
  const { total, done } = project.stats;
  const pct = total ? Math.round((done / total) * 100) : 0;
  const tilt = (e) => {
    const el = e.currentTarget; const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
  };
  const reset = (e) => { e.currentTarget.style.transform = ''; };

  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.06, type: 'spring', stiffness: 200, damping: 22 }}>
      <Link to={`/app/p/${project._id}`} className="pcard glass" onMouseMove={tilt} onMouseLeave={reset} style={{ '--pc': project.color }}>
        <div className="pcard-top">
          <span className="pcard-emoji">{project.emoji}</span>
          <ProgressRing value={pct} color={project.color} size={54} stroke={6} />
        </div>
        <h3>{project.name}</h3>
        <p className="muted pdesc">{project.description || 'No description yet.'}</p>
        <div className="pcard-foot">
          <div className="stack">{project.members.slice(0, 4).map((m) => <Avatar key={m._id} user={m} size={28} />)}{project.members.length > 4 && <span className="avatar more">+{project.members.length - 4}</span>}</div>
          <span className="muted small">{done}/{total} done</span>
        </div>
      </Link>
    </motion.div>
  );
}
