import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from './context/AuthContext.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Lobby from './pages/Lobby.jsx';
import Room from './pages/Room.jsx';

function Private({ children }) {
  const { auth } = useAuth();
  const location = useLocation();
  if (!auth) return <Navigate to="/auth" state={{ from: location.pathname + location.hash }} replace />;
  return children;
}

// Simple mount animation (no exit animation, so a page can never get "stuck" invisible).
const Fade = ({ children }) => (
  <motion.div className="page" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>{children}</motion.div>
);

export default function App() {
  const { auth } = useAuth();
  return (
    <>
      <div className="bg-layer" aria-hidden><div className="floor" /><div className="orb o1" /><div className="orb o2" /></div>
      <Routes>
        <Route path="/auth" element={auth ? <Navigate to="/" replace /> : <Fade><AuthPage /></Fade>} />
        <Route path="/" element={<Private><Fade><Lobby /></Fade></Private>} />
        <Route path="/room/:roomId" element={<Private><Room /></Private>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
