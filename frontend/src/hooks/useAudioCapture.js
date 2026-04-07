import { useState, useRef, useCallback } from 'react';
import { AudioCaptureEngine } from '../engines/audioCaptureEngine';
import { api } from '../api/client';

export function useAudioCapture(onProcessingResult) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chunkCount, setChunkCount] = useState(0);
  const engineRef = useRef(null);

  const handleChunkReady = useCallback(async (blob) => {
    setIsProcessing(true);
    setChunkCount((c) => c + 1);
    try {
      const result = await api.uploadAudio(blob);
      if (onProcessingResult) {
        onProcessingResult(result);
      }
    } catch (error) {
      console.error('[useAudioCapture] Upload failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onProcessingResult]);

  const startRecording = useCallback(async () => {
    const engine = new AudioCaptureEngine(handleChunkReady);
    const started = await engine.start();
    if (started) {
      engineRef.current = engine;
      setIsRecording(true);
      setChunkCount(0);
    }
  }, [handleChunkReady]);

  const stopRecording = useCallback(async () => {
    if (engineRef.current) {
      engineRef.current.stop();
      engineRef.current = null;
    }
    setIsRecording(false);

    // Finalize any active lecture session so accumulated transcripts
    // get processed into comprehensive notes
    try {
      setIsProcessing(true);
      const result = await api.finalizeLecture();
      if (result.lectureFinalized && onProcessingResult) {
        onProcessingResult(result);
      }
    } catch (error) {
      console.error('[useAudioCapture] Finalize failed:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [onProcessingResult]);

  return { isRecording, isProcessing, chunkCount, startRecording, stopRecording };
}
