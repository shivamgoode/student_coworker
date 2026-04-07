import { useState, useEffect } from 'react';
import { api } from '../api/client';

const PRIORITY_STYLES = {
  high: { border: 'border-red-500/30', bg: 'bg-red-500/5', dot: 'bg-red-400', text: 'text-red-400' },
  medium: { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5', dot: 'bg-yellow-400', text: 'text-yellow-400' },
  low: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/5', dot: 'bg-emerald-400', text: 'text-emerald-400' },
};

export default function RemindersView() {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFile, setOpenFile] = useState(null);

  useEffect(() => {
    loadReminders();
    const interval = setInterval(loadReminders, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadReminders() {
    try {
      const data = await api.getTodayReminders();
      setReminders(data.reminders || []);
    } catch (err) {
      console.error('Failed to load reminders:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleComplete(id) {
    try {
      await api.completeReminder(id);
      setReminders((prev) =>
        prev.map((r) => (r._id === id ? { ...r, completed: true } : r))
      );
    } catch (err) {
      console.error('Failed to complete reminder:', err);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // File opened
  if (openFile !== null && reminders[openFile]) {
    const r = reminders[openFile];
    const ps = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.medium;

    return (
      <div className="fade-in">
        <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-pink-400 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to files
        </button>

        <div className="glass-strong rounded-2xl p-8 slide-up">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="tag tag-pink">REMINDER</span>
                <span className={`tag ${r.priority === 'high' ? 'text-red-400 border-red-500/20 bg-red-500/8' : r.priority === 'low' ? 'tag-green' : 'text-yellow-400 border-yellow-500/20 bg-yellow-500/8'}`}>
                  {r.priority?.toUpperCase() || 'MEDIUM'}
                </span>
                {r.completed && <span className="tag tag-green">COMPLETED</span>}
              </div>
              <h2 className={`text-2xl font-bold ${r.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                {r.task}
              </h2>
            </div>

            {!r.completed && (
              <button onClick={() => handleComplete(r._id)} className="btn-neon text-xs">
                Mark Complete
              </button>
            )}
          </div>

          <div className="section-line mb-6" style={{ background: 'linear-gradient(90deg, #ec4899, transparent)' }} />

          {/* Deadline */}
          {r.deadline && (
            <section className="mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-medium text-yellow-400">Due: {r.deadline}</span>
              </div>
            </section>
          )}

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Created at</p>
              <p className="text-sm text-gray-300 font-mono">
                {new Date(r.createdAt || r.date).toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Speaker</p>
              <p className="text-sm text-gray-300">{r.speaker || 'Auto-detected'}</p>
            </div>
          </div>

          {/* Source */}
          {r.sourceTranscript && (
            <section className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Source Transcript</h3>
              <p className="text-xs text-gray-600 leading-relaxed italic">"{r.sourceTranscript}"</p>
            </section>
          )}
        </div>
      </div>
    );
  }

  // File list
  const pending = reminders.filter((r) => !r.completed);
  const completed = reminders.filter((r) => r.completed);

  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Reminders</h2>
          <p className="text-sm text-gray-500">
            {pending.length} pending, {completed.length} completed
          </p>
        </div>
      </div>

      {reminders.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <p className="text-lg font-medium">No reminders detected yet</p>
          <p className="text-sm mt-1">Mentioned deadlines and tasks will appear here</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pending */}
          {pending.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Pending</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map((r, i) => {
                  const idx = reminders.indexOf(r);
                  const ps = PRIORITY_STYLES[r.priority] || PRIORITY_STYLES.medium;
                  return (
                    <button key={r._id || i} onClick={() => setOpenFile(idx)} className={`file-card p-5 text-left group border-l-2 ${ps.border}`}>
                      <div className="flex items-start gap-3 mb-2">
                        <div className={`w-10 h-10 rounded-lg ${ps.bg} flex items-center justify-center flex-shrink-0`}>
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className={ps.text}>
                            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="font-semibold text-white text-sm truncate group-hover:text-pink-400 transition-colors">
                            {r.task}
                          </h3>
                          {r.deadline && <p className="text-xs text-yellow-400/70 mt-0.5">{r.deadline}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`w-1.5 h-1.5 rounded-full ${ps.dot}`} />
                        <span className={`text-xs ${ps.text}`}>{r.priority || 'medium'}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-3">Completed</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {completed.map((r, i) => {
                  const idx = reminders.indexOf(r);
                  return (
                    <button key={r._id || i} onClick={() => setOpenFile(idx)} className="file-card p-5 text-left group opacity-50">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
                        </div>
                        <span className="text-sm text-gray-500 line-through">{r.task}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
