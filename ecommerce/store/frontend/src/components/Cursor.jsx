import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ref = useRef(null);
  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    let x = 0, y = 0, cx = 0, cy = 0, raf;
    const move = (e) => { x = e.clientX; y = e.clientY; };
    const loop = () => {
      cx += (x - cx) * 0.15; cy += (y - cy) * 0.15;
      if (ref.current) ref.current.style.transform = `translate(${cx - 200}px, ${cy - 200}px)`;
      raf = requestAnimationFrame(loop);
    };
    window.addEventListener('mousemove', move);
    raf = requestAnimationFrame(loop);
    return () => { window.removeEventListener('mousemove', move); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="cursor-glow" />;
}
