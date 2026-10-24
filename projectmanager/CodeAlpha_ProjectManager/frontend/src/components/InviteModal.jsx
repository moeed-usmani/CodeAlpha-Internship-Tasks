import { useState } from 'react';
import Modal from './Modal.jsx';
import Avatar from './Avatar.jsx';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useUI } from '../context/UIContext.jsx';

export default function InviteModal({ project, onClose, onChanged }) {
  const { user } = useAuth();
  const { toast } = useUI();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const isOwner = String(project.owner) === String(user._id);

  const invite = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { onChanged(await api.invite(project._id, email)); setEmail(''); toast('Teammate added', '🤝'); } catch (err) { toast(err.message, '⚠️'); } finally { setBusy(false); }
  };
  const remove = async (m) => {
    try { onChanged(await api.removeMember(project._id, m._id)); toast(`${m.name} removed`, '👋'); } catch (err) { toast(err.message, '⚠️'); }
  };

  return (
    <Modal onClose={onClose}>
      <div className="form">
        <div className="modal-head"><h2>Team</h2><button className="icon-btn" onClick={onClose}>✕</button></div>
        <form className="invite-row" onSubmit={invite}>
          <input className="input" type="email" placeholder="Teammate's email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <button className="btn" disabled={busy}>Add</button>
        </form>
        <p className="muted small">They need a Nimbus account first. Demo: amna@nimbus.dev · bilal@nimbus.dev · carla@nimbus.dev</p>
        <div className="member-list">
          {project.members.map((m) => (
            <div key={m._id} className="member">
              <Avatar user={m} size={38} />
              <div className="member-info"><b>{m.name}{String(m._id) === String(project.owner) && <span className="tag">Owner</span>}</b><span className="muted small">{m.email}</span></div>
              {(isOwner || m._id === user._id) && String(m._id) !== String(project.owner) && (
                <button className="link danger-link" onClick={() => remove(m)}>{m._id === user._id ? 'Leave' : 'Remove'}</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </Modal>
  );
}
