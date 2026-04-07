import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function NotesPanel({ language }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);

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
    try {
      const result = await api.translateNotes(note, language === 'en' ? 'hi' : 'en');
      const updated = [...notes];
      updated[idx] = { ...updated[idx], ...result.notes, _translated: true };
      setNotes(updated);
    } catch (err) {
      console.error('Translation failed:', err);
    }
  }

  if (loading) return <div className="p-4 text-gray-500">Loading notes...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">Today's Notes</h2>
      {notes.length === 0 ? (
        <p className="text-gray-500 text-sm">No notes yet. Start recording to generate notes.</p>
      ) : (
        notes.map((note, i) => (
          <div key={note._id || i} className="bg-gray-900 rounded-lg border border-gray-800 p-4">
            <div className="flex justify-between items-start mb-2">
              <h3
                className="font-semibold text-white cursor-pointer hover:text-mindpen-500"
                onClick={() => setExpanded(expanded === i ? null : i)}
              >
                {note.title || 'Untitled'}
              </h3>
              <button
                onClick={() => handleTranslate(note, i)}
                className="text-xs text-mindpen-500 hover:underline"
              >
                Translate
              </button>
            </div>

            {note.definition && (
              <p className="text-sm text-gray-300 mb-2">{note.definition}</p>
            )}

            {expanded === i && (
              <div className="space-y-2 mt-3 text-sm">
                {note.bulletPoints?.length > 0 && (
                  <div>
                    <p className="text-gray-400 font-medium">Key Points:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {note.bulletPoints.map((bp, j) => <li key={j}>{bp}</li>)}
                    </ul>
                  </div>
                )}
                {note.examples?.length > 0 && (
                  <div>
                    <p className="text-gray-400 font-medium">Examples:</p>
                    <ul className="list-disc list-inside text-gray-300">
                      {note.examples.map((ex, j) => <li key={j}>{ex}</li>)}
                    </ul>
                  </div>
                )}
                {note.examQuestions?.length > 0 && (
                  <div>
                    <p className="text-gray-400 font-medium">Exam Questions:</p>
                    <ul className="list-decimal list-inside text-gray-300">
                      {note.examQuestions.map((q, j) => <li key={j}>{q}</li>)}
                    </ul>
                  </div>
                )}
                {note.revisionSummary && (
                  <div className="bg-gray-800 rounded p-2 mt-2">
                    <p className="text-gray-400 font-medium text-xs">Revision Summary:</p>
                    <p className="text-gray-200">{note.revisionSummary}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
