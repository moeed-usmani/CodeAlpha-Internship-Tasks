import { useEffect, useState } from 'react';

// Returns true while the given stream's audio is above a small loudness threshold.
export default function useSpeaking(stream) {
  const [speaking, setSpeaking] = useState(false);
  const track = stream?.getAudioTracks ? stream.getAudioTracks()[0] : null;

  useEffect(() => {
    if (!track) { setSpeaking(false); return undefined; }
    let ctx; let src; let raf; let last = false; let alive = true;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      src = ctx.createMediaStreamSource(new MediaStream([track]));
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      const data = new Uint8Array(an.frequencyBinCount);
      const tick = () => {
        if (!alive) return;
        an.getByteFrequencyData(data);
        let sum = 0;
        for (let i = 0; i < data.length; i++) sum += data[i];
        const s = track.enabled && sum / data.length > 14;
        if (s !== last) { last = s; setSpeaking(s); }
        raf = requestAnimationFrame(tick);
      };
      tick();
    } catch { /* audio analysis is a nice-to-have */ }
    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      try { src?.disconnect(); ctx?.close(); } catch { /* ignore */ }
    };
  }, [track]);

  return speaking;
}
