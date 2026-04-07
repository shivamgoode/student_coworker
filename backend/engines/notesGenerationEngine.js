/**
 * Notes Generation Engine
 * Generates structured academic notes from lecture transcripts using Groq llama3-70b.
 *
 * Two modes:
 *   - generateNotes: quick notes from a single chunk (used during live accumulation)
 *   - generateComprehensiveNotes: detailed, full-length notes from a complete lecture transcript
 */
const groq = require('../config/groq');

/**
 * Generate quick structured notes from a single transcript chunk.
 * @param {string} transcript - lecture transcript text
 * @returns {Object} structured notes object
 */
async function generateNotes(transcript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are an expert academic note-taker. The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Understand the content regardless of language and convert it into structured notes.
Generate the notes in the SAME language as the transcript. If the transcript is in Hinglish, generate notes in Hinglish/Hindi.

Return a JSON object with these fields:
{
  "title": "Topic title",
  "definition": "Clear definition of the main concept",
  "bulletPoints": ["key point 1", "key point 2", ...],
  "examples": ["example 1", "example 2", ...],
  "applications": ["application 1", "application 2", ...],
  "examQuestions": ["potential question 1", "potential question 2", ...],
  "revisionSummary": "A concise summary for quick revision"
}

Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Generate structured notes from this lecture transcript:\n\n${transcript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2048,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('[NotesGeneration] Failed:', error.message);
    return {
      title: 'Untitled Notes',
      definition: transcript.substring(0, 200),
      bulletPoints: [transcript.substring(0, 100)],
      examples: [],
      applications: [],
      examQuestions: [],
      revisionSummary: transcript.substring(0, 150),
    };
  }
}

/**
 * Generate comprehensive, detailed notes from a FULL lecture transcript.
 * Called when a lecture session is finalized (all chunks accumulated).
 * Produces in-depth, exam-ready notes with subtopics, key terms, detailed explanations, etc.
 * @param {string} fullTranscript - the complete accumulated lecture transcript
 * @returns {Object} comprehensive notes object
 */
async function generateComprehensiveNotes(fullTranscript) {
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a world-class academic note-taker creating COMPREHENSIVE, DETAILED lecture notes that a student can use to study the entire topic without needing anything else.

The transcript may be in English, Hindi (Devanagari), or Hinglish (mixed Hindi-English). Generate notes in the SAME language as the transcript.

You MUST generate LONG, THOROUGH, DETAILED notes. Do NOT summarize briefly. Treat this as if you are writing a full chapter of a textbook from the lecture. Cover EVERY concept, EVERY example, and EVERY explanation the lecturer mentioned.

Return a JSON object with ALL these fields (every field must be detailed and substantive):
{
  "title": "Full topic title",
  "definition": "Detailed, multi-sentence definition of the main concept/topic. At least 3-4 sentences explaining what it is, why it matters, and where it fits in the subject.",
  "detailedExplanation": "A thorough, multi-paragraph explanation of the entire lecture content. This should be 300-500 words minimum. Cover the core theory, how it works, why it's important, historical context if mentioned, and how different parts connect to each other. Write it like a textbook section.",
  "subtopics": [
    {
      "name": "Subtopic name",
      "explanation": "Detailed explanation of this subtopic (at least 2-3 sentences)",
      "keyPoints": ["important point 1", "important point 2", ...]
    }
  ],
  "bulletPoints": ["detailed key point 1 (full sentence, not fragments)", "detailed key point 2", ...],
  "keyTerms": [
    {"term": "technical term", "meaning": "clear definition of this term"}
  ],
  "examples": ["detailed example 1 with full context and explanation", "detailed example 2", ...],
  "applications": ["real-world application 1 with explanation", "application 2", ...],
  "examQuestions": [
    "Detailed potential exam question 1 (with enough context to be a real exam question)",
    "Question 2",
    "Question 3"
  ],
  "revisionSummary": "A comprehensive revision summary (at least 150 words) covering all major points of the lecture in a way that a student can quickly revise before an exam."
}

IMPORTANT RULES:
- Generate AT LEAST 5-8 bullet points
- Generate AT LEAST 3-5 subtopics (each with 2+ key points)
- Generate AT LEAST 3-5 key terms with definitions
- Generate AT LEAST 2-3 detailed examples
- Generate AT LEAST 2-3 applications
- Generate AT LEAST 3-5 exam questions
- The detailedExplanation MUST be at least 300 words
- The revisionSummary MUST be at least 150 words
- Do NOT write one-liners. Every field should be SUBSTANTIVE and DETAILED.
- If the lecturer gave an analogy, include it. If they mentioned a formula, include it. Miss NOTHING.

Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Generate comprehensive, detailed lecture notes from this FULL lecture transcript. Cover every topic, subtopic, example, and explanation mentioned:\n\n${fullTranscript}`,
        },
      ],
      temperature: 0.3,
      max_tokens: 8192,
    });

    const content = response.choices[0].message.content.trim();
    return JSON.parse(content);
  } catch (error) {
    console.error('[NotesGeneration] Comprehensive notes failed:', error.message);
    // Fallback to regular notes if comprehensive generation fails
    return generateNotes(fullTranscript);
  }
}

module.exports = { generateNotes, generateComprehensiveNotes };
