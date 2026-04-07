import { useState, useEffect } from 'react';
import { api } from '../api/client';

const TYPE_CONFIG = {
  lecture:       { color: 'cyan',    icon: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zM14 2v6h6', label: 'Lecture' },
  discussion:    { color: 'purple',  icon: 'M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z', label: 'Discussion' },
  reminder:      { color: 'pink',    icon: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 0 1-3.46 0', label: 'Reminder' },
  visualization: { color: 'green',   icon: 'M12 2L22 8.5V15.5L12 22L2 15.5V8.5L12 2', label: 'Visualization' },
  note:          { color: 'blue',    icon: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7', label: 'Note' },
  flowchart:     { color: 'cyan',    icon: 'M4 6h16M4 12h16M4 18h16', label: 'Flowchart' },
};

const COLOR_MAP = {
  cyan:   { dot: 'bg-cyan-400', line: 'border-cyan-500/20', tag: 'tag-cyan', glow: 'shadow-cyan-500/10' },
  purple: { dot: 'bg-purple-400', line: 'border-purple-500/20', tag: 'tag-purple', glow: 'shadow-purple-500/10' },
  pink:   { dot: 'bg-pink-400', line: 'border-pink-500/20', tag: 'tag-pink', glow: 'shadow-pink-500/10' },
  green:  { dot: 'bg-emerald-400', line: 'border-emerald-500/20', tag: 'tag-green', glow: 'shadow-emerald-500/10' },
  blue:   { dot: 'bg-blue-400', line: 'border-blue-500/20', tag: 'tag-blue', glow: 'shadow-blue-500/10' },
};

export default function TimelineView() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openFile, setOpenFile] = useState(null);

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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // File opened
  if (openFile !== null && events[openFile]) {
    const e = events[openFile];
    const cfg = TYPE_CONFIG[e.type] || TYPE_CONFIG.note;
    const cm = COLOR_MAP[cfg.color] || COLOR_MAP.blue;

    return (
      <div className="fade-in">
        <button onClick={() => setOpenFile(null)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-blue-400 transition-colors mb-6">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
          Back to timeline
        </button>

        <div className="glass-strong rounded-2xl p-8 slide-up">
          <div className="flex items-center gap-3 mb-2">
            <span className={`tag ${cm.tag}`}>{cfg.label.toUpperCase()}</span>
            <span className="text-xs text-gray-500 font-mono">{e.time}</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">{e.description}</h2>

          <div className="section-line mb-6" style={{ background: 'linear-gradient(90deg, #3b82f6, transparent)' }} />

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Event Type</p>
              <p className="text-sm text-gray-300 capitalize">{e.type}</p>
            </div>
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.04]">
              <p className="text-xs text-gray-500 mb-1">Recorded At</p>
              <p className="text-sm text-gray-300 font-mono">{e.time}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Timeline view
  return (
    <div className="fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Timeline Events</h2>
          <p className="text-sm text-gray-500">{events.length} event{events.length !== 1 ? 's' : ''} today</p>
        </div>
      </div>

      {events.length === 0 ? (
        <div className="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
          <p className="text-lg font-medium">No events yet today</p>
          <p className="text-sm mt-1">Your academic activity timeline will build up here</p>
        </div>
      ) : (
        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-[23px] top-2 bottom-2 w-px bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent" />

          <div className="space-y-1">
            {events.map((event, i) => {
              const cfg = TYPE_CONFIG[event.type] || TYPE_CONFIG.note;
              const cm = COLOR_MAP[cfg.color] || COLOR_MAP.blue;

              return (
                <button
                  key={event._id || i}
                  onClick={() => setOpenFile(i)}
                  className="w-full text-left flex items-start gap-4 p-3 rounded-xl hover:bg-white/[0.02] transition-colors group"
                >
                  {/* Dot */}
                  <div className="relative z-10 flex-shrink-0 mt-1">
                    <div className={`w-3 h-3 rounded-full ${cm.dot} ring-4 ring-gray-950`} />
                  </div>

                  {/* Time */}
                  <span className="text-xs text-gray-500 font-mono w-14 flex-shrink-0 mt-0.5">
                    {event.time}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`tag ${cm.tag}`}>{cfg.label}</span>
                    </div>
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors truncate">
                      {event.description}
                    </p>
                  </div>

                  {/* Arrow */}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700 group-hover:text-gray-400 transition-colors mt-1 flex-shrink-0">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
