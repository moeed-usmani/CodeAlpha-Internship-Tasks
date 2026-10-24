import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import Icon from '../components/Icon.jsx';

const lines = ['> initializing secure channel...', '> AES-256-GCM key exchange ........ OK', '> WebRTC mesh network ............ READY', '> awaiting operator credentials_'];

export default function AuthPage() {
  const { setAuth } = useAuth();
  const nav = useNavigate();
  const location = useLocation();
  const [reg, setReg] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const data = reg ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      setAuth(data);
      nav(location.state?.from || '/', { replace: true });
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <div className="auth-split">
      <div className="auth-left">
        <div className="logo mono">NEXUS<span>//</span>MEET</div>
        <h1 className="glitch" data-text="TALK. SHARE. DRAW.">TALK. SHARE. DRAW.</h1>
        <p className="muted lead">Encrypted multi-party video, screen sharing, file drops and a live whiteboard — in one neon-lit room.</p>
        <div className="terminal mono">
          {lines.map((l, i) => <motion.div key={l} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.45 }}>{l}</motion.div>)}
        </div>
      </div>
      <motion.form className="panel neon-box auth-card" onSubmit={submit} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
        <div className="row"><Icon name="lock" /><h2>{reg ? 'REGISTER' : 'ACCESS'}</h2></div>
        {reg && <input className="field" placeholder="Callsign / full name" value={form.name} onChange={set('name')} required />}
        <input className="field" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="field" type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required minLength={6} />
        {error && <p className="err small mono">! {error}</p>}
        <button className="btn full" disabled={busy}>{busy ? 'AUTHENTICATING…' : reg ? 'CREATE ACCOUNT' : 'ENTER'}</button>
        <p className="muted small center">{reg ? 'Already registered?' : 'New operator?'} <button type="button" className="link" onClick={() => { setReg(!reg); setError(''); }}>{reg ? 'Log in' : 'Register'}</button></p>
      </motion.form>
    </div>
  );
}
