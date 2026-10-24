import { useRef } from 'react';

const faces = [
  ['front', '#ffd23f', '❤️', 'LIKE'],
  ['back', '#ff5fa2', '💬', 'TALK'],
  ['right', '#3a86ff', '📸', 'POST'],
  ['left', '#06d6a0', '🤝', 'FOLLOW'],
  ['top', '#ff7b3a', '🔥', 'TREND'],
  ['bottom', '#b794f6', '✨', 'VIBE'],
];
const floaters = [
  { e: '❤️', style: { top: '4%', left: '6%' }, d: 0, z: 90 },
  { e: '⭐', style: { top: '12%', right: '4%' }, d: 0.8, z: 140 },
  { e: '💬', style: { bottom: '14%', left: '2%' }, d: 1.6, z: 60 },
  { e: '🔥', style: { bottom: '6%', right: '10%' }, d: 0.4, z: 120 },
  { e: '👾', style: { top: '46%', left: '-4%' }, d: 1.2, z: 160 },
  { e: '🌈', style: { top: '40%', right: '-4%' }, d: 2, z: 80 },
];

export default function Cube3D() {
  const ref = useRef(null);
  const move = (e) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.setProperty('--ry', `${x * 36}deg`);
    el.style.setProperty('--rx', `${-y * 36}deg`);
  };
  const leave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty('--ry', '0deg');
    el.style.setProperty('--rx', '0deg');
  };

  return (
    <div className="scene" onMouseMove={move} onMouseLeave={leave}>
      <div className="blob" />
      <div className="tilt" ref={ref}>
        <div className="cube">
          {faces.map(([cls, bg, emoji, label]) => (
            <div key={cls} className={`face ${cls}`} style={{ background: bg }}>
              <span>{emoji}</span>
              <b>{label}</b>
            </div>
          ))}
        </div>
        {floaters.map((f) => (
          <span key={f.e} className="floater" style={{ ...f.style, animationDelay: `${f.d}s`, transform: `translateZ(${f.z}px)` }}>
            {f.e}
          </span>
        ))}
      </div>
    </div>
  );
}
