/**
 * Lecture End Detection Engine
 * The "second LLM" that checks whether a lecture is still ongoing or has stopped.
 * Called for each new chunk when an active lecture session exists.
 *
 * Uses the latest chunk's transcript + its classification to determine
 * if the lecturer has stopped teaching or is still going.
 */
const groq = require('../config/groq');

/**
 * Detect whether the lecture is still ongoing based on the latest chunk.
 * @param {string} latestTranscript - the most recent chunk's transcript
 * @param {string} classification - the importance classification of the latest chunk
 * @param {string} accumulatedTranscriptSnippet - last ~500 chars of accumulated lecture transcript (for context)
 * @returns {{ isLectureOngoing: boolean, confidence: number, reasoning: string }}
 */
async function detectLectureEnd(latestTranscript, classification, accumulatedTranscriptSnippet) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a lecture continuity detector. You are monitoring a live lecture/class.
The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the meaning regardless of language.

Given:
1. The PREVIOUS lecture context (what was being taught)
2. The LATEST audio transcript chunk
3. The classification of the latest chunk

Determine if the lecture is STILL ONGOING or has STOPPED.

The lecture is STILL ONGOING if:
- The speaker continues teaching, explaining, or elaborating on topics
- There is a brief pause, cough, or filler words but teaching resumes
- The topic shifts but it's still educational content from the same session
- The speaker is answering student questions about the lecture topic
- The classification is "lecture" or "concept"

The lecture has STOPPED if:
- The speaker says class is over, dismissed, or ends the session (including Hindi: "class khatam", "aaj itna hi", "chal theek hai")
- The conversation shifts entirely to casual/social talk unrelated to academics
- There is only silence, noise, or unintelligible audio
- The speaker starts discussing administrative non-lecture topics for an extended time
- The classification is "casual" or "ignore" and the content clearly isn't educational

Return JSON: {"isLectureOngoing": true/false, "confidence": <0-10>, "reasoning": "<brief reason>"}
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `PREVIOUS LECTURE CONTEXT (last part):\n"${accumulatedTranscriptSnippet}"\n\nLATEST CHUNK (classified as "${classification}"):\n"${latestTranscript}"`,
        },
      ],
      temperature: 0.1,
      max_tokens: 256,
    });

    const content = response.choices[0].message.content.trim();
    const result = JSON.parse(content);
    console.log(`[LectureEndDetection] ongoing=${result.isLectureOngoing}, confidence=${result.confidence}, reason=${result.reasoning}`);
    return result;
  } catch (error) {
    console.error('[LectureEndDetection] Detection failed:', error.message);
    // Default to ongoing to avoid premature finalization
    return { isLectureOngoing: true, confidence: 3, reasoning: 'Detection failed, assuming ongoing' };
  }
}

module.exports = { detectLectureEnd };
