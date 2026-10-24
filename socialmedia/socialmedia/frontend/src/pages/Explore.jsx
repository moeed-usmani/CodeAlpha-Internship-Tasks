import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import PostCard from '../components/PostCard.jsx';
import { api } from '../api.js';

export default function Explore() {
  const [q, setQ] = useState('');
  const [people, setPeople] = useState(null);
  const [posts, setPosts] = useState(null);

  useEffect(() => {
    let live = true;
    const t = setTimeout(() => {
      api.search(q).then((d) => { if (live) setPeople(d); }).catch(() => { if (live) setPeople([]); });
    }, 250);
    return () => { live = false; clearTimeout(t); };
  }, [q]);

  useEffect(() => {
    let live = true;
    api.feed('explore').then((d) => { if (live) setPosts(d); }).catch(() => { if (live) setPosts([]); });
    return () => { live = false; };
  }, []);

  return (
    <div className="explore">
      <h1 className="display h1">Explore <span className="sticker rot-r">🧭 find your people</span></h1>
      <input className="input search" placeholder="Search people by name or @username…" value={q} onChange={(e) => setQ(e.target.value)} />
      <div className="people-grid">
        {people === null && [0, 1, 2, 3].map((i) => <div key={i} className="card skeleton short" />)}
        {people && !people.length && <p className="muted">No one found for “{q}”.</p>}
        {(people || []).map((u, i) => (
          <motion.div key={u._id} className="card person-card" initial={{ opacity: 0, y: 30, rotate: i % 2 ? 2 : -2 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ delay: Math.min(i, 8) * 0.04, type: 'spring' }} whileHover={{ y: -6, rotate: i % 2 ? -1 : 1 }}>
            <div className="person-band" style={{ background: u.color }} />
            <Avatar user={u} size={64} />
            <Link to={`/u/${u.username}`} className="name">{u.name}</Link>
            <span className="muted small">@{u.username}</span>
            <p className="bio small">{u.bio || 'No bio yet.'}</p>
            {u.isMe ? <span className="sticker">That's you</span> : <FollowButton userId={u._id} initial={u.isFollowing} small />}
          </motion.div>
        ))}
      </div>
      <h2 className="display h2s">🔥 Trending posts</h2>
      <div className="trend-list">
        {posts === null && [0, 1].map((i) => <div key={i} className="card skeleton" />)}
        {posts && !posts.length && <p className="muted">No posts yet.</p>}
        <AnimatePresence initial={false}>
          {(posts || []).map((p, i) => <PostCard key={p._id} post={p} index={i} onDelete={(id) => setPosts((l) => l.filter((x) => x._id !== id))} />)}
        </AnimatePresence>
      </div>
    </div>
  );
}
