import { useMemo } from 'react';
import { motion } from 'framer-motion';

const COLORS = ['#6a4cff', '#12c2a4', '#ffb020', '#ff5d8f', '#2f9bff', '#ff7a59'];

export default function Confetti() {
  const pieces = useMemo(() => Array.from({ length: 36 }, (_, i) => ({
    id: i,
    dx: (Math.random() - 0.5) * 520,
    up: 120 + Math.random() * 220,
    fall: 260 + Math.random() * 200,
    rot: (Math.random() - 0.5) * 900,
    color: COLORS[i % COLORS.length],
    w: 7 + Math.random() * 8,
    round: Math.random() > 0.5,
  })), []);

  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p) => (
        <motion.i
          key={p.id}
          style={{ width: p.w, height: p.w * 0.6, background: p.color, borderRadius: p.round ? '50%' : 2 }}
          initial={{ x: 0, y: 0, opacity: 1, rotate: 0 }}
          animate={{ x: [0, p.dx * 0.7, p.dx], y: [0, -p.up, p.fall], opacity: [1, 1, 0], rotate: p.rot }}
          transition={{ duration: 1.7, ease: 'easeOut', times: [0, 0.35, 1] }}
        />
      ))}
    </div>
  );
}
