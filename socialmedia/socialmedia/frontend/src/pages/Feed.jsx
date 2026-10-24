import { useEffect, useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Composer from '../components/Composer.jsx';
import PostCard from '../components/PostCard.jsx';
import WhoToFollow from '../components/WhoToFollow.jsx';
import { api } from '../api.js';

const tabs = [['all', '🌍 For you'], ['following', '👥 Following']];

export default function Feed() {
  const [scope, setScope] = useState('all');
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let live = true;
    setPosts(null); setError('');
    api.feed(scope).then((d) => { if (live) setPosts(d); }).catch((e) => { if (live) { setError(e.message); setPosts([]); } });
    return () => { live = false; };
  }, [scope]);

  return (
    <div className="two-col">
      <div className="col-main">
        <Composer onPosted={(p) => setPosts((l) => [p, ...(l || [])])} />
        <div className="tabs">
          {tabs.map(([k, label]) => (
            <button key={k} className={`tab ${scope === k ? 'on' : ''}`} onClick={() => setScope(k)}>{label}</button>
          ))}
        </div>
        {error && <p className="error">⚠️ {error} — is the backend running?</p>}
        {posts === null && [0, 1, 2].map((i) => <div key={i} className="card skeleton" />)}
        {posts && !posts.length && !error && (
          <div className="card empty">
            <span className="big-emoji">🌌</span>
            <h3 className="display">{scope === 'following' ? 'Your orbit is quiet' : 'Nothing here yet'}</h3>
            <p className="muted">{scope === 'following' ? 'Follow some people to see their posts here.' : 'Be the first to post something!'}</p>
          </div>
        )}
        <AnimatePresence initial={false}>
          {(posts || []).map((p, i) => (
            <PostCard key={p._id} post={p} index={i} onDelete={(id) => setPosts((l) => l.filter((x) => x._id !== id))} />
          ))}
        </AnimatePresence>
      </div>
      <WhoToFollow />
    </div>
  );
}
