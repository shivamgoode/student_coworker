import { useState, useEffect } from 'react';
import { api } from '../api/client';

export default function DiscussionPanel() {
  const [outcomes, setOutcomes] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <div className="p-4 text-gray-500">Loading discussions...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">Discussion Outcomes</h2>
      {outcomes.length === 0 ? (
        <p className="text-gray-500 text-sm">No discussion outcomes yet.</p>
      ) : (
        outcomes.map((o) => (
          <div key={o._id} className="bg-gray-900 rounded-lg border border-gray-800 p-4 space-y-2">
            <h3 className="font-semibold text-white">{o.task}</h3>
            {o.deadline && (
              <p className="text-sm text-yellow-400">Deadline: {o.deadline}</p>
            )}
            {o.participants?.length > 0 && (
              <div className="flex gap-2 flex-wrap">
                {o.participants.map((p, i) => (
                  <span key={i} className="text-xs bg-mindpen-600/20 text-mindpen-500 px-2 py-0.5 rounded">
                    {p}
                  </span>
                ))}
              </div>
            )}
            {o.decisions?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium">Decisions:</p>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {o.decisions.map((d, i) => <li key={i}>{d}</li>)}
                </ul>
              </div>
            )}
            {o.actionItems?.length > 0 && (
              <div>
                <p className="text-xs text-gray-400 font-medium">Action Items:</p>
                <ul className="list-disc list-inside text-sm text-gray-300">
                  {o.actionItems.map((a, i) => <li key={i}>{a}</li>)}
                </ul>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
