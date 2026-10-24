// End-to-end encryption helpers (AES-256-GCM via the Web Crypto API).
// The key lives only in the invite link's #fragment, which browsers never send to servers.
const enc = new TextEncoder();
const dec = new TextDecoder();

export const toB64u = (bytes) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
export const fromB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), (c) => c.charCodeAt(0));

export const randomKey = () => toB64u(crypto.getRandomValues(new Uint8Array(32)));
export const importKey = (b64u) => crypto.subtle.importKey('raw', fromB64u(b64u), 'AES-GCM', false, ['encrypt', 'decrypt']);

// output layout: [12 byte IV][ciphertext+tag]
export async function seal(key, bytes) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, bytes));
  const out = new Uint8Array(12 + ct.length);
  out.set(iv, 0);
  out.set(ct, 12);
  return out.buffer;
}
export async function open(key, buf) {
  const u = new Uint8Array(buf);
  return crypto.subtle.decrypt({ name: 'AES-GCM', iv: u.slice(0, 12) }, key, u.slice(12));
}
export const sealJson = (key, obj) => seal(key, enc.encode(JSON.stringify(obj)));
export const openJson = async (key, buf) => JSON.parse(dec.decode(await open(key, buf)));

// Parses a full invite link, "roomId#key" or "roomId.key"
export function parseInvite(input) {
  const s = (input || '').trim();
  let m = s.match(/\/room\/([a-z0-9]+)#([\w-]+)/i);
  if (!m) m = s.match(/^([a-z0-9]{12})[#.]([\w-]{20,})$/i);
  return m ? { roomId: m[1].toLowerCase(), key: m[2] } : null;
}
