import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';

export default function AuthPage({ mode }) {
  const isReg = mode === 'register';
  const { login } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const data = isReg ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      login(data);
      nav('/app');
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <div className="auth">
      <Link to="/" className="brand auth-brand"><span className="brand-mark">☁️</span> Nimbus</Link>
      <motion.form className="auth-card glass" onSubmit={submit} initial={{ opacity: 0, y: 40, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 160, damping: 20 }}>
        <span className="eyebrow">{isReg ? 'Join Nimbus' : 'Welcome back'}</span>
        <h2>{isReg ? 'Create your account' : 'Log in to your workspace'}</h2>
        {isReg && <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required minLength={6} />
        {error && <motion.p className="error" animate={{ x: [0, -8, 8, -4, 0] }}>⚠️ {error}</motion.p>}
        <button className="btn big full" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Log in'}</button>
        <p className="muted center small">
          {isReg ? <>Already have an account? <Link to="/login" className="link">Log in</Link></> : <>New to Nimbus? <Link to="/register" className="link">Create an account</Link></>}
        </p>
      </motion.form>
    </div>
  );
}
