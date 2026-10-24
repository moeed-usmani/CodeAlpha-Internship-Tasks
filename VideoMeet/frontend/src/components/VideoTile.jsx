import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import useSpeaking from '../hooks/useSpeaking.js';
import Icon from './Icon.jsx';

export default function VideoTile({ stream, speakStream, name, state, local, pinned, onPin, big }) {
  const ref = useRef(null);
  const speaking = useSpeaking(speakStream);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const next = stream || null;
    if (el.srcObject !== next) el.srcObject = next;
    if (next) el.play?.().catch(() => {});
  }, [stream]);

  const showVideo = !!stream && (state.screen || state.cam);
  const letter = (name || '?').trim()[0]?.toUpperCase() || '?';

  return (
    <motion.div layout className={`tile ${speaking ? 'speaking' : ''} ${big ? 'big' : ''}`} initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.85 }} transition={{ type: 'spring', damping: 22, stiffness: 240 }}>
      <i className="corner tl" /><i className="corner tr" /><i className="corner bl" /><i className="corner br" />
      <video ref={ref} autoPlay playsInline muted={!!local} className={`${local && !state.screen ? 'mirror' : ''} ${state.screen ? 'contain' : ''}`} style={{ opacity: showVideo ? 1 : 0 }} />
      {!showVideo && (
        <div className="avatar-fill">
          <div className="avatar-ring"><span>{letter}</span></div>
          <small className="mono">{stream || local ? 'CAMERA OFF' : 'CONNECTING…'}</small>
        </div>
      )}
      <div className="tile-label">
        <span className="mono">{name}{local ? ' (you)' : ''}</span>
        <span className={`mini ${state.mic ? '' : 'off'}`}><Icon name={state.mic ? 'mic' : 'micOff'} size={14} /></span>
      </div>
      {state.screen && <span className="badge-live mono">SCREEN</span>}
      <button className={`pin ${pinned ? 'on' : ''}`} onClick={onPin} title={pinned ? 'Unpin' : 'Pin'}><Icon name="pin" size={14} /></button>
    </motion.div>
  );
}
