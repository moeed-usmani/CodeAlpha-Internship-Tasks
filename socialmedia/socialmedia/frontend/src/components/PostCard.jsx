import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import Comments from './Comments.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { timeAgo } from '../utils.js';

const BURST = Array.from({ length: 8 }, (_, i) => i);

export default function PostCard({ post, onDelete, index = 0 }) {
  const { user } = useAuth();
  const { toast } = useUI();
  const [liked, setLiked] = useState(post.liked);
  const [likes, setLikes] = useState(post.likes);
  const [burst, setBurst] = useState(0);
  const [open, setOpen] = useState(false);
  const [count, setCount] = useState(post.comments);
  const mine = post.author._id === user._id;

  const like = async () => {
    const was = liked;
    setLiked(!was); setLikes((n) => n + (was ? -1 : 1));
    if (!was) setBurst((b) => b + 1);
    try {
      const r = await api.like(post._id);
      setLiked(r.liked); setLikes(r.likes);
    } catch (e) {
      setLiked(was); setLikes((n) => n + (was ? 1 : -1));
      toast(e.message, '⚠️');
    }
  };

  const remove = async () => {
    if (!window.confirm('Delete this post?')) return;
    try { await api.deletePost(post._id); onDelete(post._id); toast('Post deleted', '🗑'); } catch (e) { toast(e.message, '⚠️'); }
  };

  return (
    <motion.article
      layout
      className="card post"
      style={{ '--tint': post.color }}
      initial={{ opacity: 0, y: 40, rotate: index % 2 ? 1.2 : -1.2 }}
      animate={{ opacity: 1, y: 0, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.85, rotate: -4 }}
      transition={{ type: 'spring', stiffness: 260, damping: 24, delay: Math.min(index, 6) * 0.05 }}
    >
      <div className="post-tint" style={{ background: post.color }} />
      <header className="post-head">
        <Avatar user={post.author} />
        <div className="post-who">
          <Link to={`/u/${post.author.username}`} className="name">{post.author.name}</Link>
          <span className="muted small">@{post.author.username} · {timeAgo(post.createdAt)}</span>
        </div>
        {mine && <button className="icon-btn" onClick={remove} aria-label="Delete post">🗑</button>}
      </header>
      {post.text && <p className="post-text">{post.text}</p>}
      {post.image && <img className="post-img" src={post.image} alt="" loading="lazy" onError={(e) => { e.currentTarget.style.display = 'none'; }} />}
      <footer className="post-actions">
        <button className={`act like ${liked ? 'on' : ''}`} onClick={like} aria-label="Like">
          <motion.span key={burst} className="heart" animate={burst ? { scale: [1, 1.6, 0.9, 1], rotate: [0, -14, 10, 0] } : {}} transition={{ duration: 0.45 }}>
            {liked ? '❤️' : '🤍'}
          </motion.span>
          <b>{likes}</b>
          {burst > 0 && (
            <span key={`b${burst}`} className="burst" aria-hidden>
              {BURST.map((i) => (
                <motion.i
                  key={i}
                  initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                  animate={{ x: Math.cos((i / 8) * Math.PI * 2) * 38, y: Math.sin((i / 8) * Math.PI * 2) * 38, opacity: 0, scale: 1.1 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >♥</motion.i>
              ))}
            </span>
          )}
        </button>
        <button className={`act ${open ? 'on' : ''}`} onClick={() => setOpen((v) => !v)} aria-label="Comments">
          <span>💬</span> <b>{count}</b>
        </button>
      </footer>
      <AnimatePresence initial={false}>
        {open && <Comments post={{ ...post, comments: count }} onCount={(d) => setCount((n) => Math.max(0, n + d))} />}
      </AnimatePresence>
    </motion.article>
  );
}
