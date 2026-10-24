const call = async (path, { method = 'GET', body } = {}) => {
  let auth = null;
  try { auth = JSON.parse(localStorage.getItem('nexus_auth')); } catch { /* ignore */ }
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  register: (b) => call('/auth/register', { method: 'POST', body: b }),
  login: (b) => call('/auth/login', { method: 'POST', body: b }),
  createRoom: (title) => call('/rooms', { method: 'POST', body: { title } }),
  myRooms: () => call('/rooms/mine'),
  room: (id) => call(`/rooms/${id}`),
};
