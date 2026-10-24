import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import ProgressRing from '../components/ProgressRing.jsx';

const words = ['Plan', 'Assign', 'Ship', 'Celebrate'];
const rise = { hidden: { opacity: 0, y: 40 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.09, type: 'spring', stiffness: 150, damping: 20 } }) };

const demoCols = [
  { t: 'To do', c: '#8a94ff', cards: [['Design hero', 'high', 'AI'], ['Write copy', 'medium', 'CG']] },
  { t: 'In progress', c: '#ffb020', cards: [['Pricing page', 'high', 'BA'], ['Illustrations', 'low', 'CG']] },
  { t: 'Done', c: '#12c2a4', cards: [['Brand palette', 'low', 'AI']] },
];
const prio = { high: '#ff5d73', medium: '#ffb020', low: '#12c2a4' };

function Hero3D() {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5; const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${-18 + x * 16}deg`); el.style.setProperty('--rx', `${10 - y * 14}deg`);
  };
  const leave = () => { const el = ref.current; if (!el) return; el.style.setProperty('--ry', '-18deg'); el.style.setProperty('--rx', '10deg'); };
  return (
    <div className="h3d-scene" onMouseMove={move} onMouseLeave={leave}>
      <div className="h3d" ref={ref}>
        <div className="h3d-board glass">
          {demoCols.map((col, ci) => (
            <div key={col.t} className="h3d-col" style={{ transform: `translateZ(${ci * 14}px)` }}>
              <div className="h3d-col-head"><i style={{ background: col.c }} />{col.t}</div>
              {col.cards.map(([title, p, who], i) => (
                <div key={title} className={`h3d-card float f${(ci + i) % 3}`} style={{ transform: `translateZ(${30 + i * 16}px)` }}>
                  <span className="h3d-bar" style={{ background: prio[p] }} />
                  <b>{title}</b>
                  <div><span className="h3d-chip" style={{ color: prio[p] }}>● {p}</span><span className="h3d-av">{who}</span></div>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="h3d-badge glass float f1" style={{ transform: 'translateZ(110px)' }}><ProgressRing value={72} size={64} stroke={8} color="#6a4cff" /><div><b>Sprint 12</b><span>72% complete</span></div></div>
        <div className="h3d-pill glass float f2" style={{ transform: 'translateZ(130px)' }}><i className="live" /> Live · 3 online</div>
        <div className="h3d-toast glass float f0" style={{ transform: 'translateZ(90px)' }}>🎉 Bilal completed “Pricing page”</div>
      </div>
    </div>
  );
}

export default function Landing() {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setW((i) => (i + 1) % words.length), 1800);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="landing">
      <motion.nav className="l-nav glass" initial={{ y: -40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
        <Link to="/" className="brand"><span className="brand-mark">☁️</span> Nimbus</Link>
        <div className="l-nav-right"><Link to="/login" className="btn ghost">Log in</Link><Link to="/register" className="btn">Get started</Link></div>
      </motion.nav>

      <section className="l-hero">
        <div className="l-hero-text">
          <motion.span className="eyebrow" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>✨ Real-time project management</motion.span>
          <motion.h1 initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } } }}>
            <motion.span variants={rise} className="h-line">Work, in</motion.span>
            <motion.span variants={rise} className="h-line grad">flow state.</motion.span>
            <motion.span variants={rise} className="h-line small">
              <span className="rot" key={w}>{words[w]}</span> every task together.
            </motion.span>
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            Boards, tasks, comments and live updates — all in one calm, beautiful workspace. See your team's changes the instant they happen.
          </motion.p>
          <motion.div className="cta-row" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.05 }}>
            <Link to="/register" className="btn big">Start for free →</Link>
            <Link to="/login" className="btn big ghost">I have an account</Link>
          </motion.div>
          <motion.div className="trust" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.3 }}>
            <span>⚡ WebSocket sync</span><span>🔒 JWT secured</span><span>🧩 Drag & drop</span>
          </motion.div>
        </div>
        <div className="l-hero-art"><Hero3D /></div>
      </section>

      <section className="l-section">
        <motion.h2 variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}>Everything your team needs,<br /><span className="grad">nothing it doesn't.</span></motion.h2>
        <div className="bento">
          <motion.div className="bento-tile big glass" variants={rise} custom={0} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="tag">Boards</span>
            <h3>Drag & drop kanban</h3>
            <p>Move cards between columns with buttery animations. Order is saved and synced for everyone.</p>
            <div className="mini-board">
              {['To do', 'Doing', 'Done'].map((c, i) => (
                <div key={c} className="mini-col"><small>{c}</small><i className={`mini-card m${i}`} /><i className="mini-card alt" /></div>
              ))}
              <i className="mini-flyer" />
            </div>
          </motion.div>
          <motion.div className="bento-tile glass" variants={rise} custom={1} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="tag mint">Live</span><h3>Real-time everything</h3><p>Moves, edits and comments appear instantly across every screen.</p>
            <div className="pulse-row"><i className="live" /><i className="live d1" /><i className="live d2" /> <small>3 teammates online</small></div>
          </motion.div>
          <motion.div className="bento-tile glass" variants={rise} custom={2} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="tag peach">Teams</span><h3>Assign & discuss</h3><p>Give every task an owner, a due date and a comment thread.</p>
          </motion.div>
          <motion.div className="bento-tile glass" variants={rise} custom={3} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <span className="tag pink">Alerts</span><h3>Smart notifications</h3><p>Get pinged when you're assigned, mentioned or when work is done.</p>
          </motion.div>
          <motion.div className="bento-tile wide glass" variants={rise} custom={4} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <div><span className="tag">Insights</span><h3>See progress at a glance</h3><p>Every project shows a live completion ring, so you always know where things stand.</p></div>
            <div className="rings"><ProgressRing value={85} size={84} stroke={9} color="#6a4cff" /><ProgressRing value={60} size={84} stroke={9} color="#12c2a4" /><ProgressRing value={35} size={84} stroke={9} color="#ff7a59" /></div>
          </motion.div>
        </div>
      </section>

      <section className="l-section">
        <motion.div className="cta-card glass" initial={{ opacity: 0, scale: 0.94 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ type: 'spring', stiffness: 120, damping: 18 }}>
          <h2>Ready to find your flow?</h2>
          <p className="muted">Create a project in under a minute.</p>
          <Link to="/register" className="btn big">Create free account →</Link>
        </motion.div>
      </section>
      <footer className="l-foot">Nimbus ☁️ — CodeAlpha Internship Project · Task 3 · Built with MERN + Socket.io</footer>
    </div>
  );
}
