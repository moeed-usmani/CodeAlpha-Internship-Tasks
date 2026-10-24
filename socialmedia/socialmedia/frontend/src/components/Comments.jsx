import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { timeAgo } from '../utils.js';

export default function Comments({ post, onCount }) {
  const { user } = useAuth();
  const { toast } = useUI();
  const [list, setList] = useState(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let live = true;
    api.comments(post._id).then((d) => { if (live) setList(d); }).catch((e) => toast(e.message, '⚠️'));
    return () => { live = false; };
  }, [post._id, toast]);

  const send = async (e) => {
    e.preventDefault();
    if (!text.trim() || busy) return;
    setBusy(true);
    try {
      const c = await api.addComment(post._id, text);
      setList((l) => [...(l || []), c]);
      onCount(1);
      setText('');
    } catch (err) { toast(err.message, '⚠️'); } finally { setBusy(false); }
  };

  const remove = async (c) => {
    try {
      await api.deleteComment(c._id);
      setList((l) => l.filter((x) => x._id !== c._id));
      onCount(-1);
    } catch (err) { toast(err.message, '⚠️'); }
  };

  return (
    <motion.div className="comments" initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}>
      <div className="comments-inner">
        {list === null && <p className="muted small">Loading comments…</p>}
        {list && !list.length && <p className="muted small">No comments yet. Be the first 👇</p>}
        <AnimatePresence initial={false}>
          {(list || []).map((c) => (
            <motion.div key={c._id} className="comment" initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 16 }}>
              <Avatar user={c.author} size={30} />
              <div className="bubble">
                <div className="bubble-head">
                  <b>{c.author.name}</b> <span className="muted small">@{c.author.username} · {timeAgo(c.createdAt)}</span>
                  {(c.author._id === user._id || post.author._id === user._id) && (
                    <button className="x" onClick={() => remove(c)} aria-label="Delete comment">✕</button>
                  )}
                </div>
                <p>{c.text}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <form className="comment-form" onSubmit={send}>
          <input className="input" placeholder="Add a comment…" maxLength={300} value={text} onChange={(e) => setText(e.target.value)} />
          <button className="btn small blue" disabled={busy || !text.trim()}>Send</button>
        </form>
      </div>
    </motion.div>
  );
}
