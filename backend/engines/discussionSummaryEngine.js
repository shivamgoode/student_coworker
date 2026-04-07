/**
 * Discussion Summary Engine
 * Extracts discussion outcomes: tasks, deadlines, participants, decisions, action items.
 * Uses Groq llama3-70b.
 */
const groq = require('../config/groq');

/**
 * Extract structured discussion outcomes from conversation transcript.
 * @param {string} transcript - discussion transcript
 * @returns {{ task: string, deadline: string, participants: string[], decisions: string[], actionItems: string[] }}
 */
async function extractDiscussionOutcome(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a meeting outcome extractor. The conversation may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the meaning regardless of language.
Analyze the conversation and extract outcomes in the same language as the input:

Return JSON:
{
  "task": "Main task or topic discussed",
  "deadline": "Any mentioned deadline or 'Not specified'",
  "participants": ["person1", "person2"],
  "decisions": ["decision 1", "decision 2"],
  "actionItems": ["action 1", "action 2"]
}

Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Extract discussion outcomes:\n\n${transcript}`,
        },
      ],
      temperature: 0.2,
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('[DiscussionSummary] Extraction failed:', error.message);
    return {
      task: 'Discussion recorded',
      deadline: 'Not specified',
      participants: [],
      decisions: [],
      actionItems: [],
    };
  }
}

module.exports = { extractDiscussionOutcome };
