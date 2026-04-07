/**
 * Speech-to-Text Engine
 * Converts audio chunks to transcript using Groq Whisper large-v3.
 * Accepts a file buffer/path and returns transcribed text.
 */
const fs = require('fs');
const groq = require('../config/groq');

async function transcribeAudio(audioFilePath) {
  try {
    const transcription = await groq.audio.transcriptions.create({
      file: fs.createReadStream(audioFilePath),
      model: 'whisper-large-v3',
      response_format: 'verbose_json',
      // No language param — Whisper auto-detects (supports English, Hindi, Hinglish)
    });

    const detectedLang = transcription.language || 'en';
    console.log(`[SpeechToText] Detected language: ${detectedLang}`);

    return {
      text: transcription.text,
      segments: transcription.segments || [],
      language: detectedLang,
      duration: transcription.duration || 0,
    };
  } catch (error) {
    console.error('[SpeechToText] Transcription failed:', error.message);
    throw error;
  }
}

module.exports = { transcribeAudio };
