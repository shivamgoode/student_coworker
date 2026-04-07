const express = require('express');
const { translateText, translateNotes } = require('../engines/translationEngine');

const router = express.Router();

/** POST /api/translate/text — Translate plain text */
router.post('/text', async (req, res, next) => {
  try {
    const { text, targetLang } = req.body;
    if (!text) return res.status(400).json({ error: 'Text is required' });
    const result = await translateText(text, targetLang || 'hi');
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
});

/** POST /api/translate/notes — Translate structured notes */
router.post('/notes', async (req, res, next) => {
  try {
    const { notes, targetLang } = req.body;
    if (!notes) return res.status(400).json({ error: 'Notes object is required' });
    const translated = await translateNotes(notes, targetLang || 'hi');
    res.json({ success: true, notes: translated });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
