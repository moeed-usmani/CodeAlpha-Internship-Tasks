import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { parseInvite, randomKey } from '../crypto.js';
import Icon from '../components/Icon.jsx';

const features = [
  ['video', 'Multi-user video', 'Up to 8 people, peer-to-peer WebRTC'],
  ['screen', 'Screen sharing', 'Present your screen with one click'],
  ['file', 'File sharing', 'Drop files, encrypted before they leave'],
  ['board', 'Live whiteboard', 'Draw together in real time'],
  ['lock', 'E2E encryption', 'AES-256 keys never reach the server'],
  ['users', 'JWT authentication', 'Secure accounts and sessions'],
];

const readKeys = () => { try { return JSON.parse(localStorage.getItem('nexus_keys')) || {}; } catch { return {}; } };

export default function Lobby() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState([]);
  const keys = readKeys();

  useEffect(() => { api.myRooms().then(setHistory).catch(() => {}); }, []);

  const create = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const { roomId } = await api.createRoom(title);
      const key = randomKey();
      localStorage.setItem('nexus_keys', JSON.stringify({ ...readKeys(), [roomId]: key }));
      nav(`/room/${roomId}#${key}`);
    } catch (err) { setError(err.message); setBusy(false); }
  };

  const join = async (e) => {
    e.preventDefault();
    setError('');
    const inv = parseInvite(code);
    if (!inv) { setError('Paste the full invite link or code (it contains the encryption key).'); return; }
    try { await api.room(inv.roomId); nav(`/room/${inv.roomId}#${inv.key}`); } catch (err) { setError(err.message); }
  };

  return (
    <div className="lobby">
      <header className="topbar">
        <div className="logo mono">NEXUS<span>//</span>MEET</div>
        <div className="row gap">
          <span className="mono small muted">OPERATOR: <b className="cyan">{user.name}</b></span>
          <button className="btn ghost sm" onClick={logout}><Icon name="logout" size={16} /> Logout</button>
        </div>
      </header>

      <section className="hero">
        <motion.p className="eyebrow mono" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>// SECURE REAL-TIME COMMUNICATION</motion.p>
        <motion.h1 className="glitch" data-text="MEET IN THE GRID" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.7 }}>MEET IN THE GRID</motion.h1>
        <motion.p className="muted lead" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}>Start a room, share the link, and talk face to face — encrypted end to end.</motion.p>
      </section>

      <section className="cards">
        <motion.form className="panel neon-box" onSubmit={create} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3><Icon name="plus" /> NEW MEETING</h3>
          <input className="field" placeholder="Meeting title (optional)" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={60} />
          <button className="btn full" disabled={busy}>{busy ? 'OPENING ROOM…' : 'START MEETING'}</button>
        </motion.form>
        <motion.form className="panel neon-box pink" onSubmit={join} initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <h3><Icon name="users" /> JOIN WITH INVITE</h3>
          <input className="field" placeholder="Paste invite link or code" value={code} onChange={(e) => setCode(e.target.value)} />
          <button className="btn full alt">JOIN ROOM</button>
        </motion.form>
      </section>
      {error && <p className="err center mono small">! {error}</p>}

      <section className="features">
        {features.map(([ic, t, d], i) => (
          <motion.div key={t} className="feat panel" initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }} whileHover={{ y: -6 }}>
            <Icon name={ic} size={26} /><b>{t}</b><span className="muted small">{d}</span>
          </motion.div>
        ))}
      </section>

      {!!history.length && (
        <section className="history">
          <h4 className="mono">// YOUR RECENT MEETINGS</h4>
          {history.map((m) => (
            <div key={m.roomId} className="hist-row panel">
              <div><b>{m.title}</b><div className="muted small mono">{new Date(m.createdAt).toLocaleString()}</div></div>
              {keys[m.roomId]
                ? <button className="btn sm" onClick={() => nav(`/room/${m.roomId}#${keys[m.roomId]}`)}>Rejoin</button>
                : <span className="muted small mono">key not on this device</span>}
            </div>
          ))}
        </section>
      )}
    </div>
  );
}
