import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function NotesView({ language }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFile, setOpenFile] = useState(null);
  const [translating, setTranslating] = useState(false);

  useEffect(() => {
    loadNotes();
    const interval = setInterval(loadNotes, 15000);
    return () => clearInterval(interval);
  }, []);

  async function loadNotes() {
    try {
      const data = await api.getTodayNotes();
      setNotes(data.notes || []);
    } catch (err) {
      console.error('Failed to load notes:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleTranslate(note, idx) {
    setTranslating(true);
    try {
      const result = await api.translateNotes(note, language === 'en' ? 'hi' : 'en');
      const updated = [...notes];
      updated[idx] = { ...updated[idx], ...result.notes, _translated: true };
      setNotes(updated);
    } catch (err) {
      console.error('Translation failed:', err);
    } finally {
      setTranslating(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // File opened - show full note content
  if (openFile !== null && notes[openFile]) {
    const note = notes[openFile];
    return (
      <div className="fade-in">
        <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-400 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to files
        </button>

        <div className="glass-strong rounded-2xl p-8 slide-up">
          {/* File header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="tag tag-cyan">NOTE</span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(note.createdAt || note.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">{note.title || 'Untitled Note'}</h2>
            </div>
            <button
              onClick={() => handleTranslate(note, openFile)}
              disabled={translating}
              className="btn-neon text-xs"
            >
              {translating ? 'Translating...' : language === 'en' ? 'Translate to Hindi' : 'Translate to English'}
            </button>
          </div>

          <div className="section-line mb-6" />

          {/* Definition */}
          {note.definition && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Definition</h3>
              <p className="text-gray-300 leading-relaxed bg-cyan-500/5 border border-cyan-500/10 rounded-lg p-4">
                {note.definition}
              </p>
            </section>
          )}

          {/* Key Points */}
          {note.bulletPoints?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-3">Key Points</h3>
              <div className="space-y-2">
                {note.bulletPoints.map((point, j) => (
                  <div key={j} className="flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                    <span className="w-6 h-6 rounded-full bg-cyan-500/10 text-cyan-400 flex items-center justify-center flex-shrink-0 text-xs font-bold mt-0.5">
                      {j + 1}
                    </span>
                    <p className="text-gray-300 text-sm leading-relaxed">{point}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Examples */}
          {note.examples?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3">Examples</h3>
              <div className="grid gap-2">
                {note.examples.map((ex, j) => (
                  <div key={j} className="p-3 rounded-lg bg-purple-500/5 border border-purple-500/10 text-sm text-gray-300">
                    <span className="text-purple-400 mr-2">Ex {j + 1}:</span>{ex}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Applications */}
          {note.applications?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-3">Applications</h3>
              <div className="flex flex-wrap gap-2">
                {note.applications.map((app, j) => (
                  <span key={j} className="tag tag-green">{app}</span>
                ))}
              </div>
            </section>
          )}

          {/* Exam Questions */}
          {note.examQuestions?.length > 0 && (
            <section className="mb-6">
              <h3 className="text-xs font-semibold text-pink-400 uppercase tracking-wider mb-3">Potential Exam Questions</h3>
              <div className="space-y-2">
                {note.examQuestions.map((q, j) => (
                  <div key={j} className="p-3 rounded-lg bg-pink-500/5 border border-pink-500/10 text-sm text-gray-300 flex gap-2">
                    <span className="text-pink-400 font-bold flex-shrink-0">Q{j + 1}.</span>
                    <span>{q}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Revision Summary */}
          {note.revisionSummary && (
            <section className="mt-8 p-4 rounded-xl bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/10">
              <h3 className="text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">Quick Revision Summary</h3>
              <p className="text-gray-200 leading-relaxed">{note.revisionSummary}</p>
            </section>
          )}
        </div>
      </div>
    );
  }

  // File list view
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Lecture Notes</h2>
          <p className="text-sm text-gray-500">{notes.length} file{notes.length !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <p className="text-lg font-medium">No lecture notes yet</p>
          <p className="text-sm mt-1">Start recording to auto-generate structured notes</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {notes.map((note, i) => (
            <button
              key={note._id || i}
              onClick={() => setOpenFile(i)}
              className="file-card p-5 text-left group"
            >
              {/* File icon */}
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-cyan-400">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-cyan-400 transition-colors">
                    {note.title || 'Untitled Note'}
                  </h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">
                    {new Date(note.createdAt || note.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>

              {/* Preview */}
              <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                {note.definition || note.revisionSummary || 'No preview available'}
              </p>

              {/* Tags */}
              <div className="flex items-center gap-2 flex-wrap">
                {note.bulletPoints?.length > 0 && (
                  <span className="tag tag-cyan">{note.bulletPoints.length} points</span>
                )}
                {note.examQuestions?.length > 0 && (
                  <span className="tag tag-pink">{note.examQuestions.length} questions</span>
                )}
                {note._translated && <span className="tag tag-purple">Translated</span>}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
