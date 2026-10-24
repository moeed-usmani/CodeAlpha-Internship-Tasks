import { createContext, useContext, useState, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

const Ctx = createContext(null);
export const useUI = () => useContext(Ctx);

export function UIProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timer = useRef(null);
  const show = useCallback((msg, emoji = '✨') => {
    setToast({ msg, emoji, id: Date.now() });
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setToast(null), 2400);
  }, []);

  return (
    <Ctx.Provider value={{ toast: show }}>
      {children}
      <AnimatePresence>
        {toast && (
          <motion.div
            key={toast.id}
            className="toast"
            initial={{ y: 80, rotate: -4, opacity: 0 }}
            animate={{ y: 0, rotate: -1.5, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 22 }}
          >
            <span>{toast.emoji}</span> {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>
    </Ctx.Provider>
  );
}
