let token = '';
export const setToken = (t) => { token = t || ''; };

const call = async (path, { method = 'GET', body } = {}) => {
  const res = await fetch(`/api${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  register: (b) => call('/auth/register', { method: 'POST', body: b }),
  login: (b) => call('/auth/login', { method: 'POST', body: b }),
  projects: () => call('/projects'),
  stats: () => call('/projects/stats/me'),
  mine: () => call('/tasks/mine'),
  createProject: (b) => call('/projects', { method: 'POST', body: b }),
  project: (id) => call(`/projects/${id}`),
  updateProject: (id, b) => call(`/projects/${id}`, { method: 'PUT', body: b }),
  deleteProject: (id) => call(`/projects/${id}`, { method: 'DELETE' }),
  invite: (id, email) => call(`/projects/${id}/members`, { method: 'POST', body: { email } }),
  removeMember: (id, uid) => call(`/projects/${id}/members/${uid}`, { method: 'DELETE' }),
  createTask: (pid, b) => call(`/projects/${pid}/tasks`, { method: 'POST', body: b }),
  task: (id) => call(`/tasks/${id}`),
  updateTask: (id, b) => call(`/tasks/${id}`, { method: 'PUT', body: b }),
  moveTask: (id, b) => call(`/tasks/${id}/move`, { method: 'PUT', body: b }),
  deleteTask: (id) => call(`/tasks/${id}`, { method: 'DELETE' }),
  addComment: (id, text) => call(`/tasks/${id}/comments`, { method: 'POST', body: { text } }),
  deleteComment: (cid) => call(`/comments/${cid}`, { method: 'DELETE' }),
  notifications: () => call('/notifications'),
  readAll: () => call('/notifications/read-all', { method: 'POST' }),
  readOne: (id) => call(`/notifications/${id}/read`, { method: 'POST' }),
};
