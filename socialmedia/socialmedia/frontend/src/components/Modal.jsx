import { useEffect } from 'react';
import { motion } from 'framer-motion';

export default function Modal({ title, onClose, children }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div className="modal-back" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div
        className="modal card"
        initial={{ y: 60, scale: 0.9, rotate: -2 }}
        animate={{ y: 0, scale: 1, rotate: 0 }}
        exit={{ y: 40, scale: 0.95, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 24 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h3 className="display">{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close">✕</button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}
