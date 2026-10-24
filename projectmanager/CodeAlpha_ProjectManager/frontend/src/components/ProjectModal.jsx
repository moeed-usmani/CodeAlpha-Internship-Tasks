import { useState } from 'react';
import Modal from './Modal.jsx';
import { api } from '../api.js';
import { useUI } from '../context/UIContext.jsx';
import { PROJECT_COLORS, PROJECT_EMOJIS } from '../utils.js';

export default function ProjectModal({ project, onClose, onSaved, onDeleted }) {
  const { toast } = useUI();
  const editing = !!project;
  const [f, setF] = useState({ name: project?.name || '', description: project?.description || '', emoji: project?.emoji || '🚀', color: project?.color || PROJECT_COLORS[0] });
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      const saved = editing ? await api.updateProject(project._id, f) : await api.createProject(f);
      toast(editing ? 'Project updated' : 'Project created', '✨');
      onSaved(saved);
    } catch (err) { toast(err.message, '⚠️'); } finally { setBusy(false); }
  };
  const remove = async () => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try { await api.deleteProject(project._id); toast('Project deleted', '🗑'); onDeleted(); } catch (err) { toast(err.message, '⚠️'); }
  };

  return (
    <Modal onClose={onClose}>
      <form className="form" onSubmit={submit}>
        <div className="modal-head"><h2>{editing ? 'Edit project' : 'New project'}</h2><button type="button" className="icon-btn" onClick={onClose}>✕</button></div>
        <label>Name<input className="input" value={f.name} maxLength={60} autoFocus required onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="e.g. Website relaunch" /></label>
        <label>Description<textarea className="input" rows={2} maxLength={240} value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="What is this project about?" /></label>
        <div><span className="lbl">Icon</span><div className="emoji-grid">{PROJECT_EMOJIS.map((em) => <button type="button" key={em} className={`emoji-opt ${f.emoji === em ? 'on' : ''}`} onClick={() => setF({ ...f, emoji: em })}>{em}</button>)}</div></div>
        <div><span className="lbl">Colour</span><div className="swatches">{PROJECT_COLORS.map((c) => <button type="button" key={c} className={`swatch ${f.color === c ? 'on' : ''}`} style={{ background: c }} onClick={() => setF({ ...f, color: c })} aria-label={c} />)}</div></div>
        <div className="row-end">
          {editing && <button type="button" className="btn danger" onClick={remove}>Delete</button>}
          <button className="btn" disabled={busy}>{busy ? 'Saving…' : editing ? 'Save changes' : 'Create project'}</button>
        </div>
      </form>
    </Modal>
  );
}
