import { useState, useEffect } from 'react';
import { api } from '../api/client';

const TYPE_COLORS = {
  lecture: 'bg-blue-500',
  discussion: 'bg-purple-500',
  reminder: 'bg-yellow-500',
  visualization: 'bg-green-500',
  note: 'bg-gray-500',
  flowchart: 'bg-cyan-500',
};

export default function TimelinePanel() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTimeline();
    const interval = setInterval(loadTimeline, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadTimeline() {
    try {
      const data = await api.getTodayTimeline();
      setEvents(data.events || []);
    } catch (err) {
      console.error('Failed to load timeline:', err);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div className="p-4 text-gray-500">Loading timeline...</div>;

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-bold text-mindpen-500">Today's Timeline</h2>
      {events.length === 0 ? (
        <p className="text-gray-500 text-sm">No events yet today.</p>
      ) : (
        <div className="space-y-1">
          {events.map((event, i) => (
            <div key={event._id || i} className="flex items-center gap-3 py-2">
              <span className="text-xs text-gray-500 w-16 flex-shrink-0 font-mono">
                {event.time}
              </span>
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${TYPE_COLORS[event.type] || 'bg-gray-500'}`} />
              <span className="text-sm text-gray-300">{event.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
