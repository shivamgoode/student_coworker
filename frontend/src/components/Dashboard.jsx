import { useState, useEffect, useMemo } from 'react';
import { api } from '../api/client';

/* ============================================================
   JARVIS AI Core — animated orb with orbital rings (compact)
   ============================================================ */

function JarvisCore({ isActive, statusText }) {
  return (
    <div className="relative flex flex-col items-center">
      <div className="jarvis-glow" />
      <div className="jarvis-core">
        <div className="jarvis-ring jarvis-ring-1" />
        <div className="jarvis-ring jarvis-ring-2" />
        <div className="jarvis-ring jarvis-ring-3" />
        <div className="jarvis-ring jarvis-ring-4" />
        <div className="jarvis-scan" />
        <div className="jarvis-core-inner">
          <div className="jarvis-pulse" />
        </div>
      </div>

      <div className="mt-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="relative flex h-2 w-2">
            <span className={`absolute inset-0 rounded-full ${isActive ? 'bg-emerald-400 animate-ping' : 'bg-gray-600'} opacity-50`} />
            <span className={`relative rounded-full h-2 w-2 ${isActive ? 'bg-emerald-400' : 'bg-gray-600'}`} />
          </span>
          <span className={`text-[10px] font-mono uppercase tracking-widest ${isActive ? 'text-emerald-400' : 'text-gray-600'}`}>
            {isActive ? 'Active' : 'Standby'}
          </span>
        </div>
        <p className="text-[10px] text-gray-500 font-mono status-ticker max-w-[200px]">
          {statusText}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   Live Timeline Feed
   ============================================================ */

const EVENT_STYLES = {
  lecture:       { color: 'text-cyan-400',    bg: 'bg-cyan-400', label: 'LEC' },
  discussion:    { color: 'text-purple-400',  bg: 'bg-purple-400', label: 'DSC' },
  reminder:      { color: 'text-pink-400',    bg: 'bg-pink-400', label: 'REM' },
  visualization: { color: 'text-emerald-400', bg: 'bg-emerald-400', label: 'VIZ' },
  note:          { color: 'text-blue-400',    bg: 'bg-blue-400', label: 'NTE' },
  flowchart:     { color: 'text-cyan-400',    bg: 'bg-cyan-400', label: 'FLW' },
};

function LiveTimelineFeed({ events }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-4 text-center">
        <div className="w-8 h-8 rounded-full bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-2">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-600">
            <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
          </svg>
        </div>
        <p className="text-[10px] text-gray-600 font-mono">NO EVENTS DETECTED</p>
        <p className="text-[9px] text-gray-700 mt-0.5">Start recording to populate</p>
      </div>
    );
  }

  return (
    <div className="timeline-feed">
      <div className="space-y-0.5">
        {events.slice(0, 6).map((event, i) => {
          const style = EVENT_STYLES[event.type] || EVENT_STYLES.note;
          return (
            <div
              key={event._id || i}
              className="timeline-feed-item flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/[0.02] transition-colors group"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <span className="text-[9px] text-gray-600 font-mono w-10 flex-shrink-0">{event.time}</span>
              <span className={`w-1.5 h-1.5 rounded-full ${style.bg} flex-shrink-0 opacity-70 group-hover:opacity-100`} />
              <span className={`text-[8px] font-mono font-bold ${style.color} opacity-60 w-6 flex-shrink-0`}>{style.label}</span>
              <span className="text-[11px] text-gray-400 truncate group-hover:text-gray-200 transition-colors">{event.description}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================
   Section Cards
   ============================================================ */

const SECTIONS = [
  {
    id: 'notes',
    title: 'Lecture Notes',
    subtitle: 'Structured notes from lectures',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
    glow: 'glow-cyan',
    color: 'text-cyan-400',
    bgAccent: 'from-cyan-500/10 to-cyan-900/5',
    fetchCount: async () => {
      try { const d = await api.getTodayNotes(); return d.notes?.length || 0; } catch { return 0; }
    },
  },
  {
    id: 'discussions',
    title: 'Discussions',
    subtitle: 'Decisions & action items',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        <line x1="9" y1="10" x2="15" y2="10" />
        <line x1="12" y1="7" x2="12" y2="13" />
      </svg>
    ),
    glow: 'glow-purple',
    color: 'text-purple-400',
    bgAccent: 'from-purple-500/10 to-purple-900/5',
    fetchCount: async () => {
      try { const d = await api.getTodayDiscussions(); return d.outcomes?.length || 0; } catch { return 0; }
    },
  },
  {
    id: 'reminders',
    title: 'Reminders',
    subtitle: 'Auto-detected tasks & deadlines',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
    ),
    glow: 'glow-pink',
    color: 'text-pink-400',
    bgAccent: 'from-pink-500/10 to-pink-900/5',
    fetchCount: async () => {
      try { const d = await api.getTodayReminders(); return d.reminders?.length || 0; } catch { return 0; }
    },
  },
  {
    id: 'visualizations',
    title: 'Visualizations',
    subtitle: '3D models & flowcharts',
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
        <line x1="12" y1="22" x2="12" y2="15.5" />
        <polyline points="22 8.5 12 15.5 2 8.5" />
      </svg>
    ),
    glow: 'glow-green',
    color: 'text-emerald-400',
    bgAccent: 'from-emerald-500/10 to-emerald-900/5',
    fetchCount: async () => {
      try { const d = await api.getTodayVisualizations(); return d.visualizations?.length || 0; } catch { return 0; }
    },
  },
];

/* ============================================================
   Animated Counter
   ============================================================ */

function AnimatedCount({ value }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (value === undefined || value === null) return;
    const target = Number(value);
    if (target === 0) { setDisplay(0); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(target / 12));
    const interval = setInterval(() => {
      current += step;
      if (current >= target) { current = target; clearInterval(interval); }
      setDisplay(current);
    }, 50);
    return () => clearInterval(interval);
  }, [value]);

  return <span className="count-glow">{display}</span>;
}

/* ============================================================
   Status Messages
   ============================================================ */

const STATUS_MESSAGES = [
  'Monitoring audio channels...',
  'Neural engines on standby...',
  'Awaiting lecture input...',
  'Classification pipeline ready...',
  'Real-time transcription idle...',
  'Knowledge graph synced...',
];

function useStatusCycle(events, latestResult) {
  const [idx, setIdx] = useState(0);

  const messages = useMemo(() => {
    const msgs = [...STATUS_MESSAGES];
    if (events.length > 0) {
      const last = events[0];
      msgs.unshift(`Last: ${last.description?.slice(0, 36)}...`);
    }
    if (latestResult?.success) {
      msgs.unshift('Audio chunk processed successfully');
    }
    return msgs;
  }, [events, latestResult]);

  useEffect(() => {
    const timer = setInterval(() => setIdx((i) => (i + 1) % messages.length), 3500);
    return () => clearInterval(timer);
  }, [messages.length]);

  return messages[idx];
}

/* ============================================================
   Main Dashboard — single-viewport, no scroll
   ============================================================ */

export default function Dashboard({ onNavigate, latestResult }) {
  const [counts, setCounts] = useState({});
  const [time, setTime] = useState(new Date());
  const [events, setEvents] = useState([]);

  useEffect(() => {
    loadTimeline();
    const interval = setInterval(loadTimeline, 10000);
    return () => clearInterval(interval);
  }, []);

  async function loadTimeline() {
    try {
      const data = await api.getTodayTimeline();
      setEvents(data.events || []);
    } catch { /* silent */ }
  }

  useEffect(() => {
    SECTIONS.forEach(async (s) => {
      const count = await s.fetchCount();
      setCounts((prev) => ({ ...prev, [s.id]: count }));
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const statusText = useStatusCycle(events, latestResult);
  const greeting = (() => {
    const h = time.getHours();
    if (h < 12) return 'Good Morning';
    if (h < 17) return 'Good Afternoon';
    return 'Good Evening';
  })();

  const totalFiles = Object.values(counts).reduce((a, b) => a + (b || 0), 0);
  const activeSections = Object.values(counts).filter(c => c > 0).length;

  return (
    <div className="fade-in flex flex-col gap-4" style={{ height: 'calc(100vh - 120px)' }}>

      {/* ===== MAIN CONTENT (fills remaining space, no scroll) ===== */}
      <div className="flex-1 min-h-0 min-w-0 flex flex-col gap-4 overflow-hidden">

        {/* ===== TOP ROW: Greeting + JARVIS + Timeline ===== */}
        <div className="flex items-stretch gap-5 flex-shrink-0" style={{ height: '52%' }}>

          {/* Left — Greeting + Live Feed */}
          <div className="flex-1 min-w-0 flex flex-col">
            {/* Greeting (compact) */}
            <div className="mb-3 flex-shrink-0">
              <p className="text-[10px] font-mono text-gray-600 uppercase tracking-[0.2em] mb-1">
                {time.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
              <h1 className="text-3xl font-bold leading-tight">
                <span className="gradient-text">{greeting}</span>
              </h1>
              <div className="flex items-center gap-3 mt-1.5">
                <span className="font-mono text-sm text-gray-400 tabular-nums tracking-wider">
                  {time.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
                <span className="w-px h-3 bg-gray-800" />
                <span className="text-[10px] text-gray-600 font-mono">{totalFiles} files today</span>
              </div>
            </div>

            {/* Live Timeline Feed */}
            <div className="flex-1 min-h-0 hex-border rounded-xl bg-white/[0.01] p-1">
              <div className="rounded-lg bg-gradient-to-b from-white/[0.02] to-transparent p-3 h-full flex flex-col">
                <div className="flex items-center gap-2 mb-2 flex-shrink-0">
                  <div className="relative flex h-1.5 w-1.5">
                    <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-30" />
                    <span className="relative rounded-full h-1.5 w-1.5 bg-cyan-400" />
                  </div>
                  <span className="text-[9px] font-mono text-cyan-400/70 uppercase tracking-widest">Live Activity Feed</span>
                  <span className="text-[9px] font-mono text-gray-700 ml-auto">{events.length} event{events.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <LiveTimelineFeed events={events} />
                </div>
              </div>
            </div>
          </div>

          {/* Right — JARVIS AI Core */}
          <div className="flex-shrink-0 flex items-center justify-center" style={{ width: '260px' }}>
            <JarvisCore
              isActive={events.length > 0 || !!latestResult}
              statusText={statusText}
            />
          </div>
        </div>

        {/* ===== BOTTOM ROW: 4 Section Cards ===== */}
        <div className="flex-shrink-0 min-h-0 grid grid-cols-2 md:grid-cols-4 gap-4" style={{ height: '48%' }}>
          {SECTIONS.map((section, i) => (
            <button
              key={section.id}
              onClick={() => onNavigate(section.id)}
              className={`neon-card ${section.glow} p-3 text-left group stagger-enter flex flex-col`}
              style={{ animationDelay: `${i * 100 + 200}ms` }}
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${section.bgAccent} opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl`} />

              <div className="relative z-10 flex flex-col h-full">
                {/* Icon + Count */}
                <div className="flex items-start justify-between mb-2">
                  <div className={`${section.color} opacity-70 group-hover:opacity-100 transition-all duration-300 group-hover:scale-110`}>
                    {section.icon}
                  </div>
                  <span className={`text-2xl font-bold font-mono ${section.color} opacity-80`}>
                    {counts[section.id] !== undefined
                      ? <AnimatedCount value={counts[section.id]} />
                      : <span className="text-gray-700">--</span>
                    }
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-white/90 mb-0.5 group-hover:text-white transition-colors">
                  {section.title}
                </h3>
                <p className="text-[11px] text-gray-500 group-hover:text-gray-400 transition-colors">
                  {section.subtitle}
                </p>
              </div>

              {/* Centered hover action */}
              <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
                <div className={`flex items-center gap-1.5 text-[10px] ${section.color} opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-5 translate-y-2 group-hover:translate-y-0 px-2.5 py-1 rounded-full bg-black/35 border border-white/10 backdrop-blur-[1px]`}>
                  <span className="font-mono uppercase tracking-wider">Open</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* ===== BOTTOM — Horizontal System Status Strip ===== */}
      <div className="flex-shrink-0 hex-border rounded-xl bg-white/[0.01] px-4 py-3">
        <div className="flex items-center justify-between gap-3 flex-wrap md:flex-nowrap">
          <div className="flex items-center gap-2" title="Total files today">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-cyan-400/50">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="text-xs font-mono font-bold text-gray-300 count-glow">{totalFiles}</span>
            <span className="text-[10px] font-mono text-gray-600 uppercase">Files</span>
          </div>

          <div className="hidden md:block w-px h-4 bg-gray-800" />

          <div className="flex items-center gap-2" title="Active modules">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-400/50">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <line x1="3" y1="9" x2="21" y2="9" />
            </svg>
            <span className="text-xs font-mono font-bold text-gray-300 count-glow">{activeSections}</span>
            <span className="text-[10px] font-mono text-gray-600 uppercase">Active</span>
          </div>

          <div className="hidden md:block w-px h-4 bg-gray-800" />

          <div className="flex items-center gap-2" title="Timeline events">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-400/50">
              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
            </svg>
            <span className="text-xs font-mono font-bold text-gray-300 count-glow">{events.length}</span>
            <span className="text-[10px] font-mono text-gray-600 uppercase">Events</span>
          </div>

          <div className="hidden md:block w-px h-4 bg-gray-800" />

          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
              <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
            </span>
            <span className="text-[10px] font-mono text-emerald-400/70 uppercase tracking-widest">
              NOMINAL
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
