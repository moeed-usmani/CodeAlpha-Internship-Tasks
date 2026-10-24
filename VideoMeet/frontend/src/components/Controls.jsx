import { motion } from 'framer-motion';
import Icon from './Icon.jsx';

function Btn({ icon, label, onClick, active, off, danger, disabled }) {
  return (
    <motion.button whileHover={{ y: -4 }} whileTap={{ scale: 0.9 }} className={`ctl ${active ? 'active' : ''} ${off ? 'off' : ''} ${danger ? 'danger' : ''}`} onClick={onClick} disabled={disabled} title={label}>
      <Icon name={icon} size={22} />
      <span className="mono">{label}</span>
    </motion.button>
  );
}

export default function Controls({ room, view, setView, panel, setPanel, onLeave }) {
  return (
    <motion.div className="controls" initial={{ y: 100 }} animate={{ y: 0 }} transition={{ type: 'spring', damping: 20, delay: 0.2 }}>
      <Btn icon={room.mic ? 'mic' : 'micOff'} label={room.mic ? 'Mute' : 'Unmute'} off={!room.mic} disabled={!room.hasAudio} onClick={room.toggleMic} />
      <Btn icon={room.cam ? 'cam' : 'camOff'} label={room.cam ? 'Stop cam' : 'Start cam'} off={!room.cam} disabled={!room.hasVideo} onClick={room.toggleCam} />
      <Btn icon="screen" label={room.sharing ? 'Stop share' : 'Share'} active={room.sharing} onClick={room.sharing ? room.stopShare : room.startShare} />
      <Btn icon={view === 'board' ? 'video' : 'board'} label={view === 'board' ? 'Video' : 'Board'} active={view === 'board'} onClick={() => setView(view === 'board' ? 'video' : 'board')} />
      <Btn icon="chat" label="Panel" active={!!panel} onClick={() => setPanel(panel ? null : 'chat')} />
      <Btn icon="phone" label="Leave" danger onClick={onLeave} />
    </motion.div>
  );
}
