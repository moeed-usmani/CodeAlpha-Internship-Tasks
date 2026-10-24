import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { setToken } from '../api.js';
import { connectSocket, disconnectSocket } from '../socket.js';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

const read = () => {
  try { return JSON.parse(localStorage.getItem('nimbus_auth')); } catch { return null; }
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const a = read();
    setToken(a?.token);
    return a;
  });
  const [socket, setSocket] = useState(null);
  const token = auth?.token;

  useEffect(() => {
    try { localStorage.setItem('nimbus_auth', JSON.stringify(auth)); } catch { /* ignore */ }
  }, [auth]);

  // Login hote hi WebSocket connect, logout par disconnect
  useEffect(() => {
    if (!token) { setSocket(null); return undefined; }
    setSocket(connectSocket(token));
    return () => { disconnectSocket(); };
  }, [token]);

  const login = useCallback((data) => { setToken(data.token); setAuth(data); }, []);
  const logout = useCallback(() => { setToken(''); setAuth(null); }, []);

  return <Ctx.Provider value={{ user: auth?.user || null, socket, login, logout }}>{children}</Ctx.Provider>;
}
