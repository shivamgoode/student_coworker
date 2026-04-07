/**
 * Visualization Trigger Engine
 * Detects whether a concept requires 3D visualization using Three.js.
 * Matches keywords and concept types to determine visualization needs.
 */
const groq = require('../config/groq');

const VISUALIZATION_KEYWORDS = {
  // English keywords
  'stack': { type: 'stack', scene: 'data-structure' },
  'queue': { type: 'queue', scene: 'data-structure' },
  'binary tree': { type: 'binary-tree', scene: 'data-structure' },
  'linked list': { type: 'linked-list', scene: 'data-structure' },
  'graph': { type: 'graph', scene: 'data-structure' },
  'array': { type: 'array', scene: 'data-structure' },
  'hash table': { type: 'hash-table', scene: 'data-structure' },
  'heap': { type: 'heap', scene: 'data-structure' },
  'solar system': { type: 'solar-system', scene: 'physics' },
  'atom': { type: 'atom', scene: 'chemistry' },
  'molecule': { type: 'molecule', scene: 'chemistry' },
  'network topology': { type: 'network', scene: 'networking' },
  'sorting': { type: 'sorting', scene: 'algorithm' },
  'dna': { type: 'dna', scene: 'biology' },
  'cell': { type: 'cell', scene: 'biology' },
  'wave': { type: 'wave', scene: 'physics' },
  'circuit': { type: 'circuit', scene: 'electronics' },
  // Hindi keywords (Devanagari)
  'स्टैक': { type: 'stack', scene: 'data-structure' },
  'कतार': { type: 'queue', scene: 'data-structure' },
  'बाइनरी ट्री': { type: 'binary-tree', scene: 'data-structure' },
  'लिंक्ड लिस्ट': { type: 'linked-list', scene: 'data-structure' },
  'ग्राफ': { type: 'graph', scene: 'data-structure' },
  'ऐरे': { type: 'array', scene: 'data-structure' },
  'हैश टेबल': { type: 'hash-table', scene: 'data-structure' },
  'हीप': { type: 'heap', scene: 'data-structure' },
  'सौर मंडल': { type: 'solar-system', scene: 'physics' },
  'परमाणु': { type: 'atom', scene: 'chemistry' },
  'अणु': { type: 'molecule', scene: 'chemistry' },
  'नेटवर्क टोपोलॉजी': { type: 'network', scene: 'networking' },
  'सॉर्टिंग': { type: 'sorting', scene: 'algorithm' },
  'छँटाई': { type: 'sorting', scene: 'algorithm' },
  'डीएनए': { type: 'dna', scene: 'biology' },
  'कोशिका': { type: 'cell', scene: 'biology' },
  'तरंग': { type: 'wave', scene: 'physics' },
  'परिपथ': { type: 'circuit', scene: 'electronics' },
  // Hinglish transliterations (common in spoken Hindi-English mix)
  'steak': { type: 'stack', scene: 'data-structure' },  // common mispronunciation in Hinglish
  'kyoo': { type: 'queue', scene: 'data-structure' },
};

/**
 * Detect if transcript content warrants a 3D visualization.
 * @param {string} transcript - concept text
 * @returns {{ shouldVisualize: boolean, concept: string, visualizationType: string, keywords: string[] }}
 */
async function detectVisualization(transcript) {
  const lowerText = transcript.toLowerCase();
  const matchedKeywords = [];

  // Keyword-based detection
  for (const [keyword, config] of Object.entries(VISUALIZATION_KEYWORDS)) {
    if (lowerText.includes(keyword)) {
      matchedKeywords.push({ keyword, ...config });
    }
  }

  if (matchedKeywords.length > 0) {
    const primary = matchedKeywords[0];
    return {
      shouldVisualize: true,
      concept: primary.keyword,
      visualizationType: primary.type,
      scene: primary.scene,
      keywords: matchedKeywords.map(k => k.keyword),
    };
  }

  // LLM fallback for complex concept detection
  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `Determine if this text describes a concept that benefits from 3D visualization.
The text may be in English, Hindi, or Hinglish (mixed Hindi-English). Understand the meaning regardless of language.
Return JSON: {"shouldVisualize": true/false, "concept": "concept name in English", "visualizationType": "type", "keywords": ["kw1"]}
Return ONLY valid JSON, no markdown.`,
        },
        { role: 'user', content: transcript },
      ],
      temperature: 0.1,
      max_tokens: 256,
    });

    return JSON.parse(response.choices[0].message.content.trim());
  } catch {
    return { shouldVisualize: false, concept: '', visualizationType: '', keywords: [] };
  }
}

module.exports = { detectVisualization, VISUALIZATION_KEYWORDS };
