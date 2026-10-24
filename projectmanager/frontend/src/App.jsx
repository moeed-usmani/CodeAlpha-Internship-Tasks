import { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import Backdrop from './components/Backdrop.jsx';
import Navbar from './components/Navbar.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Board from './pages/Board.jsx';

function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();
  if (!user) return <Navigate to="/login" replace />;
  return (
    <>
      <Navbar />
      <motion.div key={pathname} className="app-page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
        <Outlet />
      </motion.div>
    </>
  );
}
function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/app" replace /> : children;
}

export default function App() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <>
      <Backdrop />
      <Routes>
        <Route path="/" element={user ? <Navigate to="/app" replace /> : <Landing />} />
        <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
        <Route path="/register" element={<GuestOnly><AuthPage mode="register" /></GuestOnly>} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="p/:id" element={<Board />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
