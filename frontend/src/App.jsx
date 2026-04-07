import { useState, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import NotesView from './components/NotesView';
import DiscussionsView from './components/DiscussionsView';
import RemindersView from './components/RemindersView';
import VisualizationsView from './components/VisualizationsView';
import AudioControl from './components/AudioControl';
import LanguageToggle from './components/LanguageToggle';

const SECTION_META = {
  notes:          { label: 'Lecture Notes',        color: 'text-cyan-400' },
  discussions:    { label: 'Discussion Outcomes',  color: 'text-purple-400' },
  reminders:      { label: 'Reminders',            color: 'text-pink-400' },
  visualizations: { label: 'Visualizations',       color: 'text-emerald-400' },
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [language, setLanguage] = useState('en');
  const [latestResult, setLatestResult] = useState(null);

  const handleResult = useCallback((result) => {
    setLatestResult(result);
  }, []);

  const navigate = useCallback((section) => {
    setView(section);
  }, []);

  function renderView() {
    switch (view) {
      case 'notes':          return <NotesView language={language} />;
      case 'discussions':    return <DiscussionsView />;
      case 'reminders':      return <RemindersView />;
      case 'visualizations': return <VisualizationsView />;
      default:               return <Dashboard onNavigate={navigate} latestResult={latestResult} />;
    }
  }

  const isSection = view !== 'dashboard';
  const meta = SECTION_META[view];

  return (
    <div className="min-h-screen relative scanlines">
      {/* Animated grid background */}
      <div className="grid-bg" />

      {/* Content */}
      <div className="relative z-10">
        {/* ===== HEADER ===== */}
        <header className="sticky top-0 z-50 glass-strong border-b border-white/[0.04]">
          <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
            {/* Left: Logo + breadcrumb */}
            <div className="flex items-center gap-4">
              {/* Logo */}
              <button
                onClick={() => setView('dashboard')}
                className="flex items-center gap-2.5 group"
              >
                <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/20 flex items-center justify-center group-hover:border-cyan-500/40 transition-colors overflow-hidden">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="2" strokeLinecap="round" className="relative z-10">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" />
                    <path d="M2 17l10 5 10-5" />
                    <path d="M2 12l10 5 10-5" />
                  </svg>
                  {/* Tiny glow */}
                  <div className="absolute inset-0 bg-cyan-500/10 animate-glow-pulse rounded-lg" />
                </div>
                <span className="text-base font-bold text-white/90 group-hover:text-white transition-colors">
                  Auto<span className="gradient-text ml-0.5">Sense</span>
                </span>
              </button>

              {/* Breadcrumb */}
              {isSection && meta && (
                <div className="flex items-center gap-2 text-sm fade-in">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-700">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                  <span className={`font-medium ${meta.color}`}>{meta.label}</span>
                </div>
              )}
            </div>

            {/* Right: Controls */}
            <div className="flex items-center gap-3">
              {/* System status indicator */}
              <div className="hidden md:flex items-center gap-2 mr-2 px-3 py-1.5 rounded-lg bg-white/[0.02] border border-white/[0.04]">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                  <span className="relative rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                <span className="text-[11px] text-gray-500 font-mono">SYSTEMS ONLINE</span>
              </div>

              <AudioControl onResult={handleResult} />
              <div className="w-px h-6 bg-white/[0.06]" />
              <LanguageToggle language={language} setLanguage={setLanguage} />
            </div>
          </div>

          {/* Processing bar */}
          {latestResult && (
            <div className="px-6 py-1.5 bg-white/[0.01] border-t border-white/[0.03]">
              <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs text-gray-600">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>Last: {latestResult.success ? 'processed' : 'failed'}</span>
                {latestResult.results?.stages?.processing?.map((p, i) => (
                  <span key={i} className="tag tag-cyan ml-1">{p.classification}</span>
                ))}
              </div>
            </div>
          )}
        </header>

        {/* ===== MAIN CONTENT ===== */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Back button for section views */}
          {isSection && (
            <button
              onClick={() => setView('dashboard')}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-cyan-400 transition-colors mb-6 group"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Back to Dashboard
            </button>
          )}

          {renderView()}
        </main>
      </div>
    </div>
  );
}
