import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import Shell from './components/Shell.jsx';
import Landing from './pages/Landing.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Feed from './pages/Feed.jsx';
import Explore from './pages/Explore.jsx';
import Profile from './pages/Profile.jsx';

function RequireAuth({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}
function GuestOnly({ children }) {
  const { user } = useAuth();
  return user ? <Navigate to="/home" replace /> : children;
}

export default function App() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/home" replace /> : <Landing />} />
      <Route path="/login" element={<GuestOnly><AuthPage mode="login" /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><AuthPage mode="register" /></GuestOnly>} />
      <Route element={<RequireAuth><Shell /></RequireAuth>}>
        <Route path="/home" element={<Feed />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/u/:username" element={<Profile />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
