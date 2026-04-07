/**
 * Simplified Explanation Engine
 * Generates student-friendly explanations at three levels:
 *   - beginner: simple analogies and plain language
 *   - intermediate: technical but accessible
 *   - exam-ready: concise, definition-focused, exam-appropriate
 *
 * Uses Groq llama3-70b.
 */
const groq = require('../config/groq');

/**
 * Generate multi-level explanations for a concept.
 * @param {string} transcript - concept text
 * @returns {{ beginner: string, intermediate: string, examReady: string }}
 */
async function generateExplanation(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert tutor. The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the concept regardless of language.
Generate three levels of explanation in the SAME language as the transcript.

Return JSON:
{
  "beginner": "Detailed explanation using analogies and everyday language (at least 100 words), suitable for someone completely new to the topic",
  "intermediate": "In-depth technical explanation with proper terminology, formulas, and theory (at least 150 words), suitable for a student actively studying the subject",
  "examReady": "Comprehensive, definition-focused explanation covering all key aspects (at least 100 words), suitable for writing complete exam answers"
}

IMPORTANT: Each explanation level must be SUBSTANTIVE and DETAILED, not just one or two lines. Write as if you are tutoring a student who needs to fully understand the topic.
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Explain this concept at three levels:\n\n${transcript}`,
        },
      ],
      temperature: 0.4,
      max_tokens: 4096,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('[ExplanationEngine] Generation failed:', error.message);
    return {
      beginner: 'Explanation not available.',
      intermediate: 'Explanation not available.',
      examReady: 'Explanation not available.',
    };
  }
}

module.exports = { generateExplanation };
