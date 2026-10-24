import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Avatar from './Avatar.jsx';
import FollowButton from './FollowButton.jsx';
import { api } from '../api.js';

export default function WhoToFollow() {
  const [list, setList] = useState(null);
  useEffect(() => {
    let live = true;
    api.suggestions().then((d) => { if (live) setList(d); }).catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, []);

  return (
    <aside className="rail">
      <div className="card rail-card">
        <h3 className="display small-h">Who to follow</h3>
        {list === null && <p className="muted small">Loading…</p>}
        {list && !list.length && <p className="muted small">You're following everyone. Legend. 👑</p>}
        {(list || []).map((u, i) => (
          <motion.div key={u._id} className="person" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}>
            <Avatar user={u} size={40} />
            <div className="person-info">
              <Link to={`/u/${u.username}`} className="name">{u.name}</Link>
              <span className="muted small">@{u.username}</span>
            </div>
            <FollowButton userId={u._id} initial={false} small />
          </motion.div>
        ))}
      </div>
      <div className="card rail-card sticker-card">
        <span className="big-emoji">🪐</span>
        <p><b>Pro tip:</b> follow a few people, then switch the feed to <u>Following</u> for a calmer orbit.</p>
      </div>
    </aside>
  );
}
