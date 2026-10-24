import { createContext, useContext, useEffect, useState } from 'react';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try { return JSON.parse(localStorage.getItem('nexus_auth')); } catch { return null; }
  });
  useEffect(() => {
    if (auth) localStorage.setItem('nexus_auth', JSON.stringify(auth));
    else localStorage.removeItem('nexus_auth');
  }, [auth]);
  return <Ctx.Provider value={{ auth, user: auth?.user, setAuth, logout: () => setAuth(null) }}>{children}</Ctx.Provider>;
}
