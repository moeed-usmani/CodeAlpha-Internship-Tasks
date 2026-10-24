import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import Cursor from './components/Cursor.jsx';
import Home from './pages/Home.jsx';
import Shop from './pages/Shop.jsx';
import ProductPage from './pages/ProductPage.jsx';
import Checkout from './pages/Checkout.jsx';
import AuthPage from './pages/AuthPage.jsx';
import Orders from './pages/Orders.jsx';
import { useStore } from './context/StoreContext.jsx';

// Sirf enter animation. (Pehle AnimatePresence mode="wait" + exit animation se page atak kar black ho jata tha.)
const Page = ({ children }) => (
  <motion.main initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}>
    {children}
  </motion.main>
);

export default function App() {
  const location = useLocation();
  const { toast } = useStore();
  useEffect(() => { window.scrollTo(0, 0); }, [location.pathname]);

  return (
    <>
      <Cursor />
      <Navbar />
      <CartDrawer />
      <ErrorBoundary resetKey={location.pathname}>
        <Routes location={location}>
          <Route path="/" element={<Page key="home"><Home /></Page>} />
          <Route path="/shop" element={<Page key="shop"><Shop /></Page>} />
          <Route path="/product/:slug" element={<Page key={location.pathname}><ProductPage /></Page>} />
          <Route path="/checkout" element={<Page key="checkout"><Checkout /></Page>} />
          <Route path="/login" element={<Page key="login"><AuthPage mode="login" /></Page>} />
          <Route path="/register" element={<Page key="register"><AuthPage mode="register" /></Page>} />
          <Route path="/orders" element={<Page key="orders"><Orders /></Page>} />
        </Routes>
      </ErrorBoundary>
      <footer className="footer">
        <div className="logo">AURUM</div>
        <p>Crafted for those who notice. © {new Date().getFullYear()} Aurum Atelier — CodeAlpha Internship Project</p>
      </footer>
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
