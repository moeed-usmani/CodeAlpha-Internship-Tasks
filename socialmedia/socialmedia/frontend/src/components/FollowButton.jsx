import { useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useUI } from '../context/UIContext.jsx';

export default function FollowButton({ userId, initial, small = false, onChange }) {
  const { toast } = useUI();
  const [following, setFollowing] = useState(initial);
  const [busy, setBusy] = useState(false);

  const click = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const r = await api.follow(userId);
      setFollowing(r.following);
      if (onChange) onChange(r);
      toast(r.following ? 'Followed!' : 'Unfollowed', r.following ? '🎉' : '👋');
    } catch (e) { toast(e.message, '⚠️'); } finally { setBusy(false); }
  };

  return (
    <motion.button whileTap={{ scale: 0.92 }} className={`btn ${small ? 'small' : ''} ${following ? 'ghost' : 'green'}`} onClick={click} disabled={busy}>
      {following ? 'Following ✓' : 'Follow +'}
    </motion.button>
  );
}
