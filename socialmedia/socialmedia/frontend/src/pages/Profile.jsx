import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Avatar from '../components/Avatar.jsx';
import FollowButton from '../components/FollowButton.jsx';
import PostCard from '../components/PostCard.jsx';
import Modal from '../components/Modal.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';
import { api } from '../api.js';
import { EMOJIS, COLORS } from '../utils.js';

function EditModal({ me, onClose, onSaved }) {
  const { toast } = useUI();
  const [f, setF] = useState({ name: me.name, bio: me.bio || '', avatar: me.avatar, color: me.color });
  const [busy, setBusy] = useState(false);
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { user } = await api.updateMe(f);
      onSaved(user);
      toast('Profile updated', '🎨');
      onClose();
    } catch (err) { toast(err.message, '⚠️'); } finally { setBusy(false); }
  };
  return (
    <Modal title="Edit profile" onClose={onClose}>
      <form className="edit-form" onSubmit={save}>
        <div className="edit-preview" style={{ background: f.color }}><Avatar user={f} size={80} link={false} /></div>
        <label>Name<input className="input" value={f.name} maxLength={40} onChange={(e) => setF({ ...f, name: e.target.value })} required /></label>
        <label>Bio<textarea className="input" rows={3} maxLength={160} value={f.bio} onChange={(e) => setF({ ...f, bio: e.target.value })} /></label>
        <div>
          <span className="lbl">Emoji</span>
          <div className="emoji-grid">{EMOJIS.map((e) => <button type="button" key={e} className={`emoji-opt ${f.avatar === e ? 'on' : ''}`} onClick={() => setF({ ...f, avatar: e })}>{e}</button>)}</div>
        </div>
        <div>
          <span className="lbl">Colour</span>
          <div className="swatches big">{COLORS.map((c) => <button type="button" key={c} className={`swatch ${f.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setF({ ...f, color: c })} aria-label={c} />)}</div>
        </div>
        <button className="btn pink full" disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</button>
      </form>
    </Modal>
  );
}

function PeopleModal({ username, type, onClose }) {
  const [list, setList] = useState(null);
  useEffect(() => {
    let live = true;
    api.people(username, type).then((d) => { if (live) setList(d); }).catch(() => { if (live) setList([]); });
    return () => { live = false; };
  }, [username, type]);
  return (
    <Modal title={type === 'followers' ? 'Followers' : 'Following'} onClose={onClose}>
      <div className="people-list">
        {list === null && <p className="muted">Loading…</p>}
        {list && !list.length && <p className="muted">Nobody here yet.</p>}
        {(list || []).map((u) => (
          <Link key={u._id} to={`/u/${u.username}`} className="person" onClick={onClose}>
            <Avatar user={u} size={40} link={false} />
            <div className="person-info"><b>{u.name}</b><span className="muted small">@{u.username}</span></div>
          </Link>
        ))}
      </div>
    </Modal>
  );
}

export default function Profile() {
  const { username } = useParams();
  const { user: me, updateUser } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [edit, setEdit] = useState(false);
  const [people, setPeople] = useState(null);
  const [followers, setFollowers] = useState(0);

  useEffect(() => {
    let live = true;
    setData(null); setError('');
    api.profile(username)
      .then((d) => { if (live) { setData(d); setFollowers(d.user.followersCount); } })
      .catch((e) => { if (live) setError(e.message); });
    return () => { live = false; };
  }, [username]);

  if (error) return <div className="card empty"><span className="big-emoji">🛸</span><h3 className="display">{error}</h3><Link to="/home" className="btn">Back home</Link></div>;
  if (!data) return <div className="card skeleton tall" />;

  const { user, isMe, isFollowing, posts } = data;
  const shown = isMe ? { ...user, ...me } : user;

  return (
    <div className="profile">
      <div className="card profile-card">
        <div className="banner" style={{ background: shown.color }}>
          {['✦', '●', '▲', '◆', '✚'].map((s, i) => <span key={i} className="banner-shape" style={{ left: `${8 + i * 20}%`, animationDelay: `${i * 0.6}s` }}>{s}</span>)}
        </div>
        <motion.div className="profile-avatar" initial={{ rotateY: 180, scale: 0.5 }} animate={{ rotateY: 0, scale: 1 }} transition={{ type: 'spring', stiffness: 140, damping: 14 }}>
          <Avatar user={shown} size={112} link={false} />
        </motion.div>
        <div className="profile-body">
          <div className="profile-top">
            <div>
              <h1 className="display h1s">{shown.name}</h1>
              <span className="muted">@{shown.username}</span>
            </div>
            {isMe ? <button className="btn" onClick={() => setEdit(true)}>✏️ Edit profile</button> : <FollowButton userId={user._id} initial={isFollowing} onChange={(r) => setFollowers(r.followersCount)} />}
          </div>
          <p className="profile-bio">{shown.bio || (isMe ? 'Add a bio to tell people who you are ✍️' : 'No bio yet.')}</p>
          <div className="stats">
            <div className="stat"><b>{posts.length}</b><span>Posts</span></div>
            <button className="stat" onClick={() => setPeople('followers')}><b>{followers}</b><span>Followers</span></button>
            <button className="stat" onClick={() => setPeople('following')}><b>{user.followingCount}</b><span>Following</span></button>
          </div>
        </div>
      </div>

      <h2 className="display h2s">Posts</h2>
      {!posts.length && <div className="card empty"><span className="big-emoji">🫥</span><p className="muted">No posts yet.</p></div>}
      <AnimatePresence initial={false}>
        {posts.map((p, i) => (
          <PostCard key={p._id} post={p} index={i} onDelete={(id) => setData((d) => ({ ...d, posts: d.posts.filter((x) => x._id !== id) }))} />
        ))}
      </AnimatePresence>

      <AnimatePresence>
        {edit && <EditModal key="edit" me={shown} onClose={() => setEdit(false)} onSaved={(u) => { updateUser(u); }} />}
        {people && <PeopleModal key="people" username={user.username} type={people} onClose={() => setPeople(null)} />}
      </AnimatePresence>
    </div>
  );
}
