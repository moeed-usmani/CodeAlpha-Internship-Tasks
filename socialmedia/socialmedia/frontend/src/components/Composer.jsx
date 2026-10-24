import { useState } from 'react';
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { POST_COLORS } from '../utils.js';

const MAX = 500;

export default function Composer({ onPosted }) {
  const { user } = useAuth();
  const { toast } = useUI();
  const [text, setText] = useState('');
  const [image, setImage] = useState('');
  const [showImg, setShowImg] = useState(false);
  const [color, setColor] = useState('#ffffff');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (busy || (!text.trim() && !image.trim())) return;
    setBusy(true);
    try {
      const post = await api.createPost({ text, image, color });
      onPosted(post);
      setText(''); setImage(''); setShowImg(false); setColor('#ffffff');
      toast('Posted! Your orbit just got louder', '🚀');
    } catch (err) {
      toast(err.message, '⚠️');
    } finally {
      setBusy(false);
    }
  };

  return (
    <form className="card composer" onSubmit={submit} style={{ background: color }}>
      <div className="composer-top">
        <Avatar user={user} />
        <textarea
          value={text}
          maxLength={MAX}
          rows={2}
          placeholder={`What's the vibe, ${user.name.split(' ')[0]}?`}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      {showImg && (
        <motion.input
          initial={{ height: 0, opacity: 0 }} animate={{ height: 46, opacity: 1 }}
          className="input" placeholder="Paste an image link (https://...)" value={image} onChange={(e) => setImage(e.target.value)}
        />
      )}
      <div className="composer-bottom">
        <div className="composer-tools">
          <button type="button" className={`pill ${showImg ? 'on' : ''}`} onClick={() => setShowImg((v) => !v)}>🖼 Image</button>
          <div className="swatches">
            {POST_COLORS.map((c) => (
              <button type="button" key={c} className={`swatch ${color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setColor(c)} aria-label={`Card colour ${c}`} />
            ))}
          </div>
        </div>
        <div className="composer-send">
          <span className={`count ${text.length > MAX - 40 ? 'warn' : ''}`}>{text.length}/{MAX}</span>
          <button className="btn pink" disabled={busy || (!text.trim() && !image.trim())}>{busy ? 'Posting…' : 'Post it ↗'}</button>
        </div>
      </div>
    </form>
  );
}
