import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Ctx = createContext(null);
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg, icon = '✨') => {
    setToast({ msg, icon, id: Date.now() + Math.random() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  return (
    <Ctx.Provider value={{ toast: show }}>
      {children}
      <div className="toast-wrap">
        <AnimatePresence>
          {toast && (
            <motion.div key={toast.id} className="toast glass" initial={{ y: 30, opacity: 0, scale: 0.92 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 20, opacity: 0, scale: 0.95 }} transition={{ type: 'spring', stiffness: 380, damping: 26 }}>
              <span>{toast.icon}</span> {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Ctx.Provider>
  );
}
