/**
 * Speaker Segmentation Engine
 * Separates transcript into speaker segments.
 *
 * MVP approach: Uses Groq LLM to logically segment transcript text
 * into different speakers based on conversational cues.
 *
 * Production: Integrate pyannote.audio for real diarization.
 */
const groq = require('../config/groq');

/**
 * Segment transcript into speaker turns using LLM analysis.
 * @param {string} transcript - full transcript text
 * @returns {Array<{speaker: string, text: string, startTime?: string}>}
 */
async function segmentSpeakers(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a speaker diarization assistant. The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Analyze it and separate into speaker turns regardless of language.
Return a JSON array where each element has: {"speaker": "Speaker1", "text": "what they said"}.
If you cannot distinguish speakers, assign everything to "Speaker1".
Return ONLY valid JSON array, no markdown.`,
        },
        {
          role: 'user',
          content: `Segment this transcript into speakers:\n\n${transcript}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content.trim();
    const segments = JSON.parse(content);
    return Array.isArray(segments) ? segments : [{ speaker: 'Speaker1', text: transcript }];
  } catch (error) {
    console.error('[SpeakerSegmentation] Segmentation failed:', error.message);
    // Fallback: return entire transcript as single speaker
    return [{ speaker: 'Speaker1', text: transcript }];
  }
}

module.exports = { segmentSpeakers };
