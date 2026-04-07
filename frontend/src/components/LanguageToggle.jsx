export default function LanguageToggle({ language, setLanguage }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-lg border border-white/[0.06] bg-white/[0.02]">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'en'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
            : 'text-gray-500 hover:text-gray-300 border border-transparent'
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLanguage('hi')}
        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          language === 'hi'
            ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
            : 'text-gray-500 hover:text-gray-300 border border-transparent'
        }`}
      >
        HI
      </button>
    </div>
  );
}
