import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function DiscussionsView() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFile, setOpenFile] = useState(null);

  useEffect(() => {
    loadOutcomes();
    const interval = setInterval(loadOutcomes, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadOutcomes() {
    try {
      const data = await api.getTodayDiscussions();
      setOutcomes(data.outcomes || []);
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // File opened — full discussion view
  if (openFile !== null && outcomes[openFile]) {
    const o = outcomes[openFile];
    return (
      <div className="fade-in">
        <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-purple-400 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to files
        </button>

        <div className="glass-strong rounded-2xl p-8 slide-up">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-3 mb-2">
              <span className="tag tag-purple">DISCUSSION</span>
              <span className="text-xs text-gray-500 font-mono">
                {new Date(o.createdAt || o.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white">{o.task || 'Untitled Discussion'}</h2>
          </div>

          <div className="section-line mb-6" style={{ background: 'linear-gradient(90deg, #a855f7, transparent)' }} />

          {/* Deadline */}
          {o.deadline && o.deadline !== 'Not specified' && (
            <section className="mb-6 p-4 rounded-xl bg-yellow-500/5 border border-yellow-500/15">
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#eab308" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                </svg>
                <span className="text-sm font-medium text-yellow-400">Deadline: {o.deadline}</span>
              </div>
            </section>
          )}

          {/* Participants */}
          {o.participants?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Participants</h3>
              <div className="flex flex-wrap gap-2">
                {o.participants.map((p, i) => (
                  <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/10">
                    <div className="w-6 h-6 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400 text-xs font-bold">
                      {p.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm text-gray-300">{p}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Decisions */}
          {o.decisions?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">Decisions Made</h3>
              <div className="space-y-2">
                {o.decisions.map((d, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2" className="mt-0.5 flex-shrink-0">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <p className="text-sm text-gray-300">{d}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Action Items */}
          {o.actionItems?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3">Action Items</h3>
              <div className="space-y-2">
                {o.actionItems.map((a, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-lg bg-pink-500/5 border border-pink-500/10">
                    <span className="w-5 h-5 rounded border-2 border-pink-500/40 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-300">{a}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Source transcript */}
          {o.sourceTranscript && (
            <section className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Source Transcript</h3>
              <p className="text-xs text-gray-600 leading-relaxed italic">"{o.sourceTranscript}"</p>
            </section>
          )}
        </div>
      </div>
    );
  }

  // File list
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Discussion Outcomes</h2>
          <p className="text-sm text-gray-500">{outcomes.length} file{outcomes.length !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {outcomes.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <p className="text-lg font-medium">No discussion outcomes yet</p>
          <p className="text-sm mt-1">Detected discussions will appear as files here</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {outcomes.map((o, i) => (
            <button
              key={o._id || i}
              onClick={() => setOpenFile(i)}
              className="file-card p-5 text-left group"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-purple-400">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-purple-400 transition-colors">
                    {o.task || 'Untitled Discussion'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {new Date(o.createdAt || o.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {o.deadline && o.deadline !== 'Not specified' && (
                <p className="text-xs text-yellow-400/70 mb-2">Deadline: {o.deadline}</p>
              )}

              <div className="flex items-center gap-2 flex-wrap">
                {o.participants?.length > 0 && (
                  <span className="tag tag-purple">{o.participants.length} participants</span>
                )}
                {o.actionItems?.length > 0 && (
                  <span className="tag tag-pink">{o.actionItems.length} actions</span>
                )}
                {o.decisions?.length > 0 && (
                  <span className="tag tag-cyan">{o.decisions.length} decisions</span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
