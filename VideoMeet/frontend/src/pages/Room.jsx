import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext.jsx';
import useRoom from '../hooks/useRoom.js';
import { parseInvite } from '../crypto.js';
import VideoTile from '../components/VideoTile.jsx';
import Whiteboard from '../components/Whiteboard.jsx';
import SidePanel from '../components/SidePanel.jsx';
import Controls from '../components/Controls.jsx';
import Icon from '../components/Icon.jsx';

const fmtTimer = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

// Wrapper: makes sure we have an encryption key before any hooks that need it run.
export default function Room() {
  const { roomId } = useParams();
  const location = useLocation();
  const keyStr = location.hash.slice(1);
  if (!keyStr) return <MissingKey roomId={roomId} />;
  return <RoomInner key={`${roomId}#${keyStr}`} roomId={roomId.toLowerCase()} keyStr={keyStr} />;
}

function MissingKey({ roomId }) {
  const nav = useNavigate();
  const [val, setVal] = useState('');
  const [err, setErr] = useState('');
  const go = (e) => {
    e.preventDefault();
    const inv = parseInvite(val) || parseInvite(`${roomId}.${val.trim()}`);
    if (!inv) { setErr('That does not look like a valid invite.'); return; }
    nav(`/room/${inv.roomId}#${inv.key}`, { replace: true });
  };
  return (
    <div className="center-screen">
      <form className="panel neon-box" style={{ width: 'min(460px, 92vw)' }} onSubmit={go}>
        <h3><Icon name="lock" /> ENCRYPTION KEY REQUIRED</h3>
        <p className="muted small">This link is missing its key. Paste the full invite link or the invite code you were sent.</p>
        <input className="field" placeholder="Invite link or code" value={val} onChange={(e) => setVal(e.target.value)} />
        {err && <p className="err small mono">! {err}</p>}
        <div className="row gap"><button type="button" className="btn ghost" onClick={() => nav('/')}>Back</button><button className="btn grow">Join</button></div>
      </form>
    </div>
  );
}

function RoomInner({ roomId, keyStr }) {
  const nav = useNavigate();
  const { auth } = useAuth();
  const room = useRoom({ roomId, keyStr, token: auth.token });
  const [view, setView] = useState('video');
  const [panel, setPanel] = useState(null);
  const [pinId, setPinId] = useState(null);
  const [secs, setSecs] = useState(0);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const inviteLink = `${window.location.origin}/room/${roomId}#${keyStr}`;
  const copy = async (text, label) => {
    try { await navigator.clipboard.writeText(text); } catch {
      const ta = document.createElement('textarea'); ta.value = text; document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch { /* ignore */ }
      document.body.removeChild(ta);
    }
    setCopied(label);
    setTimeout(() => setCopied(''), 1800);
  };

  const myState = { mic: room.mic, cam: room.cam, screen: room.sharing };
  const tiles = useMemo(() => {
    const me = { id: 'me', name: auth.user.name, local: true, state: myState, stream: room.sharing ? room.screenStream : room.localStream, speakStream: room.localStream };
    const others = Object.values(room.peers).map((p) => ({ id: p.id, name: p.user?.name || 'Guest', local: false, state: p.state || { mic: true, cam: true, screen: false }, stream: p.stream, speakStream: p.stream }));
    return [me, ...others];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room.peers, room.localStream, room.screenStream, room.sharing, room.mic, room.cam, auth.user.name]);

  const sharer = tiles.find((t) => t.state.screen);
  const focusId = tiles.some((t) => t.id === pinId) ? pinId : sharer?.id;
  const focus = tiles.find((t) => t.id === focusId);
  const rest = focus ? tiles.filter((t) => t.id !== focus.id) : tiles;
  const togglePin = (id) => setPinId((cur) => (cur === id ? null : id));

  const renderTile = (t, big) => (
    <VideoTile key={t.id} big={big} stream={t.stream} speakStream={t.speakStream} name={t.name} state={t.state} local={t.local} pinned={pinId === t.id} onPin={() => togglePin(t.id)} />
  );

  const people = tiles.map((t) => ({ id: t.id, name: t.name, local: t.local, state: t.state }));
  const leave = () => nav('/');

  if (room.status === 'error') {
    return (
      <div className="center-screen">
        <div className="panel neon-box" style={{ maxWidth: 460, textAlign: 'center' }}>
          <h2 className="glitch" data-text="CONNECTION FAILED">CONNECTION FAILED</h2>
          <p className="err mono small">{room.error}</p>
          <button className="btn" onClick={leave}>Back to lobby</button>
        </div>
      </div>
    );
  }
  if (room.status === 'connecting' && !room.selfId) {
    return (
      <div className="center-screen">
        <div className="loader"><i /><i /><i /></div>
        <p className="mono muted">ESTABLISHING SECURE CHANNEL…</p>
      </div>
    );
  }

  return (
    <div className="room">
      <header className="room-top">
        <div className="logo mono small-logo">NEXUS<span>//</span>MEET</div>
        <div className="row gap wrap grow center-x">
          <span className="chip mono"><Icon name="lock" size={13} /> E2E ENCRYPTED</span>
          <span className="chip mono"><Icon name="users" size={13} /> {tiles.length}</span>
          <span className="chip mono">{fmtTimer(secs)}</span>
          {room.status === 'connecting' && <span className="chip warn mono">RECONNECTING…</span>}
        </div>
        <div className="row gap">
          <button className="btn ghost sm" onClick={() => copy(inviteLink, 'link')}><Icon name="copy" size={15} /> {copied === 'link' ? 'Copied!' : 'Invite link'}</button>
          <button className="btn ghost sm" onClick={() => copy(`${roomId}.${keyStr}`, 'code')}>{copied === 'code' ? 'Copied!' : 'Code'}</button>
        </div>
      </header>

      <AnimatePresence>
        {room.note && (
          <motion.div className="note mono" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {room.note}
            <button className="icon-btn" onClick={() => room.setNote('')} aria-label="Dismiss"><Icon name="x" size={14} /></button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="room-main">
        <section className="stage">
          {view === 'board' ? (
            <>
              <div className="strip">{tiles.map((t) => renderTile(t, false))}</div>
              <Whiteboard subscribe={room.subscribeBoard} sendDraw={room.sendDraw} clear={room.clearBoard} />
            </>
          ) : focus ? (
            <div className="spotlight">
              <div className="spot-main">{renderTile(focus, true)}</div>
              <div className="spot-side">{rest.map((t) => renderTile(t, false))}</div>
            </div>
          ) : (
            <div className={`tiles n${Math.min(tiles.length, 8)}`}>{tiles.map((t) => renderTile(t, false))}</div>
          )}
          {tiles.length === 1 && view === 'video' && (
            <p className="alone mono muted">You're the only one here. Share the invite link to bring people in.</p>
          )}
        </section>
        <AnimatePresence>
          {panel && <SidePanel key="panel" tab={panel} setTab={setPanel} onClose={() => setPanel(null)} room={room} people={people} />}
        </AnimatePresence>
      </div>

      <Controls room={room} view={view} setView={setView} panel={panel} setPanel={setPanel} onLeave={leave} />
    </div>
  );
}
