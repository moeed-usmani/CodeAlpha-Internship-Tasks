import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setToken } from '../api.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const read = () => {
  try { return JSON.parse(localStorage.getItem('orbit_auth')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const a = read();
    setToken(a?.token);
    return a;
  });

  useEffect(() => {
    try { localStorage.setItem('orbit_auth', JSON.stringify(auth)); } catch { /* ignore */ }
  }, [auth]);

  const login = useCallback((data) => { setToken(data.token); setAuth(data); }, []);
  const logout = useCallback(() => { setToken(''); setAuth(null); }, []);
  const updateUser = useCallback((user) => setAuth((a) => (a ? { ...a, user: { ...a.user, ...user } } : a)), []);

  return <Ctx.Provider value={{ user: auth?.user || null, login, logout, updateUser }}>{children}</Ctx.Provider>;
}
