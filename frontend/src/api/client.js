const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

async function request(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || 'Request failed');
  }
  return res.json();
}

export const api = {
  // Audio
  uploadAudio: async (blob) => {
    const form = new FormData();
    form.append('audio', blob, `chunk_${Date.now()}.webm`);
    const res = await fetch(`${API_BASE}/audio/upload`, { method: 'POST', body: form });
    return res.json();
  },

  // Finalize any active lecture session (call when user stops recording)
  finalizeLecture: () => request('/audio/finalize', { method: 'POST', body: JSON.stringify({}) }),

  // Notes
  getTodayNotes: () => request('/notes/today'),
  generateNotes: (text) => request('/notes/generate', { method: 'POST', body: JSON.stringify({ text }) }),
  explainConcept: (text) => request('/notes/explain', { method: 'POST', body: JSON.stringify({ text }) }),

  // Reminders
  getTodayReminders: () => request('/reminders/today'),
  completeReminder: (id) => request(`/reminders/${id}/complete`, { method: 'PATCH' }),

  // Discussions
  getTodayDiscussions: () => request('/discussions/today'),

  // Visualizations
  getTodayVisualizations: () => request('/visualizations/today'),
  generateFlowchart: (text) => request('/visualizations/flowchart', { method: 'POST', body: JSON.stringify({ text }) }),
  detectVisualization: (text) => request('/visualizations/detect', { method: 'POST', body: JSON.stringify({ text }) }),

  // Timeline
  getTodayTimeline: () => request('/timeline/today'),
  getTimelineSummary: () => request('/timeline/summary'),

  // Translation
  translateText: (text, targetLang) => request('/translate/text', { method: 'POST', body: JSON.stringify({ text, targetLang }) }),
  translateNotes: (notes, targetLang) => request('/translate/notes', { method: 'POST', body: JSON.stringify({ notes, targetLang }) }),
};
