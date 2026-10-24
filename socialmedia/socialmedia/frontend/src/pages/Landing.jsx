import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Cube3D from '../components/Cube3D.jsx';
import Cursor from '../components/Cursor.jsx';

const words = ['POST', 'LIKE', 'COMMENT', 'FOLLOW', 'REPEAT'];
const features = [
  { n: '01', t: 'Posts that pop', d: 'Colour your cards, drop an image, say it loud. 500 characters of pure personality.', c: '#ffd23f', e: '✍️' },
  { n: '02', t: 'Likes & comments', d: 'Heart bursts, live comment threads, zero awkward silence.', c: '#ff5fa2', e: '💥' },
  { n: '03', t: 'Follow your people', d: 'Build your orbit. Your Following feed shows only the people you love.', c: '#3a86ff', e: '🤝' },
  { n: '04', t: 'Profiles with swagger', d: 'Pick an emoji, pick a colour, write a bio. Your corner, your rules.', c: '#06d6a0', e: '🎭' },
];
const steps = ['Join in 10 seconds', 'Make your profile pop', 'Post, like, follow', 'Watch your orbit grow'];

const rise = { hidden: { opacity: 0, y: 50 }, show: (i = 0) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, type: 'spring', stiffness: 160, damping: 20 } }) };

function TiltCard({ children, className = '', style }) {
  const move = (e) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateY(${x * 14}deg) rotateX(${-y * 14}deg) translateY(-6px)`;
  };
  const leave = (e) => { e.currentTarget.style.transform = ''; };
  return <div className={`tilt-card ${className}`} style={style} onMouseMove={move} onMouseLeave={leave}>{children}</div>;
}

export default function Landing() {
  return (
    <div className="landing">
      <Cursor />
      <header className="l-nav">
        <Link to="/" className="logo">ORBIT<span>★</span></Link>
        <div className="l-nav-right">
          <Link to="/login" className="btn ghost">Log in</Link>
          <Link to="/register" className="btn pink">Join free</Link>
        </div>
      </header>

      <section className="l-hero">
        <div className="l-hero-text">
          <motion.span className="sticker rot-l" initial={{ scale: 0, rotate: -30 }} animate={{ scale: 1, rotate: -6 }} transition={{ type: 'spring', delay: 0.2 }}>
            🚀 Now orbiting · v1.0
          </motion.span>
          <motion.h1 className="display mega" initial="hidden" animate="show" variants={{ show: { transition: { staggerChildren: 0.12 } } }}>
            {['SAY IT', 'LOUD.', 'LIKE', 'NO ONE'].map((w, i) => (
              <motion.span key={w} variants={rise} className={`line l${i}`}>{w}</motion.span>
            ))}
            <motion.span variants={rise} className="line l4">IS WATCHING.</motion.span>
          </motion.h1>
          <motion.p className="lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}>
            Orbit is the loudest little corner of the internet. Post, comment, like and follow — in colours your eyes can actually feel.
          </motion.p>
          <motion.div className="cta-row" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}>
            <Link to="/register" className="btn big pink">Start posting ↗</Link>
            <Link to="/login" className="btn big">I have an account</Link>
          </motion.div>
        </div>
        <div className="l-hero-art"><Cube3D /></div>
      </section>

      <div className="marquee">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>{[...words, ...words, ...words].map((w, i) => <em key={i}>{w} <i>✦</i> </em>)}</span>
          ))}
        </div>
      </div>

      <section className="l-section">
        <motion.h2 className="display h2" variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}>
          Everything you need.<br /><mark>Nothing you don't.</mark>
        </motion.h2>
        <div className="feat-grid">
          {features.map((f, i) => (
            <motion.div key={f.n} variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true, margin: '-40px' }}>
              <TiltCard className="feat card" style={{ background: f.c }}>
                <span className="feat-n">{f.n}</span>
                <span className="feat-e">{f.e}</span>
                <h3 className="display">{f.t}</h3>
                <p>{f.d}</p>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="l-section steps-sec">
        <motion.h2 className="display h2" variants={rise} initial="hidden" whileInView="show" viewport={{ once: true }}>How it works</motion.h2>
        <div className="steps">
          {steps.map((s, i) => (
            <motion.div key={s} className="step card" variants={rise} custom={i} initial="hidden" whileInView="show" viewport={{ once: true }} whileHover={{ rotate: i % 2 ? 2 : -2, y: -6 }}>
              <span className="step-n">{i + 1}</span>
              <p>{s}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="l-cta">
        <motion.div className="card cta-card" initial={{ scale: 0.9, rotate: -2, opacity: 0 }} whileInView={{ scale: 1, rotate: -1, opacity: 1 }} viewport={{ once: true }} transition={{ type: 'spring' }}>
          <h2 className="display h2">Ready to join the orbit?</h2>
          <Link to="/register" className="btn big pink">Create my account 🪐</Link>
        </motion.div>
      </section>

      <footer className="l-foot">ORBIT★ — CodeAlpha Internship Project · Task 2 · Made with MERN</footer>
    </div>
  );
}
