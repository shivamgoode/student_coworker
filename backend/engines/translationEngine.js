/**
 * Translation Engine
 * Translates notes and text between English and Hindi.
 * Uses Groq llama3.
 */
const groq = require('../config/groq');

/**
 * Translate text to the target language.
 * @param {string} text - text to translate
 * @param {string} targetLang - 'hi' for Hindi, 'en' for English
 * @returns {{ translated: string, sourceLang: string, targetLang: string }}
 */
async function translateText(text, targetLang = 'hi') {
  const langNames = { en: 'English', hi: 'Hindi' };
  const sourceLang = targetLang === 'hi' ? 'en' : 'hi';

  try {
    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'system',
          content: `You are a professional translator. Translate the following text from ${langNames[sourceLang]} to ${langNames[targetLang]}.
Maintain the original formatting, structure, and meaning.
If the text contains JSON or structured data, translate only the text values, not the keys.
Return ONLY the translated text, nothing else.`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      temperature: 0.2,
      max_tokens: 2048,
    });

    return {
      translated: response.choices[0].message.content.trim(),
      sourceLang,
      targetLang,
    };
  } catch (error) {
    console.error('[TranslationEngine] Translation failed:', error.message);
    return { translated: text, sourceLang, targetLang };
  }
}

/**
 * Translate a structured notes object.
 * @param {Object} notes - notes object with fields to translate
 * @param {string} targetLang - target language code
 * @returns {Object} translated notes
 */
async function translateNotes(notes, targetLang = 'hi') {
  const fieldsToTranslate = ['title', 'definition', 'revisionSummary'];
  const arrayFieldsToTranslate = ['bulletPoints', 'examples', 'applications', 'examQuestions'];
  const translated = { ...notes };

  for (const field of fieldsToTranslate) {
    if (notes[field]) {
      const result = await translateText(notes[field], targetLang);
      translated[field] = result.translated;
    }
  }

  for (const field of arrayFieldsToTranslate) {
    if (Array.isArray(notes[field]) && notes[field].length > 0) {
      const combined = notes[field].join('\n---\n');
      const result = await translateText(combined, targetLang);
      translated[field] = result.translated.split('\n---\n').map(s => s.trim());
    }
  }

  translated.language = targetLang;
  return translated;
}

module.exports = { translateText, translateNotes };
