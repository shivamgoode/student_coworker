/**
 * Importance Detection Engine
 * Classifies speech transcript into importance categories using Groq llama3-8b.
 *
 * Categories: lecture, discussion, reminder, concept, casual, ignore
 */
const groq = require('../config/groq');

const CATEGORIES = ['lecture', 'discussion', 'reminder', 'concept', 'casual', 'ignore'];

/**
 * Classify the importance and type of a transcript segment.
 * @param {string} transcript - text to classify
 * @returns {{ classification: string, confidence: number, reasoning: string }}
 */
async function detectImportance(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an academic speech classifier. The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the meaning regardless of language and classify it into exactly ONE category:
- lecture: educational content being taught
- discussion: group conversation about academic topics
- reminder: mentions of deadlines, tasks, submissions, upcoming events, travel plans, occasions, functions, festivals, birthdays, meetings, exams, or any future date/event (e.g. "kal assignment submit karna hai", "deadline parso hai", "next week trip hai", "Monday ko party hai", "Diwali pe ghar jaana hai", "15 April ko exam hai", "bhai ki shaadi hai next month")
- concept: specific technical/scientific concept being explained
- casual: social/non-academic conversation with NO mention of any future event, plan, or date
- ignore: noise, unintelligible, or irrelevant

Return JSON: {"classification": "<category>", "confidence": <0-10>, "reasoning": "<brief reason>"}
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: transcript,
        },
      ],
      temperature: 0.1,
      max_tokens: 256,
    });

    const content = response.choices[0].message.content.trim();
    const result = JSON.parse(content);

    if (!CATEGORIES.includes(result.classification)) {
      result.classification = 'casual';
    }

    return result;
  } catch (error) {
    console.error('[ImportanceDetection] Classification failed:', error.message);
    return { classification: 'casual', confidence: 0, reasoning: 'Classification failed' };
  }
}

module.exports = { detectImportance, CATEGORIES };
