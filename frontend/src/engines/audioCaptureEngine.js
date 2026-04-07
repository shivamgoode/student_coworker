/**
 * Audio Capture Engine (Frontend)
 * Captures microphone audio using navigator.mediaDevices.getUserMedia().
 * Records in 30-second chunks and sends each chunk to the backend.
 */

const CHUNK_DURATION_MS = 30000; // 30 seconds

export class AudioCaptureEngine {
  constructor(onChunkReady) {
    this.onChunkReady = onChunkReady;
    this.mediaRecorder = null;
    this.stream = null;
    this.chunks = [];
    this.intervalId = null;
    this.isRecording = false;
  }

  async start() {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000,
        },
      });

      this.mediaRecorder = new MediaRecorder(this.stream, {
        mimeType: this._getSupportedMimeType(),
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.chunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        if (this.chunks.length > 0) {
          const blob = new Blob(this.chunks, { type: this.mediaRecorder.mimeType });
          this.chunks = [];
          if (this.onChunkReady) {
            this.onChunkReady(blob);
          }
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      // Every 30 seconds, stop -> send -> restart
      this.intervalId = setInterval(() => {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
          this.mediaRecorder.stop();
          // Restart after a brief pause to allow onstop to fire
          setTimeout(() => {
            if (this.isRecording && this.mediaRecorder) {
              this.mediaRecorder.start();
            }
          }, 100);
        }
      }, CHUNK_DURATION_MS);

      console.log('[AudioCapture] Recording started');
      return true;
    } catch (error) {
      console.error('[AudioCapture] Failed to start:', error);
      return false;
    }
  }

  stop() {
    this.isRecording = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.stop();
    }

    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }

    console.log('[AudioCapture] Recording stopped');
  }

  _getSupportedMimeType() {
    const types = ['audio/webm;codecs=opus', 'audio/webm', 'audio/ogg;codecs=opus', 'audio/mp4'];
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) return type;
    }
    return 'audio/webm';
  }
}
