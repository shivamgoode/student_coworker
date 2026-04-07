import { useAudioCapture } from '../hooks/useAudioCapture';

export default function AudioControl({ onResult }) {
  const { isRecording, isProcessing, chunkCount, startRecording, stopRecording } =
    useAudioCapture(onResult);

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        className={`relative flex items-center gap-2.5 ${isRecording ? 'btn-neon-record' : 'btn-neon'}`}
        style={{ padding: '10px 20px', borderRadius: '12px' }}
      >
        {/* Pulse dot */}
        {isRecording && (
          <span className="relative flex h-2.5 w-2.5">
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
            <span className="relative rounded-full h-2.5 w-2.5 bg-red-400" />
          </span>
        )}
        {!isRecording && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" y1="19" x2="12" y2="23" />
            <line x1="8" y1="23" x2="16" y2="23" />
          </svg>
        )}
        <span className="text-sm">{isRecording ? 'Stop Listening' : 'Start Listening'}</span>
      </button>

      {/* Status indicators */}
      <div className="flex items-center gap-3 text-xs text-gray-500">
        {isProcessing && (
          <span className="flex items-center gap-1.5 text-yellow-400/80">
            <div className="w-3 h-3 border border-yellow-400/40 border-t-yellow-400 rounded-full animate-spin" />
            Processing...
          </span>
        )}
        {chunkCount > 0 && (
          <span className="font-mono text-gray-600">
            {chunkCount} chunk{chunkCount !== 1 ? 's' : ''} sent
          </span>
        )}
      </div>
    </div>
  );
}
