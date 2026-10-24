import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import Cursor from '../components/Cursor.jsx';

export default function AuthPage({ mode }) {
  const isReg = mode === 'register';
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const data = isReg ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      login(data);
      nav('/home');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={`auth ${isReg ? 'reg' : ''}`}>
      <Cursor />
      <div className="auth-art">
        <Link to="/" className="logo">ORBIT<span>★</span></Link>
        <motion.h1 className="display mega small" initial={{ y: 60, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ type: 'spring', stiffness: 120 }}>
          {isReg ? <>JOIN THE<br />ORBIT.</> : <>WELCOME<br />BACK!</>}
        </motion.h1>
        <p className="lead">{isReg ? 'Takes 10 seconds. No spam. Maximum vibes.' : 'Your people posted while you were away.'}</p>
        {['🚀', '💬', '❤️', '⭐', '🔥'].map((e, i) => (
          <span key={e} className="auth-float" style={{ left: `${10 + i * 18}%`, top: `${58 + (i % 2) * 14}%`, animationDelay: `${i * 0.5}s` }}>{e}</span>
        ))}
      </div>
      <div className="auth-form-wrap">
        <motion.form className="card auth-card" onSubmit={submit} initial={{ y: 50, opacity: 0, rotate: 2 }} animate={{ y: 0, opacity: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 160, damping: 18 }}>
          <h2 className="display">{isReg ? 'Create account' : 'Log in'}</h2>
          {isReg && <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />}
          {isReg && <input className="input" placeholder="Username (letters, numbers, _)" value={form.username} onChange={set('username')} required minLength={3} maxLength={20} />}
          <input className="input" type={isReg ? 'email' : 'text'} placeholder={isReg ? 'Email' : 'Email or username'} value={form.email} onChange={set('email')} required />
          <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required minLength={6} />
          {error && <motion.p className="error" initial={{ x: -10 }} animate={{ x: [0, -8, 8, -4, 0] }}>⚠️ {error}</motion.p>}
          <button className="btn big pink full" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Join Orbit ↗' : 'Log in ↗'}</button>
          <p className="muted center">
            {isReg ? <>Already in? <Link to="/login" className="lnk">Log in</Link></> : <>New here? <Link to="/register" className="lnk">Create account</Link></>}
          </p>
        </motion.form>
      </div>
    </div>
  );
}
