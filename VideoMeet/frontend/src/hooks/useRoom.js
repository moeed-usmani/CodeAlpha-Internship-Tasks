import { useCallback, useEffect, useRef, useState } from 'react';
import { io } from 'socket.io-client';
import { importKey, open, openJson, seal, sealJson } from '../crypto.js';

const ICE = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }, { urls: 'stun:stun1.l.google.com:19302' }] };
const MAX_FILE = 10 * 1024 * 1024;

async function getMedia() {
  const md = navigator.mediaDevices;
  if (!md?.getUserMedia) return { stream: null, note: 'Camera/microphone need HTTPS or localhost.' };
  try {
    return { stream: await md.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } }, audio: { echoCancellation: true, noiseSuppression: true } }) };
  } catch { /* try audio only */ }
  try { return { stream: await md.getUserMedia({ audio: true }), note: 'Camera not available — joined with audio only.' }; } catch { /* fall through */ }
  return { stream: null, note: 'Camera and microphone are blocked or unavailable. You can still chat, share your screen and use the whiteboard.' };
}

export default function useRoom({ roomId, keyStr, token }) {
  const [status, setStatus] = useState('connecting'); // connecting | ready | error
  const [error, setError] = useState('');
  const [note, setNote] = useState('');
  const [selfId, setSelfId] = useState('');
  const [localStream, setLocalStream] = useState(null);
  const [screenStream, setScreenStream] = useState(null);
  const [peers, setPeers] = useState({});
  const [messages, setMessages] = useState([]);
  const [files, setFiles] = useState([]);
  const [mic, setMic] = useState(false);
  const [cam, setCam] = useState(false);
  const [hasAudio, setHasAudio] = useState(false);
  const [hasVideo, setHasVideo] = useState(false);

  const socketRef = useRef(null);
  const keyRef = useRef(null);
  const pcsRef = useRef(new Map());
  const audioTrackRef = useRef(null);
  const videoTrackRef = useRef(null);
  const outVideoRef = useRef(null); // what we currently send as video (camera or screen)
  const screenRef = useRef(null);
  const camStreamRef = useRef(null);
  const boardLogRef = useRef([]);
  const boardSubs = useRef(new Set());
  const urlsRef = useRef([]);

  // ---------- helpers ----------
  const emitState = useCallback(() => {
    socketRef.current?.emit('media-state', {
      mic: !!audioTrackRef.current?.enabled,
      cam: !!videoTrackRef.current?.enabled,
      screen: !!screenRef.current,
    });
  }, []);

  const notifyBoard = (ev) => boardSubs.current.forEach((fn) => fn(ev));

  const setupSenders = (entry, initiator) => {
    const { pc } = entry;
    if (initiator) {
      entry.audioT = pc.addTransceiver('audio', { direction: 'sendrecv' });
      entry.videoT = pc.addTransceiver('video', { direction: 'sendrecv' });
    } else {
      for (const t of pc.getTransceivers()) {
        const kind = t.receiver.track.kind;
        if (kind === 'audio' && !entry.audioT) entry.audioT = t;
        if (kind === 'video' && !entry.videoT) entry.videoT = t;
      }
    }
    [entry.audioT, entry.videoT].forEach((t) => { if (t) { try { t.direction = 'sendrecv'; } catch { /* ignore */ } } });
    entry.audioT?.sender.replaceTrack(audioTrackRef.current).catch(() => {});
    entry.videoT?.sender.replaceTrack(outVideoRef.current).catch(() => {});
  };

  const createPeer = (id) => {
    const existing = pcsRef.current.get(id);
    if (existing) return existing;
    const pc = new RTCPeerConnection(ICE);
    const remote = new MediaStream();
    const entry = { pc, remote, pending: [] };
    pcsRef.current.set(id, entry);
    pc.onicecandidate = (e) => { if (e.candidate) socketRef.current?.emit('signal', { to: id, data: { candidate: e.candidate } }); };
    pc.ontrack = (e) => {
      remote.addTrack(e.track);
      setPeers((p) => ({ ...p, [id]: { ...(p[id] || { id, user: { name: 'Guest' }, state: { mic: true, cam: true, screen: false } }), stream: remote, v: ((p[id] && p[id].v) || 0) + 1 } }));
    };
    return entry;
  };

  const closePeer = (id) => {
    const entry = pcsRef.current.get(id);
    if (!entry) return;
    try { entry.pc.onicecandidate = null; entry.pc.ontrack = null; entry.pc.close(); } catch { /* ignore */ }
    pcsRef.current.delete(id);
  };

  const flush = async (entry) => {
    while (entry.pending.length) await entry.pc.addIceCandidate(entry.pending.shift()).catch(() => {});
  };

  // ---------- main lifecycle ----------
  useEffect(() => {
    let cancelled = false;
    let socket = null;

    const callPeer = async (id) => {
      const entry = createPeer(id);
      setupSenders(entry, true);
      const offer = await entry.pc.createOffer();
      await entry.pc.setLocalDescription(offer);
      socket.emit('signal', { to: id, data: { description: entry.pc.localDescription } });
    };

    const decryptMessage = async (m) => {
      try { const { text } = await openJson(keyRef.current, m.payload); return { id: m.id, from: m.from, ts: m.ts, text }; } catch { return null; }
    };

    const join = () => {
      socket.emit('join-room', { roomId }, async (res) => {
        if (cancelled) return;
        if (!res || res.error) { setError(res?.error || 'Could not join the meeting'); setStatus('error'); return; }
        setSelfId(res.you);
        const map = {};
        res.users.forEach((u) => { map[u.id] = { id: u.id, user: u.user, state: u.state, stream: null, v: 0 }; });
        setPeers(map);

        const hist = (await Promise.all((res.chat || []).map(decryptMessage))).filter(Boolean);
        setMessages(hist);

        const log = [];
        for (const p of res.board || []) { try { log.push(await openJson(keyRef.current, p)); } catch { /* skip */ } }
        boardLogRef.current = log;
        notifyBoard({ type: 'history', list: log });

        if (cancelled) return;
        setStatus('ready');
        emitState();
        for (const u of res.users) { try { await callPeer(u.id); } catch (e) { console.warn('call failed', e); } }
      });
    };

    (async () => {
      try { keyRef.current = await importKey(keyStr); } catch { setError('The encryption key in this invite link is invalid.'); setStatus('error'); return; }

      const { stream, note: mediaNote } = await getMedia();
      if (cancelled) { stream?.getTracks().forEach((t) => t.stop()); return; }
      camStreamRef.current = stream;
      audioTrackRef.current = stream?.getAudioTracks()[0] || null;
      videoTrackRef.current = stream?.getVideoTracks()[0] || null;
      outVideoRef.current = videoTrackRef.current;
      setLocalStream(stream);
      setHasAudio(!!audioTrackRef.current); setHasVideo(!!videoTrackRef.current);
      setMic(!!audioTrackRef.current); setCam(!!videoTrackRef.current);
      if (mediaNote) setNote(mediaNote);

      socket = io({ auth: { token }, transports: ['websocket', 'polling'] });
      socketRef.current = socket;

      socket.on('connect_error', (e) => {
        setError(e.message === 'Unauthorized' ? 'Your session expired. Please log in again.' : 'Cannot reach the server. Is the backend running on port 5004?');
        setStatus('error');
      });
      socket.on('connect', () => {
        // On (re)connect start from a clean slate
        for (const id of [...pcsRef.current.keys()]) closePeer(id);
        setPeers({});
        join();
      });
      socket.on('disconnect', (reason) => { if (reason !== 'io client disconnect') setStatus('connecting'); });

      socket.on('user-joined', ({ id, user, state }) => {
        setPeers((p) => ({ ...p, [id]: { id, user, state, stream: p[id]?.stream || null, v: p[id]?.v || 0 } }));
      });
      socket.on('user-left', ({ id }) => {
        closePeer(id);
        setPeers((p) => { const n = { ...p }; delete n[id]; return n; });
      });
      socket.on('media-state', ({ id, state }) => setPeers((p) => (p[id] ? { ...p, [id]: { ...p[id], state } } : p)));

      socket.on('signal', async ({ from, data }) => {
        try {
          if (data.description) {
            const d = data.description;
            if (d.type === 'offer') {
              const entry = createPeer(from);
              await entry.pc.setRemoteDescription(d);
              setupSenders(entry, false);
              const answer = await entry.pc.createAnswer();
              await entry.pc.setLocalDescription(answer);
              socket.emit('signal', { to: from, data: { description: entry.pc.localDescription } });
              await flush(entry);
            } else {
              const entry = pcsRef.current.get(from);
              if (entry) { await entry.pc.setRemoteDescription(d); await flush(entry); }
            }
          } else if (data.candidate) {
            const entry = pcsRef.current.get(from);
            if (!entry) return;
            if (entry.pc.remoteDescription) await entry.pc.addIceCandidate(data.candidate).catch(() => {});
            else entry.pending.push(data.candidate);
          }
        } catch (e) { console.warn('signal error', e); }
      });

      socket.on('chat', async (m) => { const msg = await decryptMessage(m); if (msg) setMessages((l) => [...l, msg]); });

      socket.on('file', async (f) => {
        try {
          const meta = await openJson(keyRef.current, f.meta);
          const bytes = await open(keyRef.current, f.data);
          const url = URL.createObjectURL(new Blob([bytes], { type: meta.type || 'application/octet-stream' }));
          urlsRef.current.push(url);
          setFiles((l) => [...l, { id: f.id, from: f.from, ts: f.ts, name: meta.name, size: meta.size, url, mine: false }]);
        } catch { /* wrong key or corrupt */ }
      });

      socket.on('board-draw', async ({ payload }) => {
        try { const ev = await openJson(keyRef.current, payload); boardLogRef.current.push(ev); notifyBoard({ type: 'draw', ev }); } catch { /* ignore */ }
      });
      socket.on('board-clear', () => { boardLogRef.current = []; notifyBoard({ type: 'clear' }); });
    })();

    return () => {
      cancelled = true;
      try { socket?.emit('leave-room'); socket?.disconnect(); } catch { /* ignore */ }
      for (const id of [...pcsRef.current.keys()]) closePeer(id);
      camStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenRef.current?.getTracks().forEach((t) => t.stop());
      urlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      urlsRef.current = [];
      socketRef.current = null;
    };
  }, [roomId, keyStr, token, emitState]);

  // ---------- controls ----------
  const toggleMic = useCallback(() => {
    const t = audioTrackRef.current;
    if (!t) return;
    t.enabled = !t.enabled;
    setMic(t.enabled);
    emitState();
  }, [emitState]);

  const toggleCam = useCallback(() => {
    const t = videoTrackRef.current;
    if (!t) return;
    t.enabled = !t.enabled;
    setCam(t.enabled);
    emitState();
  }, [emitState]);

  const setOutgoingVideo = (track) => {
    outVideoRef.current = track;
    pcsRef.current.forEach((e) => e.videoT?.sender.replaceTrack(track).catch(() => {}));
  };

  const stopShare = useCallback(() => {
    const s = screenRef.current;
    if (!s) return;
    s.getTracks().forEach((t) => { t.onended = null; t.stop(); });
    screenRef.current = null;
    setScreenStream(null);
    setOutgoingVideo(videoTrackRef.current);
    emitState();
  }, [emitState]);

  const startShare = useCallback(async () => {
    if (screenRef.current) return;
    if (!navigator.mediaDevices?.getDisplayMedia) { setNote('Screen sharing is not supported in this browser.'); return; }
    try {
      const s = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      const track = s.getVideoTracks()[0];
      screenRef.current = s;
      setScreenStream(s);
      setOutgoingVideo(track);
      track.onended = () => stopShare();
      emitState();
    } catch { /* user cancelled the picker */ }
  }, [emitState, stopShare]);

  const sendMessage = useCallback(async (text) => {
    const t = text.trim();
    if (!t || !keyRef.current) return;
    socketRef.current?.emit('chat', { payload: await sealJson(keyRef.current, { text: t.slice(0, 1000) }) });
  }, []);

  const sendFile = useCallback(async (file) => {
    if (!file || !keyRef.current) return 'No file selected';
    if (file.size > MAX_FILE) return 'File is too large (max 10 MB)';
    const bytes = await file.arrayBuffer();
    const [meta, data] = await Promise.all([
      sealJson(keyRef.current, { name: file.name, size: file.size, type: file.type }),
      seal(keyRef.current, bytes),
    ]);
    socketRef.current?.emit('file', { meta, data });
    const url = URL.createObjectURL(file);
    urlsRef.current.push(url);
    setFiles((l) => [...l, { id: `me-${Date.now()}`, from: { id: 'me', name: 'You' }, ts: Date.now(), name: file.name, size: file.size, url, mine: true }]);
    return '';
  }, []);

  const sendDraw = useCallback(async (ev) => {
    boardLogRef.current.push(ev);
    if (keyRef.current) socketRef.current?.emit('board-draw', { payload: await sealJson(keyRef.current, ev) });
  }, []);

  const clearBoard = useCallback(() => {
    boardLogRef.current = [];
    socketRef.current?.emit('board-clear');
    notifyBoard({ type: 'clear' });
  }, []);

  // Whiteboard subscribes on mount; it immediately receives the full history to redraw.
  const subscribeBoard = useCallback((fn) => {
    boardSubs.current.add(fn);
    fn({ type: 'history', list: boardLogRef.current });
    return () => boardSubs.current.delete(fn);
  }, []);

  return {
    status, error, note, setNote, selfId, localStream, screenStream, peers, messages, files,
    mic, cam, hasAudio, hasVideo, sharing: !!screenStream,
    toggleMic, toggleCam, startShare, stopShare, sendMessage, sendFile, sendDraw, clearBoard, subscribeBoard,
  };
}
