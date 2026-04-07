/**
 * Reminder Detection Engine
 * Extracts tasks, deadlines, events, travel plans, occasions, and functions
 * from speech transcripts. Computes actual dates from relative expressions
 * using the current system date.
 * Uses Groq llama3-70b.
 */
const groq = require('../config/groq');

/**
 * Get current date info string for the LLM prompt.
 */
function getCurrentDateContext() {
  const now = new Date();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayName = days[now.getDay()];
  return `Today is ${dayName}, ${now.toISOString().split('T')[0]} (YYYY-MM-DD). Current time: ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}.`;
}

/**
 * Extract reminders and events from transcript.
 * @param {string} transcript - speech text
 * @returns {Array<{ task: string, deadline: string, eventDate: string, priority: string, category: string }>}
 */
async function extractReminders(transcript) {
  const dateContext = getCurrentDateContext();

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an intelligent reminder and event extractor. The text may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the meaning regardless of language.

${dateContext}

Extract ALL of the following from the text:
- Academic tasks: assignments, submissions, exams, deadlines, homework, projects
- Events & occasions: birthdays, weddings (shaadi), festivals (Diwali, Holi, Eid, etc.), parties, functions, ceremonies, gatherings
- Travel plans: trips, journeys, flights, train bookings, going home (ghar jaana), outings
- Meetings & appointments: doctor visits, interviews, group meetings, calls
- Personal tasks: shopping, packing, payments, registrations, bookings
- Any mention of a future date, day, or time

IMPORTANT — Date resolution rules:
- "kal" / "tomorrow" = the day after today
- "parso" / "day after tomorrow" = 2 days from today
- "narso" = 3 days from today
- "agle hafte" / "next week" = next Monday (or the mentioned day)
- "is hafte" / "this week" = the mentioned day within the current week
- "agle mahine" / "next month" = 1st of next month (or the mentioned date)
- Specific dates like "15 April", "20 tarikh" = compute the full YYYY-MM-DD
- Day names like "Monday ko", "Friday" = the next upcoming occurrence of that day
- If no date can be determined, use "Not specified" for deadline and null for eventDate

Return a JSON array:
[
  {
    "task": "description (in the same language as input)",
    "deadline": "human-readable date/time (e.g. 'Monday, 2026-04-06' or 'Not specified')",
    "eventDate": "YYYY-MM-DD or null if cannot be determined",
    "priority": "low|medium|high",
    "category": "academic|event|travel|meeting|personal|other"
  }
]

If no reminders or events found, return an empty array [].
Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Extract all reminders and events from:\n\n${transcript}`,
        },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    });

    const content = response.choices[0].message.content.trim();
    const reminders = JSON.parse(content);
    return Array.isArray(reminders) ? reminders : [];
  } catch (error) {
    console.error('[ReminderEngine] Extraction failed:', error.message);
    return [];
  }
}

module.exports = { extractReminders };
