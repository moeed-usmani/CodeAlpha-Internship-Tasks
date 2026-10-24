import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

const fmtSize = (n) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`);
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function SidePanel({ tab, setTab, onClose, room, people }) {
  const [text, setText] = useState('');
  const [fileMsg, setFileMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [drag, setDrag] = useState(false);
  const endRef = useRef(null);
  const fileRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [room.messages.length, tab]);

  const send = (e) => { e.preventDefault(); if (text.trim()) { room.sendMessage(text); setText(''); } };
  const upload = async (file) => {
    if (!file) return;
    setBusy(true); setFileMsg('');
    try { setFileMsg(await room.sendFile(file)); } catch { setFileMsg('Could not send file'); }
    setBusy(false);
  };

  return (
    <motion.aside className="side panel" initial={{ x: 380, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 380, opacity: 0 }} transition={{ type: 'spring', damping: 28, stiffness: 260 }}>
      <div className="side-head">
        <div className="seg">
          {[['chat', 'chat', 'Chat'], ['files', 'file', 'Files'], ['people', 'users', 'People']].map(([k, ic, label]) => (
            <button key={k} className={tab === k ? 'on' : ''} onClick={() => setTab(k)}><Icon name={ic} size={15} /> {label}</button>
          ))}
        </div>
        <button className="icon-btn" onClick={onClose} aria-label="Close panel"><Icon name="x" /></button>
      </div>

      {tab === 'chat' && (
        <>
          <div className="scroll">
            <p className="enc-note mono"><Icon name="lock" size={12} /> Messages are end-to-end encrypted</p>
            {room.messages.map((m) => {
              const mine = m.from.id === room.selfId;
              return (
                <div key={m.id} className={`msg ${mine ? 'mine' : ''}`}>
                  <span className="mono small">{mine ? 'You' : m.from.name} · {fmtTime(m.ts)}</span>
                  <p>{m.text}</p>
                </div>
              );
            })}
            <div ref={endRef} />
          </div>
          <form className="chat-form" onSubmit={send}>
            <input className="field" placeholder="Type a message…" value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} />
            <button className="btn icon" aria-label="Send"><Icon name="send" size={18} /></button>
          </form>
        </>
      )}

      {tab === 'files' && (
        <div className="scroll">
          <div className={`drop ${drag ? 'over' : ''}`} onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={(e) => { e.preventDefault(); setDrag(false); upload(e.dataTransfer.files[0]); }} onClick={() => fileRef.current?.click()}>
            <Icon name="file" size={28} />
            <b>{busy ? 'Encrypting & sending…' : 'Drop a file or click to share'}</b>
            <small className="mono">AES-256 encrypted · max 10 MB</small>
            <input ref={fileRef} type="file" hidden onChange={(e) => { upload(e.target.files[0]); e.target.value = ''; }} />
          </div>
          {fileMsg && <p className="err small">{fileMsg}</p>}
          <p className="enc-note mono">Files are shared live with people currently in the room.</p>
          {room.files.map((f) => (
            <div key={f.id} className="file-row">
              <Icon name="file" />
              <div><b>{f.name}</b><div className="muted small mono">{f.mine ? 'You' : f.from.name} · {fmtSize(f.size)}</div></div>
              <a className="icon-btn" href={f.url} download={f.name} aria-label="Download"><Icon name="download" /></a>
            </div>
          ))}
          {!room.files.length && <p className="muted center small">No files shared yet.</p>}
        </div>
      )}

      {tab === 'people' && (
        <div className="scroll">
          {people.map((p) => (
            <div key={p.id} className="person">
              <span className="dot-avatar">{(p.name || '?')[0].toUpperCase()}</span>
              <b>{p.name}{p.local ? ' (you)' : ''}</b>
              <span className="grow" />
              <span className={`mini ${p.state.mic ? '' : 'off'}`}><Icon name={p.state.mic ? 'mic' : 'micOff'} size={14} /></span>
              <span className={`mini ${p.state.cam ? '' : 'off'}`}><Icon name={p.state.cam ? 'cam' : 'camOff'} size={14} /></span>
            </div>
          ))}
        </div>
      )}
    </motion.aside>
  );
}
