import { useEffect, useRef, useState } from 'react';
import Icon from './Icon.jsx';

const W = 1600;
const H = 900;
const COLORS = ['#00f0ff', '#ff2bd6', '#b6ff3b', '#ffd23f', '#ffffff', '#8a5cff'];

function drawSegs(ctx, segs) {
  for (const s of segs || []) {
    ctx.save();
    ctx.globalCompositeOperation = s.e ? 'destination-out' : 'source-over';
    ctx.strokeStyle = s.c;
    ctx.lineWidth = s.w;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowBlur = s.e ? 0 : 10;
    ctx.shadowColor = s.c;
    ctx.beginPath();
    ctx.moveTo(s.x0, s.y0);
    ctx.lineTo(s.x1, s.y1);
    ctx.stroke();
    ctx.restore();
  }
}

export default function Whiteboard({ subscribe, sendDraw, clear }) {
  const canvasRef = useRef(null);
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(4);
  const [eraser, setEraser] = useState(false);
  const tool = useRef({});
  tool.current = { color, size, eraser };
  const st = useRef({ drawing: false, last: null, buf: [], timer: null });

  // Receive remote strokes / history. Subscribing replays the full log, so switching views never loses the drawing.
  useEffect(() => {
    const unsub = subscribe((ev) => {
      const c = canvasRef.current;
      if (!c) return;
      const ctx = c.getContext('2d');
      if (ev.type === 'clear') ctx.clearRect(0, 0, W, H);
      else if (ev.type === 'history') { ctx.clearRect(0, 0, W, H); ev.list.forEach((e) => drawSegs(ctx, e.segs)); }
      else if (ev.type === 'draw') drawSegs(ctx, ev.ev.segs);
    });
    return unsub;
  }, [subscribe]);

  useEffect(() => () => { clearTimeout(st.current.timer); }, []);

  const flush = () => {
    const s = st.current;
    s.timer = null;
    if (s.buf.length) { sendDraw({ segs: s.buf }); s.buf = []; }
  };

  const pos = (e) => {
    const r = canvasRef.current.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * H) / r.height };
  };

  const segment = (a, b) => {
    const t = tool.current;
    const seg = { x0: a.x, y0: a.y, x1: b.x, y1: b.y, c: t.color, w: t.eraser ? t.size * 4 : t.size, e: t.eraser };
    drawSegs(canvasRef.current.getContext('2d'), [seg]);
    st.current.buf.push(seg);
    if (!st.current.timer) st.current.timer = setTimeout(flush, 40);
  };

  const down = (e) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    const p = pos(e);
    st.current.drawing = true;
    st.current.last = p;
    segment(p, p);
  };
  const move = (e) => {
    if (!st.current.drawing) return;
    const p = pos(e);
    segment(st.current.last, p);
    st.current.last = p;
  };
  const up = () => { st.current.drawing = false; flush(); };

  const save = () => {
    const out = document.createElement('canvas');
    out.width = W; out.height = H;
    const ctx = out.getContext('2d');
    ctx.fillStyle = '#070a1c';
    ctx.fillRect(0, 0, W, H);
    ctx.drawImage(canvasRef.current, 0, 0);
    const a = document.createElement('a');
    a.href = out.toDataURL('image/png');
    a.download = 'nexus-whiteboard.png';
    a.click();
  };

  return (
    <div className="board">
      <div className="board-tools panel">
        {COLORS.map((c) => (
          <button key={c} className={`swatch ${!eraser && color === c ? 'on' : ''}`} style={{ background: c, boxShadow: `0 0 12px ${c}` }} onClick={() => { setColor(c); setEraser(false); }} aria-label={`Color ${c}`} />
        ))}
        <input type="range" min="2" max="24" value={size} onChange={(e) => setSize(+e.target.value)} />
        <button className={`tool ${eraser ? 'on' : ''}`} onClick={() => setEraser((v) => !v)} title="Eraser"><Icon name="eraser" /></button>
        <button className="tool" onClick={clear} title="Clear board for everyone"><Icon name="trash" /></button>
        <button className="tool" onClick={save} title="Download PNG"><Icon name="download" /></button>
      </div>
      <div className="board-wrap neon-box">
        <canvas ref={canvasRef} width={W} height={H} onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up} />
      </div>
    </div>
  );
}
