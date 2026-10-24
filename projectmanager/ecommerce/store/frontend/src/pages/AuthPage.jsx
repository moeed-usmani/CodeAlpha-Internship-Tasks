import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useStore } from '../context/StoreContext.jsx';
import { api } from '../api.js';

export default function AuthPage({ mode }) {
  const isReg = mode === 'register';
  const { setAuth } = useStore();
  const nav = useNavigate();
  const loc = useLocation();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const data = isReg ? await api.register(form) : await api.login({ email: form.email, password: form.password });
      setAuth(data);
      nav(loc.state?.from || '/');
    } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <section className="auth page-top">
      <form className="auth-card" onSubmit={submit}>
        <p className="eyebrow">{isReg ? 'Join the atelier' : 'Welcome back'}</p>
        <h2>{isReg ? 'Create account' : 'Sign in'}</h2>
        {isReg && <input className="input" placeholder="Full name" value={form.name} onChange={set('name')} required />}
        <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="input" type="password" placeholder="Password (min 6)" value={form.password} onChange={set('password')} required minLength={6} />
        {error && <p className="error">{error}</p>}
        <button className="btn-gold full" disabled={busy}>{busy ? 'Please wait…' : isReg ? 'Create account' : 'Sign in'}</button>
        <p className="muted center">
          {isReg ? <>Already a member? <Link to="/login" state={loc.state} className="gold">Sign in</Link></> : <>New here? <Link to="/register" state={loc.state} className="gold">Create account</Link></>}
        </p>
      </form>
    </section>
  );
}
